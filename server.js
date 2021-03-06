const shuffle = require('./utilities/shuffle');
const rank = require('./algorithm/rank');
const userController = require('./app_controller/userController');
const tableController = require('./app_controller/tableController');
const gameController = require('./app_controller/gameController');
const shortid = require('shortid');
let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const config = require('./config.js');
const io = require('socket.io')(process.env.PORT || 3000);

console.log("server Connected");

mongoose.connect(config.database, function(error) {
    if (error) {
        console.log('Please make sure mongoDB is running');
        throw error;
    } else {
        console.log('Mongo is running');
    }
});

let deck_of_cards = shuffle();

let players = [];
let playersCount = 0;
let allRooms = {};
let tableValue = {
    money: 0
};
let i = 0;
io.on('connection', function(socket) {
    console.log("Client Connected");
    let playerName = "";
    let playerValue = "";
    let playerObjectId = "";
    let winnerDecided = false;
    let player = {};
    let playerId = "";
    let roomName = "";
    let currentSocket;
    let currentBootValue;
    let gameId = "";

    socket.on('SignUp', function(data) {
        userController.insert(data)
            .then(successData => {
                console.log(`SignupSuccess`);
                playerName = successData.userName;
                playerValue = successData.currentMoney;
                playerObjectId = successData._id;
                socket.emit('signupSuccess', successData);
            })
            .catch(error => {
                socket.emit('error', { error: "Something wrong has happened. Try again." })
            });

    });

    socket.on('Login', function(data) {
        userController.findUser(data)
            .then(successData => {
                playerName = successData.userName;
                playerValue = successData.currentMoney;
                playerObjectId = successData._id;
                console.log(successData)
                socket.emit('loginSuccess', successData);
            })
            .catch(error => {
                console.log(error);
                socket.emit('error', { error: error });
            });

    });

    socket.on('play', function(data) {
        //console.log(data);
        playerId = shortid.generate();
        roomName = data.name;
        currentSocket = roomName;
        let newTable = data.newTable;
        if (newTable == true) {
            allRooms[roomName] = {};
            allRooms[roomName].bootValue = data.bootValue;
            currentBootValue = allRooms[roomName].bootValue;
            allRooms[roomName].plotValue = data.plotValue;
            allRooms[roomName].activePlayers = 1;
            allRooms[roomName].gameRunning = false;
            allRooms[roomName].playing = [];
            allRooms[roomName].waiting = [];
            allRooms[roomName].playing.push(player);

            player.status = "playing";
            allRooms[roomName].deck_of_cards = shuffle();
            socket.join(roomName);
            /**
             * 
             * This emit will show other new players realtime new tables to join
             * 
             */
            emitRoom()
                .then((rooms) => {
                    io.emit('showTable', rooms);
                }).catch((error) => {
                    socket.broadcast.emit('error', { error: error });
                });

            /**
             * This 40secs timer will start when firstplayer create a new table.
             * After 40secs it will reject or approve that table.
             */
            setTimeout(() => {
                console.log("Timer Function Executed");
                if (allRooms[roomName].activePlayers > 1) {
                    allRooms[roomName].gameRunning = true;
                    let returnData = { playerId: playerId, restartGame: false }
                    console.log(roomName);
                    let saveTableData = {
                        tableName: roomName,
                        initialBootValue: allRooms[roomName].bootValue,
                        plotValue: allRooms[roomName].plotValue
                    }
                    tableController.insert(saveTableData)
                        .then(successData => {
                            console.log('Table Data Save in DB');
                            io.to(roomName).emit('approveTable', { returnData });
                        })
                        .catch(error => {
                            console.log("Error while Saving table in DB: " + error);
                            delete(allRooms[currentSocket]);
                            socket.emit('rejectTable');
                        });
                } else if (allRooms[roomName].activePlayers == 1) {
                    delete(allRooms[currentSocket]);
                    socket.emit('rejectTable');
                }
            }, 40000);
        } else if (newTable == false) {

            if (allRooms[roomName].activePlayers < 5) {


                if (player.room != undefined) {
                    socket.leave(player.room);
                }
                socket.join(roomName);
                allRooms[roomName].activePlayers += 1;

                if (allRooms[roomName].gameRunning == true) {
                    allRooms[roomName].waiting.push(player);
                    player.status = "waiting";
                } else {

                    allRooms[roomName].playing.push(player);
                    player.status = "playing";

                }
            } else {
                // socket.emit('error', { error: "Room full" });
            }

        }

        if (currentSocket != undefined) {

            let unsorted_deck_of_cards = allRooms[roomName].deck_of_cards.slice(0, 3);
            allRooms[roomName].sorted_deck_of_cards = unsorted_deck_of_cards.sort(function(a, b) {
                return (a['number'] < b['number']) ? -1 : (a['number'] > b['number']) ? 1 : 0;
            });

            player.id = playerId;
            player.name = playerName;
            player.player_value = playerValue;
            player.card1 = allRooms[roomName].sorted_deck_of_cards[0];
            player.card2 = allRooms[roomName].sorted_deck_of_cards[1];
            player.card3 = allRooms[roomName].sorted_deck_of_cards[2];
            player.room = roomName;
            player.cardSeen = false;
            player.standup = false;
            player.playerObjectId = playerObjectId;
            players.push(player);
            allRooms[roomName].deck_of_cards.splice(0, 3);
            let i_data = {
                table_data: tableValue,
                player_data: player
            };
            1
            socket.emit('connectionBegin', i_data);
        }

    });

    socket.on('findWinner', function(data) {
        let winner, winnerName;
        rank(allRooms[currentSocket].playing)
            .then(foundWinner => {
                winner = foundWinner;
                winnerDecided = true;

                io.to(roomName).emit('showWinner', { winner });

                allRooms[currentSocket].gameRunning = false;

                console.log(winner.name + " is the winner");

                /**
                 * update final money to DB
                 */

                for (let i = 0; i < allRooms[currentSocket].activePlayers; i++) {
                    const gameData = {
                        gameId: gameId,
                        playerId: allRooms[currentSocket].playing[i].playerObjectId,
                        finalMoney: allRooms[currentSocket].playing[i].playerValue
                    }
                    gameController.update(gameData)
                        .then(successData => {
                            console.log("Updated Game with data:")
                            console.log(successData);
                        })
                        .catch(error => {
                            console.log("NOT updated game with ERROR:")
                            console.log(error);
                        })

                };

                /**
                 * Now, New game have to restart. 
                 */

                restartNewGame();



            })
            .catch(error => {
                io.to(roomName).emit('error', { error: error });
            });
    });

    /**
     * event respond to every new restart game.
     */
    let restartNewGame = function() {
        if (allRooms[currentSocket].activePlayers != 0 && (allRooms[currentSocket].playing.length + allRooms[currentSocket].waiting.length <= 5)) {


            setTimeout(() => {
                if (allRooms[roomName] != undefined) {
                    if (allRooms[roomName].activePlayers > 1) {
                        allRooms[roomName].gameRunning = true;
                        winnerDecided = false;
                        let tempWait = [];
                        /**
                         * First filter playing array and then waiting array. Remove those players having Standup = 1
                         */
                        allRooms[currentSocket].playing = allRooms[currentSocket].playing.filter(playerObj => {
                            if (playerObj.standup != undefined && playerObj.standup == true) {
                                tempWait.push(playerObj);
                                return false;
                            } else {
                                return true;
                            }
                        });

                        if (allRooms[currentSocket].waiting.length != 0) {
                            allRooms[currentSocket].waiting = allRooms[currentSocket].waiting.filter(playerObj => {
                                if (playerObj.standup != undefined && playerObj.standup == true) {
                                    tempWait.push(playerObj);
                                    return false;
                                } else {
                                    allRooms[currentSocket].playing.push(playerObj);
                                    return true;
                                }
                            });
                            allRooms[currentSocket].waiting = [];
                        }
                        if (tempWait.length != 0) {
                            tempWait.forEach(player => {
                                allRooms[currentSocket].waiting.push(player);
                            });
                            tempWait = [];
                        }
                        currentBootValue = allRooms[currentSocket].bootValue;
                        tableValue.money = 0;
                        allRooms[currentSocket].deck_of_cards = shuffle();

                        for (let i = 0; i < allRooms[currentSocket].activePlayers; i++) {

                            let unsorted_deck_of_cards = allRooms[currentSocket].deck_of_cards.slice(0, 3);
                            allRooms[currentSocket].sorted_deck_of_cards = unsorted_deck_of_cards.sort(function(a, b) {
                                return (a['number'] < b['number']) ? -1 : (a['number'] > b['number']) ? 1 : 0;
                            });
                            allRooms[currentSocket].playing[i].card1 = allRooms[currentSocket].sorted_deck_of_cards[0];
                            allRooms[currentSocket].playing[i].card2 = allRooms[currentSocket].sorted_deck_of_cards[1];
                            allRooms[currentSocket].playing[i].card3 = allRooms[currentSocket].sorted_deck_of_cards[2];
                            allRooms[currentSocket].playing[i].cardSeen = false;
                            allRooms[currentSocket].playing[i].status = "playing";
                            allRooms[roomName].deck_of_cards.splice(0, 3);

                            const gameData = {
                                tableName: currentSocket,
                                playerId: allRooms[currentSocket].playing[i].playerObjectId,
                                initialMoney: allRooms[currentSocket].playing[i].playerValue
                            }
                            gameController.insert(gameData)
                                .then(successData => {
                                    console.log("New Game Saved with data:")
                                    console.log(successData);
                                    let returnData = {
                                        playerId: allRooms[currentSocket].playing[0].id,
                                        restartGame: true,
                                        players: allRooms[currentSocket].playing,
                                        bootValue: allRooms[currentSocket].bootValue,
                                        plotValue: allRooms[currentSocket].plotValue,
                                    }
                                    console.log(allRooms[currentSocket].playing);
                                    gameId = successData._id;
                                    io.to(roomName).emit('approveTable', { returnData });
                                })
                                .catch(error => {
                                    console.log("New Game NOT Saved with ERROR:")
                                    console.log(error);
                                })

                        }



                    } else if (allRooms[roomName].activePlayers == 1) {
                        delete(allRooms[currentSocket]);
                        socket.emit('rejectTable');
                    }
                }
            }, 20000);


        }
    }




    socket.on('nextTurn', function(data) {
        if (i >= allRooms[roomName].playing.length) {
            i = 0;
        }
        if (!winnerDecided) {

            io.to(roomName).emit('playerTurn', { id: allRooms[roomName].playing[i++].id });
        }
    });

    socket.on('move', function(data) {
        tableValue.money = data.tableValue;
        player.player_value = data.playerValue;
        console.log('Client moved ');
        let chip_value = data.chipValue;
        if (player.cardSeen == false && chip_value == 2 * currentBootValue ||
            player.cardSeen == true && chip_value == 4 * currentBootValue) {
            currentBootValue *= 2;
            socket.broadcast.to(currentSocket).emit(changeBootValue, { currentBootValue: currentBootValue });
        }
        let resdata = {
            tableValue: tableValue.money,
            playerID: player.id,
            playerValue: player.player_value,
            chipValue: chip_value,
            bootValue: currentBootValue
        };
        console.log('Client moved Table Value : ' + resdata.playerID);
        socket.broadcast.to(roomName).emit('move', resdata);

        //socket.broadcast.emit('moveChip');

    });

    socket.on('newPlayerAdd', function(data) {

        if (player.status == "playing") {
            let n_res_data = {
                playerID: player.id,
                playerName: player.name,
                playerValue: data.playerValue
            };
            socket.broadcast.to(roomName).emit('newPlayerAdd', n_res_data);

        }
        allRooms[roomName].playing.forEach(player => {

            if (playerId == player.id)
                return;
            let playerToAdd = {
                playerID: player.id,
                playerName: player.name,
                playerValue: player.player_value
            };
            console.log('New player connected with Data:and ROOM' + JSON.stringify(playerToAdd));
            console.log('ROOMS Now= ', allRooms[roomName])
            socket.emit('newPlayerAdd', playerToAdd);
        });

    });

    socket.on('cardSeen', function(data) {
        player.cardSeen = true;
        socket.broadcast.to(roomName).emit('cardSeen', { id: playerId });
    });

    socket.on('updateTableValue', function(data) {
        tableValue.money = data.tableValue;
        socket.broadcast.to(roomName).emit('move', tableValue);
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));

    });

    let emitRoom = function() {
        let keys = [];
        let availableRooms = [];
        availableRooms = Object.keys(allRooms).filter(key => {
            if (allRooms[key].activePlayers < 5) return key;
        }).reduce((obj, key) => {
            obj[key] = allRooms[key];
            keys.push(key);
            return obj;
        }, {});
        rooms = {
            keys: keys,
            availableRooms
        };

        console.log(rooms);

        return new Promise((resolve, reject) => {
            if (rooms != undefined) {
                return resolve(rooms);
            } else {
                return reject("Rooms not created");
            }
        });

    }
    socket.on('showTable', function(data) {
        emitRoom().then((rooms) => {
            socket.emit('showTable', rooms);
        }).catch((error) => {
            socket.emit('error', { error: error });
        });
    });
    socket.on('joinRoom', function(data) {
        let roomName = data.roomName;
        if (currentSocket != undefined) {
            socket.leave(currentSocket);
        }
        socket.join(roomName);
        currentSocket = roomName;
        allRooms[roomName].activePlayers += 1;
    });

    socket.on('onPack', function(data) {
        let packingPlayer = {};
        packingPlayer.id = data.playerId;
        allRooms[currentSocket].playing = allRooms[currentSocket].playing.filter(playerObj => {
            if (packingPlayer.id == playerObj.id) {
                packingPlayer = playerObj
            }
            return playerObj.id != packingPlayer.id;

        });

        allRooms[currentSocket].waiting.push(packingPlayer);

    });

    socket.on('changeTable', function(data) {
        if (allRooms[currentSocket] != undefined && allRooms[currentSocket].playing != undefined) {
            allRooms[currentSocket].playing = allRooms[currentSocket].playing.filter(playerObj => playerObj.id != playerId);
            allRooms[currentSocket].activePlayers--;
            if (allRooms[currentSocket].activePlayers == 0) {
                delete(allRooms[currentSocket]);
            }

            /**
             * update final money to DB
             */

            const gameData = {
                gameId: gameId,
                playerId: player.playerObjectId,
                finalMoney: player.playerValue
            }
            gameController.update(gameData)
                .then(successData => {
                    console.log("Updated Game with data:")
                    console.log(successData);
                    socket.broadcast.to(roomName).emit('disconnected', { id: playerId });

                })
                .catch(error => {
                    console.log("NOT updated game with ERROR:")
                    console.log(error);
                })



        }
    });

    socket.on('standupTable', function() {
        standupFlag = true;
        for (let i = 0; i < allRooms[currentSocket].playing.length; i++) {
            if (allRooms[currentSocket].playing[i].id == playerId) {
                allRooms[currentSocket].playing[i].standup = true;
                break;
            }
        }
    });

    socket.on('sitTable', function() {
        for (let i = 0; i < allRooms[currentSocket].playing.length; i++) {
            if (allRooms[currentSocket].playing[i].id == playerId) {
                allRooms[currentSocket].playing[i].standup = false;
                break;
            }
        }
    });


    socket.on('disconnect', function() {
        players.splice(players.indexOf(playerId), 1);
        /**
         * update final money to DB
         */
        if(gameId != ""){
            const gameData = {
                gameId: gameId,
                playerId: player.playerObjectId,
                finalMoney: player.playerValue
            }
            gameController.update(gameData)
                .then(successData => {
                    console.log("Updated Game with data:")
                    console.log(successData);
    
                })
                .catch(error => {
                    console.log("NOT updated game with ERROR:")
                    console.log(error);
                })
        }

        if (allRooms[currentSocket] != undefined && allRooms[currentSocket].playing != undefined) {
            allRooms[currentSocket].playing = allRooms[currentSocket].playing.filter(playerObj => playerObj.id != playerId);
            allRooms[currentSocket].activePlayers--;
            if (allRooms[currentSocket].activePlayers == 0) {
                delete(allRooms[currentSocket]);
            }

        }



        if (players.length == 0) {
            tableValue.money = 0;
        }

        console.log("Player Disconnected");
        socket.broadcast.to(roomName).emit('disconnected', { id: playerId });
    });

});
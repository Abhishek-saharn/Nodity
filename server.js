const shuffle = require('./utilities/shuffle');
const rank = require('./algorithm/rank');
const userController = require('./app_controller/userController');
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
    let winnerDecided = false;
    let nextTurn = false;
    let player = {};
    let playerId = "";
    let roomName = "";
    let currentSocket;

    socket.on('SignUp', function(data) {
        userController.insert(data)
            .then(successData => {
                console.log(`SignupSuccess`);
                playerName = successData.userName;
                playerValue = successData.currentMoney;
                //console.log(player)
                socket.emit('signupSuccess', successData);
            })
            .catch(error => {
                socket.emit('error', { error: "Something wrong has happened. Try again." })
            });

    });

    socket.on('Login', function(data) {
        userController.find(data)
            .then(successData => {
                playerName = successData.userName;
                playerValue = successData.currentMoney;
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
            allRooms[roomName].plotValue = data.plotValue;
            allRooms[roomName].activePlayers = 1;
            allRooms[roomName].gameRunning = false;
            allRooms[roomName].playing = [];
            allRooms[roomName].waiting = [];
            allRooms[roomName].playing.push(player);
            player.status = "playing";
            allRooms[roomName].deck_of_cards = shuffle();
            socket.join(roomName);
            emitRoom()
                .then((rooms) => {
                    socket.broadcast.emit('showTable', rooms);
                }).catch((error) => {
                    socket.broadcast.emit('error', { error: error });
                });
            setTimeout(() => {
                if (allRooms[roomName].activePlayers > 1) {
                    allRooms[roomName].gameRunning = true;
                    socket.emit('approveTable');
                } else if (allRooms[roomName].activePlayers == 1) {
                    socket.emit('rejectTable');
                }
            }, 15000)
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
                socket.emit('error', { error: "Room full" });
            }

        }

        // Crop first three elements and and push them to after sorting.

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
            players.push(player);
            console.log(players);
            allRooms[roomName].deck_of_cards.splice(0, 3);
            let i_data = {
                table_data: tableValue,
                player_data: player
            };
            socket.emit('connectionBegin', i_data);
        }

    });

    socket.on('findWinner', function(data) {
        let winner, winnerName;
        rank(allRooms[currentSocket].playing)
            .then(foundWinner => {
                winner = foundWinner;
                allRooms[currentSocket].playing.push(allRooms[currentSocket].waiting);
                allRooms[currentSocket].waiting = [];
                winnerDecided = true;
                let playingArray = allRooms[currentSocket].playing;
                for (let i = 0; i < playingArray.length; i++) {
                    if (playingArray[i].id == winner) {
                        winnerName = playingArray[i].name;
                        break;
                    }
                }
                io.to(roomName).emit('showWinner', { winnerName: winnerName });

                console.log(winner + " is the winner");

            })
            .catch(error => {
                io.to(roomName).emit('error', { error: error });
            });
    });

    socket.on('nextTurn', function(data) {
        if (i == allRooms[roomName].playing.length) {
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
        if (player.cardSeen == false && chip_value == 2 * allRooms[currentSocket].bootValue ||
            player.cardSeen == true && chip_value == 4 * allRooms[currentSocket].bootValue) {
            allRooms[currentSocket].bootValue *= 2;
        }
        let resdata = {
            tableValue: tableValue.money,
            playerID: player.id,
            playerValue: player.player_value,
            chipValue: chip_value,
            bootValue: allRooms[currentSocket].bootValue
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

    socket.on('createNewRoom', function(data) {

        // console.log(socket.allRooms[1])

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

    socket.on('disconnect', function() {
        players.splice(players.indexOf(playerId), 1);

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
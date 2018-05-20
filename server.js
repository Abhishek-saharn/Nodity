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
        console.log('Please make sure mongo DB is running');
        throw error;
    } else {
        console.log('Mongo is running');
    }
});

let deck_of_cards = shuffle();

let players = [];
let playersCount = 0;
let availableRooms = {};
let fullRooms = {};
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
                socket.emit('error', { errorMessage: "Something wrong has happened. Try again." })
            });

    });

    socket.on('Login', function(data) {
        userController.find(data)
            .then(successData => {
                playerName = successData.userName;
                playerValue = successData.currentMoney;
                //console.log(player)
                socket.emit('loginSuccess', successData);
            })
            .catch(error => {
                console.log(error);
                socket.emit('error', { errorMessage: error });
            })

    });

    socket.on('play', function(data) {
        //console.log(data);
        playerId = shortid.generate();
        roomName = data.name;
        let newTable = data.newTable;
        if (newTable == true) {
            availableRooms[roomName] = {};
            availableRooms[roomName].bootValue = data.bootValue;
            availableRooms[roomName].plotValue = data.plotValue;
            availableRooms[roomName].activePlayers = 1;
            availableRooms[roomName].gameRunning = false;
            availableRooms[roomName].playing = [];
            availableRooms[roomName].waiting = [];
            availableRooms[roomName].playing.push(playerId);
            availableRooms[roomName].deck_of_cards = shuffle();
            socket.join(roomName);
        } else if (newTable == false) {

            let currentSocket = socket.rooms[Object.keys(socket.rooms)[1]];
            if (currentSocket != undefined) {
                socket.leave(currentSocket);
            }
            socket.join(roomName);
            availableRooms[roomName].activePlayers += 1;
            if (availableRooms[roomName].activePlayers == 2) {
                availableRooms[roomName].gameRunning = true;
                availableRooms[roomName].playing.push(playerId);
            }
            if (availableRooms[roomName].gameRunning == true) {
                availableRooms[roomName].waiting.push(playerId);
            }
            if (availableRooms[roomName].activePlayers == 5) {
                fullRooms[roomName] = availableRooms[roomName];
                delete availableRooms[roomName];
            }
        }

        console.log(`Socket's room name is ${socket.rooms[Object.keys(socket.rooms)[1]]}`);
        let currentSocket = roomName;
        console.log(availableRooms);

        // Crop first three elements and and push them to after sorting.

        if (currentSocket != undefined) {

            let unsorted_deck_of_cards = availableRooms[roomName].deck_of_cards.slice(0, 3);
            availableRooms[roomName].sorted_deck_of_cards = unsorted_deck_of_cards.sort(function(a, b) {
                return (a['number'] < b['number']) ? -1 : (a['number'] > b['number']) ? 1 : 0;
            });

            player.id = playerId;
            player.name = playerName;
            player.player_value = playerValue;
            player.card1 = availableRooms[roomName].sorted_deck_of_cards[0];
            player.card2 = availableRooms[roomName].sorted_deck_of_cards[1];
            player.card3 = availableRooms[roomName].sorted_deck_of_cards[2];
            player.room = roomName;
            players.push(player);
            console.log(players);
            availableRooms[roomName].deck_of_cards.splice(0, 3);

            let i_data = {
                table_data: tableValue,
                player_data: player
            };
            socket.emit('connectionBegin', i_data);
        }

    });

    socket.on('findWinner', function(data) {
        let winner = rank(players);
        winnerDecided = true;
        console.log(winner + " is the winner");
    });
    socket.on('nextTurn', function(data) {
        if (i == availableRooms[roomName].playing.length) {
            i = 0;
        }
        if (!winnerDecided) {
            console.log(availableRooms[roomName].playing[i++].id);
            i--;
            io.to(roomName).emit('playerTurn', { id: availableRooms[roomName].playing[i++].id });
        }

    });

    socket.on('move', function(data) {
        tableValue.money = data.tableValue;
        player.player_value = data.playerValue;
        console.log('Client moved ');
        let chip_value = data.chipValue;
        let resdata = {
            tableValue: tableValue.money,
            playerID: player.id,
            playerValue: player.player_value,
            chipValue: chip_value
        };
        console.log('Client moved Table Value : ' + resdata.playerID);
        socket.broadcast.to(roomName).emit('move', resdata);

        //socket.broadcast.emit('moveChip');

    });

    socket.on('newPlayerAdd', function(data) {
        let n_res_data = {
            playerID: player.id,
            playerName: player.name,
            playerValue: data.playerValue
        };
        socket.broadcast.to(roomName).emit('newPlayerAdd', n_res_data);
        availableRooms[roomName].playing.forEach(player => {

            if (playerId == player.id)
                return;
            let playerToAdd = {
                playerID: player.id,
                playerName: player.name,
                playerValue: player.player_value
            };
            console.log('New player connected with Data:' + JSON.stringify(playerToAdd));

            socket.emit('newPlayerAdd', playerToAdd);
        });

    });

    socket.on('cardSeen', function(data) {
        socket.broadcast.to(roomName).emit('cardSeen', { id: playerId });
    });

    socket.on('updateTableValue', function(data) {
        tableValue.money = data.tableValue;
        socket.broadcast.to(roomName).emit('move', tableValue);
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));

    });

    socket.on('createNewRoom', function(data) {

        // console.log(socket.availableRooms[1])

    });
    socket.on('showTable', function(data) {
        /**
         * Dummy data for testing purpose.
         */
        dummyRoom = {
                name1: {
                    bootValue: 10,
                    activePlayers: 3,
                },
                name2: {
                    bootValue: 50,
                    activePlayers: 4,
                }
            }
            /** */
        let keys = Object.keys(availableRooms);
        rooms = {
            keys: keys,
            availableRooms

        };
        console.log(rooms);

        socket.emit('showTable', rooms);
    });
    socket.on('joinRoom', function(data) {
        let roomName = data.roomName;
        let currentSocket = socket.rooms[Object.keys(socket.rooms)[1]];
        if (currentSocket != undefined) {
            socket.leave(currentSocket);
        }
        socket.join(roomName);
        availableRooms[roomName].activePlayers += 1;
    });

    socket.on('disconnect', function() {
        players.splice(players.indexOf(playerId), 1);
        if (players.length == 0) {
            tableValue.money = 0;
        }

        console.log("Player Disconnected");
        socket.broadcast.to(roomName).emit('disconnected', { id: playerId });
    });

});
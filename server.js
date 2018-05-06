const shuffle = require('./utilities/shuffle');
const rank = require('./algorithm/rank');
const userController = require('./app_controller/userController');
const shortid = require('shortid');
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const config = require('./config.js');
const io = require('socket.io')(process.env.PORT || 3000);

console.log("server Connected");

mongoose.connect(config.database, function(error) {
    if (error) {
        console.log('Please make sure mongo DB is running');
        throw error;
    } else {
        console.log('Mongo is running')
    }
});

var deck_of_cards = shuffle();

var players = [];
var playersCount = 0;

var tableValue = {
    money: 0
};

io.on('connection', function(socket) {
    console.log("Client Connected");
    let playerName = "";
    let playerValue = "";
    let winnerDecided = false;
    let nextTurn = false;

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
                console.log(successData);
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

        var playerId = shortid.generate();
        // Crop first three elements and and push them to after sorting.
        var unsorted_deck_of_cards = deck_of_cards.slice(0, 3);
        sorted_deck_of_cards = unsorted_deck_of_cards.sort(function(a, b) {
            return (a['number'] < b['number']) ? -1 : (a['number'] > b['number']) ? 1 : 0;
        });

        var player = {
            id: playerId,
            name: playerName,
            player_value: playerValue,
            card1: sorted_deck_of_cards[0],
            card2: sorted_deck_of_cards[1],
            card3: sorted_deck_of_cards[2],

        };
        players.push(player);
        console.log(players);
        deck_of_cards.splice(0, 3);

        var i_data = {
            table_data: tableValue,
            player_data: player
        };
        socket.emit('connectionBegin', i_data);
        // let playersForMove = players,
        //     i = 0;
        // while (!winnerDecided) {
        //     if (nextTurn) {
        //         socket.emit('playerTurn', { id: playersForMove[i++].id });
        //     }
        //     if (i == playersForMove.length) {
        //         i = 0;
        //     }
        // }


    });

    socket.on('findWinner', function(data) {
        var winner = rank(players);
        winnerDecided = true;
        console.log(winner + " is the winner");
    });
    let i = 0;
    socket.on('nextTurn', function(data) {
        if (i == players.length) {
            i = 0;
        }
        if (!winnerDecided) {
            io.emit('playerTurn', { id: players[i++].id });
        }

    });

    socket.on('move', function(data) {
        tableValue.money = data.tableValue;
        player.player_value = data.playerValue;
        console.log('Client moved ');
        var chip_value = data.chipValue;
        var resdata = {
            tableValue: tableValue.money,
            playerID: player.id,
            playerValue: player.player_value,
            chipValue: chip_value
        };
        console.log('Client moved Table Value : ' + resdata.playerID);
        socket.broadcast.emit('move', resdata);

        //socket.broadcast.emit('moveChip');

    });

    socket.on('newPlayerAdd', function(data) {
        var n_res_data = {
            playerID: player.id,
            playerName: player.name,
            playerValue: data.playerValue
        };
        socket.broadcast.emit('newPlayerAdd', n_res_data);
        players.forEach(player => {

            if (playerId == player.id)
                return;
            var playerToAdd = {
                playerID: player.id,
                playerName: player.name,
                playerValue: player.player_value
            };
            console.log('Client connected with Data:' + JSON.stringify(playerToAdd));

            socket.emit('newPlayerAdd', playerToAdd);
        });

    });

    socket.on('updateTableValue', function(data) {
        tableValue.money = data.tableValue;
        socket.broadcast.emit('move', tableValue);
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));

    });

    socket.on('disconnect', function() {
        players.splice(players.indexOf(playerId), 1);
        if (players.length == 0) {
            tableValue.money = 0;
        }
        console.log("Player Disconnected");
        socket.broadcast.emit('disconnected', { id: playerId });
    });

});
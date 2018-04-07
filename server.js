var shuffle = require('./utilities/shuffle');
var rank = require('./algorithm/rank');
var shortid = require('shortid');
var io = require('socket.io')(process.env.PORT || 3000);
console.log("server Connected");

var deck_of_cards = shuffle();

var players = [];
var playersCount = 0;

var tableValue = {
    money: 0
};

io.on('connection', function(socket) {
    console.log("Client Connected");


    var playerId = shortid.generate();


    // var player = {
    //     id: playerId,
    //     card1: { number: 9, suit: 'c', index: 2, color: 'black' },
    //     card2: { number: 11, suit: 'h', index: 1, color: 'red' },
    //     card3: { number: 14, suit: 'd', index: 5, color: 'black' },
    //     rank: undefined
    // };
    var unsorted_deck_of_cards = deck_of_cards.slice(0, 3);
    sorted_deck_of_cards = unsorted_deck_of_cards.sort(function(a, b) {
        return (a['number'] < b['number']) ? -1 : (a['number'] > b['number']) ? 1 : 0;
    })
    var player = {
        id: playerId,
        card1: sorted_deck_of_cards[0],
        card2: sorted_deck_of_cards[1],
        card3: sorted_deck_of_cards[2],

    };
    players.push(player);
    // var player = {
    //     id: "afssdgfsa",
    //     card1: { number: 9, suit: 'h', index: 2, color: 'red' },
    //     card2: { number: 11, suit: 's', index: 1, color: 'red' },
    //     card3: { number: 13, suit: 'c', index: 5, color: 'black' },
    //     rank: undefined
    // };
    // players.push(player);

    deck_of_cards.splice(0, 3);

    var data = {
        table_data: tableValue,
        player_data: player
    };
    console.log(players);
    var winner = rank(players);
    // players[playerId] = player
    console.log(winner + " is the winner");
    socket.emit('connectionBegin', data);

    socket.broadcast.emit('spawn', { id: playerId });

    players.forEach(function(player) {

        if (player.id == playerId)
            return;
        socket.emit('spawn', { id: player.id });
    });


    socket.on('move', function(data) {
        tableValue.money = data.tableValue;
        socket.broadcast.emit('move', tableValue);
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));

    });

    socket.on('updateTableValue', function(data) {
        tableValue.money = data.tableValue;
        socket.broadcast.emit('move', tableValue);
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));

    });

    socket.on('disconnect', function() {
        players.splice(players.indexOf(playerId), 1);
        console.log("Player Disconnected");
        socket.broadcast.emit('disconnected', { id: playerId });
    });

});
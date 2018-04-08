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

    /*
     socket.emit('logIn',function(data){
         console.log(JSON.stringify(data));
      });

    */

    var playerId = shortid.generate();

    // Crop first three elements and and push them to after sorting.
    var unsorted_deck_of_cards = deck_of_cards.slice(0, 3);
    sorted_deck_of_cards = unsorted_deck_of_cards.sort(function(a, b) {
        return (a['number'] < b['number']) ? -1 : (a['number'] > b['number']) ? 1 : 0;
    });
   
    console.log("sorted cards " + sorted_deck_of_cards );

    var player = {
        id: playerId,
        player_value: 1000,
        card1: sorted_deck_of_cards[0],
        card2: sorted_deck_of_cards[1],
        card3: sorted_deck_of_cards[2],

    };
    players.push(player);

    deck_of_cards.splice(0, 3);

    var data = {
        table_data: tableValue,
        player_data: player
    };
    console.log(players);
    var winner = rank(players);

    console.log(winner + " is the winner");

    socket.emit('connectionBegin', data);



    console.log("Client Connected");

    socket.on('move', function(data) {
        tableValue.money = data.tableValue;
        player.player_value = data.playerValue;
        console.log('Client moved Table Value : ' + JSON.stringify(tableValue.money));
        var chip_value = data.chipValue;
        var resdata = {
            tableValue: tableValue.money,
            playerID: player.id,
            playerValue: player.player_value,
            chipValue: chip_value
        };
        socket.broadcast.emit('move', resdata);

    });

    socket.on('NewPlayerAdd', function(data) {
        var n_res_data = {
            playerID: player.id,
            playerValue: data.playerValue
        };
        socket.broadcast.emit('NewPlayerAdd', n_res_data);
        players.forEach(player => {

            if (playerId == player.id)
                return;
            var playerToAdd = {
                playerID: player.id,
                playerValue: player.player_value
            };
            console.log('Client connected with Data:' + JSON.stringify(playerToAdd));

            socket.emit('NewPlayerAdd', playerToAdd);
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
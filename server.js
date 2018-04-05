var io = require('socket.io')(process.env.PORT || 3000);
var cards = require('./cards.js');
var shortid = require('shortid');

var deck_of_cards = cards.shuffle();

console.log("server Connected");
var players = [];
var playersCount = 0;

var tableValue = {
              money: 0
            };

//cards = shuffle(cards);

io.on('connection', function(socket) {

   
    var playerId = shortid.generate();
    players.push(playerId);

    var player = {
        id: playerId,
        player_value: 1000,
        card1:deck_of_cards[0],
        card2:deck_of_cards[1],
        card3:deck_of_cards[2]
    };

    var data = {
            table_data : tableValue,
            player_data : player
    };
   // players[playerId] = player
    console.log("Client Connected");
    

    socket.emit('connectionBegin',data);
    
    socket.broadcast.emit('spawn',{id:playerId});

    players.forEach(function(playerID){

        if(playerID == playerId)
           return;
        socket.emit('spawn',{id : playerID});
    });

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
        socket.broadcast.emit('move', resdata );
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));
        
    });
    
    socket.on('NewPlayerAdd',function(data){
        var n_res_data = {
            playerID: player.id,
            playerValue: data.playerValue
        };
        socket.broadcast.emit('NewPlayerAdd', n_res_data );
        players.forEach(function(playerID){

            if(playerID == playerId)
               return;
            var n_res_data = {
                playerID: playerID,
                playerValue: playerValue
            };   
            socket.emit('NewPlayerAdd',n_res_data);
        });
        
    });

    socket.on('updateTableValue', function(data) {
        tableValue.money = data.tableValue;
        socket.broadcast.emit('move', tableValue );
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));
        
    });

    socket.on('disconnect', function() {
        players.splice(players.indexOf(playerId),1);
        console.log("Player Disconnected");
        socket.broadcast.emit('disconnected',{id : playerId});
    });

});
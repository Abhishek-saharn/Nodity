var io = require('socket.io')(process.env.PORT || 3000);
var cards = require('./cards.js');
var shortid = require('shortid');

var deck_of_cards = cards.shuffle();
var shuffle = require('./shuffle.js');

console.log("server Connected");
var players = [];
var tableValue = {
              money: 0
            };

//cards = shuffle(cards);

io.on('connection', function(socket) {

   

   /*
    socket.emit('logIn',function(data){
        console.log(JSON.stringify(data));
     });

   */
    var playerId = shortid.generate();

    var player = {
        id: playerId,
        player_value: 1000,
        card1:deck_of_cards[0],
        card2:deck_of_cards[1],
        card3:deck_of_cards[2]
    };


    players.push(player);

    var data = {
            table_data : tableValue,
            player_data : player
    };

   // players[playerId] = player
    console.log("Client Connected");
    

    socket.emit('connectionBegin',data);
    
    /*socket.broadcast.emit('spawn',{id:playerId});

    players.forEach(player => {

        if(player.id == playerId)
           return;
        socket.emit('spawn',{id : player.id});
    });
    
    */
    console.log("Client Connected");
 
    //socket.emit('connectionBegin',tableValue);
    
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
        //console.log('Client played Moved with Data:');
        //console.log('Client played Moved with Data:' + JSON.stringify(data));
        
    });
    
    socket.on('NewPlayerAdd',function(data){
        var n_res_data = {
            playerID: player.id,
            playerValue: data.playerValue
        };
        socket.broadcast.emit('NewPlayerAdd', n_res_data );
        players.forEach(player=>{

            if(playerId == player.id)
               return;
            var playerToAdd = {
                playerID: player.id,
                playerValue: player.player_value
            };  
            console.log('Client connected with Data:' + JSON.stringify(playerToAdd));
            
            socket.emit('NewPlayerAdd',playerToAdd);
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
        if (players.length == 0)
            {
                tableValue.money = 0;
            }
        console.log("Player Disconnected");
        socket.broadcast.emit('disconnected',{id : playerId});
    });

});
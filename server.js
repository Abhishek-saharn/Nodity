var io = require('socket.io')(process.env.PORT || 3000);
var shuffle = require('./shuffle.js');

console.log("server Connected");
var playersCount = 0;
var cards =  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,
             27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,
             51];
var tableValue = {
              money: 0
            };


console.log(cards);

cards = shuffle(cards);
console.log(cards)
io.on('connection', function(socket) {

    playersCount++;
    
    console.log("Client Connected");
 

    socket.emit('connectionBegin',tableValue);
    
    socket.on('move', function(data) {
        tableValue.money = data.tableValue;
        socket.broadcast.emit('move', tableValue );
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));
        
    });
    
    socket.on('updateTableValue', function(data) {
        tableValue.money = data.tableValue;
        socket.broadcast.emit('move', tableValue );
        console.log('Client played Moved with Data:');
        console.log('Client played Moved with Data:' + JSON.stringify(data));
        
    });

    socket.on('disconnect', function() {
        playersCount--;
        if (playersCount == 0)
            {
                tableValue.money = 0;
            }
        console.log("Player Disconnected");
    });

});
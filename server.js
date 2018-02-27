var io = require('socket.io')(process.env.PORT || 3000);

console.log("server Connected");
var playersCount = 0;
var tableValue = {
              money: 0
            };
io.on('connection', function(socket) {

    console.log("Client Connected");
    playersCount++;
    //socket.broadcast.emit("spawn");
    
    for (var i = 0; i < playersCount; i++) {
        socket.emit("spawn");

    }

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
        console.log("Player Disconnected");
    });

});
var io = require('socket.io')(process.env.PORT || 3000);

console.log("server Connected");
var playersCount = 0;

io.on('connection', function(socket) {
    console.log(socket);
    console.log("Client Connected");
    playersCount++;
    socket.broadcast.emit("spawn");

    for (var i = 0; i < playersCount; i++) {
        socket.emit("spawn");

    }

    socket.on('move', function(data) {
        console.log('Client Moved with Data:' + data);
    });

    socket.on('disconnect', function() {
        playersCount--;
        console.log("Player Disconnected");
    });

});

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, { cors: true });

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index2.html');
});

app.get('/socket.io.js', function (req, res) {
  res.sendFile(__dirname + '/socket.io.js');
});

// io.use('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
// io.use('origins', '*:*');
io.emit('some event', { for: 'everyone' });
// io.engine.generateId = (req) => {
//   console.log('req',req)
//   console.log('req',req.query)
//   return "custom:id:" + 1111; // custom id must be unique
// }

let allClients = []

io.on('connection', function (socket) {
  // console.log(socket);
  console.log(socket.query);
  console.log(socket.id);

  socket.on('chat message', function (msg) {
    const user = searchUser(socket)
    console.log('user', user)
    console.log('userNmae', user.name)
    io.emit('chat message', { name: user.name, msg });
  })


  socket.on('new user', function (msg) {
    allClients.push({
      name: msg,
      id: socket.id
    })
    io.emit('new user', { name: msg });
    io.emit('room users', allClients);
  })

  socket.on('disconnect', function () {
    console.log('Got disconnect!');
    const user = searchUser(socket)
    if (user) {
      io.emit('leave message', { msg: `${user.name}离开了` });
      removeUser(socket)
    }
  });
});

function searchUser(socket) {
  return allClients.filter(e => e.id === socket.id)[0]
}
function removeUser(socket) {
  allClients = allClients.filter(e => e.id !== socket.id)
}

http.listen(3333, function (a,b) {
  console.log('listening on *:3333');
});

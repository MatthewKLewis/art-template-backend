//// Imports ////
const express = require("express");
const http = require("http")
const socketio = require("socket.io");
const router = require('./router')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

//// Settings ////
PORT = process.env.port || 4000;
const app = express()
const server = http.createServer(app)
const io = socketio(server, {cors: {origin: '*'}})

app.use(router)

//// All code having to do with this socket's connection:
io.on('connection', (socket) => {
  //Join:
  socket.on('join', ({name, room}, callback)=> {
    const {error, user} = addUser({id: socket.id, name, room});

    if (error) return callback(error);

    socket.emit('message', {user: 'admin', text: `${user.name}, welcome to ${user.room}.`})
    socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} has joined.`})

    socket.join(user.room);

    callback();
  });

  //Messages:
  socket.on('sendMessage', (message, callback)=> {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', {user: user.name, text: message})

    callback();
  });

  // Disconnect:
  socket.on('disconnect', ()=> {
    console.log('a client has left.')
  })

})

server.listen(PORT, ()=> {
  console.log("Server has Started on: " + PORT)
})

const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const router = require('./router')
const app = express()
const { addUser, removeUser, getUser, getUsersInRoom } = require('./User.js')
const PORT = process.env.port || 5000

const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: true,
    credentials: true,
  },
})

//when user join
io.on('connection', (socket) => {
  console.log('we have a new connection')
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room })
    if (error) {
      console.log('error here')
      return callback(error)
    }
    //when user just join show this message to user
    socket.emit('message', {
      user: user.name,
      text: `${user.name} Welcome to the room ${user.room}`,
    })

    //when user join show message to all others user within same room except user itself
    socket.broadcast
      .to(user.room)
      .emit('message', { text: `${user.name} has Joined!` })

    socket.join(user.room)
    callback
  })

  //when user try to send message it receives msg
  socket.on('sendmessage', (message, callback) => {
    const user = getUser(socket.id)
    console.log(user)
    //and send msg to all the users within the same room
    io.to(user.room).emit('message', { user: user.name, text: message })

    callback()
  })
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', { text: `${user.name} has left` })
    }
  })
})
app.use(router)
server.listen(PORT, () => console.log('server is running on port ' + PORT))

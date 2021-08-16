const http = require('http')
const express = require('express')
const {v4:uuidv4} = require('uuid')
const socketio = require('socket.io')
const {ExpressPeerServer} = require('peer')

const app = express()

const server = http.Server(app)
const io = socketio(server)
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path:"/peerjs"
});


app.use('/peerjs',peerServer)
app.use(express.static('public'))
app.set('view engine','ejs')


app.get('',(req,res) => {
    res.render('index',{newRoomId:uuidv4()})

})

app.get('/joinroom/:roomId',(req,res) => {
    console.log(`/joinroom = ${req.params.roomId}`)
    res.render('room',{roomId:req.params.roomId})
})

io.on('connection',(socket) => {
    console.log('New Connection')

    socket.on('new-user',(newUserId,roomId) => {
        console.log("Room : "+roomId)
        socket.join(roomId)
        //socket.emit('message',`Welcome to the Room`)
        socket.broadcast.to(roomId).emit('message',newUserId)
    })
})

server.listen(process.env.PORT || 3000,()=>{
    console.log('server started')
})
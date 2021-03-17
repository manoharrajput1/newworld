const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,'public')))

const botName = 'chatbot'

io.on('connection', socket =>{

    socket.on('joinRoom',({username, room})=>{
        const user = userJoin(socket.id, username, room)

        socket.join(user.room);

    socket.emit('message', formatMessage(botName,'welcome to chatcord'));

    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined`));
        io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
        });   
    
    });
        
    socket.on('chatMessage', (msg) => {
        // console.log(msg);
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
        // const user = getCurrentUser(socket.id);
    
        // 
    });
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if (user) {
          io.to(user.room).emit('message',formatMessage(botName, `${user.username} has left the chat`));
          
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
            });
        }  
        
    });  
});
    


const PORT = 3000 || process.env.PORT;


server.listen(PORT, ()=> console.log(`server running at port ${PORT}`));



const express=require('express')
const path=require('path')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generatemessage,generatelocationmessage}=require('./utils/messages')

const {adduser,getuser,removeuser,getusersinroom}=require('./utils/users')
const { use } = require('express/lib/application')

const app=express()
const server=http.createServer(app) ///express already do thid behind the scenes
const io=socketio(server) //socket.io expects to get the raw hhtp while express don't provide the raw, so that's why we called it individually


const port=process.env.PORT || 3000

const publicdirectorypath=path.join(__dirname,'../public')

app.use(express.static(publicdirectorypath))




//let count=0

io.on('connection',(socket)=>{
   console.log('New web socket connection')
   /* socket.emit('countUpdated',count)
   socket.on('inc',()=>
   {
       count++
       //socket.emit('countUpdated',count)///emits to a single connection only
       io.emit('countUpdated',count)//emits the event to every single connection
   }) */
   

   socket.on('join',(options,callback)=>
   {
       const {error,user}=adduser({id:socket.id, ...options})

       if(error)
       {
           return callback(error)
       }
       
       socket.join(user.room)
       
       socket.emit('message',generatemessage('Admin','Welcome'))
       socket.broadcast.to(user.room).emit('message',generatemessage('Admin',`${user.username} has joined`))//sent to other users only in the same room
       io.to(user.room).emit('roomdata',{
           room:user.room,
           users:getusersinroom(user.room)
       })
       callback()
   })

   socket.on('submitmess',(message,callback)=>
   {
       const user=getuser(socket.id)
       const filter= new Filter()
       if(filter.isProfane(message))
       {
           return callback('Profanity is not allowed')
       }
       
       io.to(user.room).emit('message',generatemessage(user.username,message))
       callback('Delivered')
   })


   socket.on('sendlocation',(coords,callback)=>
   {
      const user=getuser(socket.id)
       io.to(user.room).emit('locationmessage',generatelocationmessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
       callback()
    })


   socket.on('disconnect',()=>
   {
            const user=removeuser(socket.id)
            if(user)
            {
                io.to(user.room).emit('message',generatemessage('Admin',`${user.username} has left`))
                io.to(user.room).emit('rooomdata',{
                    room:user.room,
                    users:getusersinroom(user.room)
                })
            }
   })
   
})


server.listen(port,()=>
{
    console.log('Server is up '+port)
})
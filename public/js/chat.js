const socket=io()

/* socket.on('countUpdated',(count)=>
{
   console.log('Count has been updated',count)
})

document.querySelector('#inc').addEventListener('click',()=>
{
    console.log('clicked')
    socket.emit('inc')
}) */

//elements
const messageform=document.querySelector('#message-form')
const messageforminput=messageform.querySelector('input')
const messageformbutton=messageform.querySelector('button')
const messages=document.querySelector('#messages')
const locationform=document.querySelector('#send-location')

//templates
const messagetemplate=document.querySelector('#message-template').innerHTML
const locationtemplate=document.querySelector('#locationtemplate').innerHTML
const sidebartemplate=document.querySelector("#sidebar-template").innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
//console.log(username)


const autoscroll=()=>
{
    //new message element
    const newmessage=messages.lastElementChild

    //height of the new message
    const newmessagestyle= getComputedStyle(newmessage)
    const newmessagemargin=parseInt(newmessagestyle.marginBottom)
    const newmessageheight = newmessage.offsetHeight+newmessagemargin

    //visible height
    const visibleheight=messages.offsetHeight

    //height of messages container
    const containerheight=messages.scrollHeight

    //how I have scrolled
    const scrolloffset=messages.scrollTop+visibleheight
    
    if(containerheight-newmessageheight<= scrolloffset)
    {
        messages.scrollTop=messages.scrollHeight

    }

}

socket.on('message', (message) => {
    console.log(message)
    const html=Mustache.render(messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('locationmessage',(message)=>
{
    console.log(message)
    const html=Mustache.render(locationtemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('roomdata',({room,users})=>
{
   const html=Mustache.render(sidebartemplate,
{
    room,
    users

   })
   document.querySelector("#sidebar").innerHTML=html
})

messageform.addEventListener('submit',(e)=>
{
    e.preventDefault()

    messageformbutton.setAttribute('disabled','disabled')
    //disable
    const message=e.target.elements.message.value
    socket.emit('submitmess',message,(error)=>
    { 
        messageformbutton.removeAttribute('disabled')
        messageforminput.value=''
        messageforminput.focus()
        //enable
        if(error)
        {
            return console.log(error)
        }
        console.log('the message sent',message)
    })
})






locationform.addEventListener('click',()=>
{
    if(!navigator.geolocation)
    {
        return alert('Geolocation not supported')
    }
    locationform.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>
    {
         //console.log(position)
         socket.emit('sendlocation',{
             longitude:position.coords.longitude,
             latitude:position.coords.latitude
         },()=>{
            locationform.removeAttribute('disabled')
            console.log('Location shared')
        })
    })

})

socket.emit('join',{username,room},(error)=>
{
    if(error)
    {
        alert(error)
        location.href='/'
    }

})
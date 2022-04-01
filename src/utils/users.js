const { use } = require("express/lib/application")

const users=[]

const adduser=({id,username,room})=>{

    //Clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate the data
    if(!username || !room)
    {
        return{
            error:'username and room must be provided'
        }

    }
    //check for existing user
    const existinguser=users.find((user)=>
    {
        return user.room=== room && user.username==username
    })

    //validate username
    if(existinguser)
    {
        return
        {
            error:'Username is taken'
        }
    }

    const user={id,username,room}
    users.push(user)
    return {user}
}



const removeuser=(id)=>
{
    const index=users.findIndex((user)=>
        user.id === id

    )
    if(index !== -1)
    {
        //console.log(index)
        return users.splice(index,1)[0]
    }
}


const getuser=(id)=>
{
    const index=users.findIndex((user)=>
    user.id === id)
    if(index !== -1)
    {
        //console.log(index)
        return users[index]
    }

}

const getusersinroom=(room)=>
{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}

module.exports={
    adduser,removeuser,getuser,getusersinroom
}

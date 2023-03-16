require('dotenv').config()
const express = require ('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const User = require('./models/user')

app.get('/', (req, res) => {
    res.status(200).json({msg: "Welcome"})
})

app.post('/auth/register', async (req,res) => {
    const {name, email, password, confirmpassword} = req.body

    if(!name){
        return res.status(422).json({msg: 'name is required'})
    }
    if(!email){
        return res.status(422).json({msg: 'email is required'})
    }
    if(!password){
        return res.status(422).json({msg: 'password is required'})
    }
    if(password !== confirmpassword){
        return res.status(422).json({msg: 'passwords do not match'})
    }
    
    const userExists = await User.findOne({email: email})
    if(userExists){
        return res.status(422).json({msg: 'user already exists'})
    }
    
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
        name,
        email,
        password: passwordHash,
    });

    try{
        await user.save()
        res.status(201).json({msg: 'user created successfully'})
    
    } catch(error){
        console.log(error)
    
        res.status(500).json({msg:'server error'})
    }
})

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

mongoose.connect(
        `mongodb+srv://${dbUser}:${dbPass}@authjwt.h2j39mz.mongodb.net/?retryWrites=true&w=majority`,
        )
    .then(() => {
    app.listen(3000)
    console.log("connect")
}).catch((err) => console.log(err))


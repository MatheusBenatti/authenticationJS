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

app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id
    try{
        const user = await User.findById(id, '-password')
        res.status(200).json({user})
    }catch(error){
        console.log(error)
        return res.status(404).json({msg: 'User not found'})
    }
})

function checkToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        return res.status(401).json({msg: 'access denied'})
    }
    try{
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
    }catch(error){
        res.status(400)
    }
}

app.post('/auth/register', async (req,res) => {
    const {name, email, password, confirmpassword} = req.body

    if(!name){
        return res.status(422).json({msg: 'Name is required'})
    }
    if(!email){
        return res.status(422).json({msg: 'Email is required'})
    }
    if(!password){
        return res.status(422).json({msg: 'Password is required'})
    }
    if(password !== confirmpassword){
        return res.status(422).json({msg: 'Passwords do not match'})
    }
    
    const userExists = await User.findOne({email: email})
    if(userExists){
        return res.status(422).json({msg: 'User already exists'})
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
        res.status(201).json({msg: 'User created successfully'})
    
    } catch(error){
        console.log(error)
    
        res.status(500).json({msg:'Server error'})
    }
})

app.post('/auth/login', async (req, res) => {
    const { email, password} = req.body

    if(!email){
        return res.status(422).json({msg: 'Email is required'})
    }
    if(!password){
        return res.status(422).json({msg: 'Password is required'})
    }

    const user = await User.findOne({email: email})
    if(!user){
        return res.status(404).json({msg: 'User not exists'})
    }

    const checkpassword = await bcrypt.compare(password, user.password)
    if(!checkpassword){
        return res.status(422).json({msg: 'Password invalid'})
    }

    try{

        const secret = process.env.SECRET
        const token = jwt.sign(
            {
            id: user._id,
            },
            secret,
        )

    res.status(200).json({msg: 'authentication successful', token})
    }catch{
        console.log(error)
    
        res.status(500).json({msg:'Server error'})
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


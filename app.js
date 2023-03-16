require('dotenv').config()
const express = require ('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())


app.get('/', (req, res) => {
    res.status(200).json({msg: "Welcome"})
})

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS


app.post('/auth/register', async (req,res) => {
    const {name, email, password, confirmpassword} = req.body

    if(!name){
        return res.status(422).json({msg: 'name is required'})
    }
})

mongoose.connect(
        `mongodb+srv://${dbUser}:${dbPass}@authjwt.h2j39mz.mongodb.net/?retryWrites=true&w=majority`,
        )
    .then(() => {
    app.listen(3000)
    console.log("connect")
}).catch((err) => console.log(err))


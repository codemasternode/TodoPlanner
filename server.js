const express = require('express')
const bodyParser = require('body-parser')
const { mongoose } = require('./db/mongoose')
const { User } = require('./model/user')

const app = express()
app.use(bodyParser.json())

app.get('/users', (req, res) => {
    console.log('Wywołanie /users')
    User.find().then((users) => {
        res.send(users)
    }, (e) => {
        res.status(400).send()
    })
})

app.post('/users',(req,res) => {
    var user = new User({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        lastname: req.body.lastname
    })

    console.log()

    user.save().then((doc) => {
        res.send({
            message: 'Success'
        })
    },(e) => {
        res.send({
            message: 'Email must be unique'
        })
    })

})

app.listen(3000, () => {
    console.log('Started on port 3000')
})
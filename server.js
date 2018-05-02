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

app.post('/users', (req, res) => {
    var user = new User({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        lastname: req.body.lastname
    })

    console.log()

    user.save().then((doc) => {
        res.send({
            message: 'Brawo!!! Udało ci się zarejestrować nowe konto, na twojej skrzynce pocztowej znajduje się mail weryfikacyjny potrzebny do aktywowania konta'
        })
    }, (e) => {
        res.send({
            message: 'Email must be unique'
        })
    })
})

app.patch('/verify/:token', (req, res) => {
    var token = req.params.token

    User.findOneAndUpdate({ emailVerification: token }, { $set: { active: true } }, { new: true }).then((doc) => {
        if (!doc) {
            return res.status(404).send()
        }

        res.send(doc)
    }).catch((e) => {
        res.status(400).send()
    })
})

app.listen(3000, () => {
    console.log('Started on port 3000')
})
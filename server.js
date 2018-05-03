const express = require('express')
const bodyParser = require('body-parser')
const { mongoose } = require('./db/mongoose')
const { User } = require('./model/user')
const morgan = require('morgan')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Umożliwia otrzymywanie informacji o żądaniach
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Morgan wyświetla żądania w konsoli
app.use(morgan('dev'))


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
            success: true,
            message: 'Brawo!!! Udało ci się zarejestrować nowe konto, na twojej skrzynce pocztowej znajduje się mail weryfikacyjny potrzebny do aktywowania konta'
        })
    }, (e) => {
        res.send({
            success: false,
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

app.get('/users', (req, res) => {
    User.find().then((users) => {
        res.send(users)
    }, (e) => {
        res.status(400).send()
    })
})

app.post('/auth', (req, res) => {
    User.findOne({
        email: req.body.email
    }).then((user) => {

        if (!user) {
            return res.status(401).send({
                success: false,
                message: "Niema takiego użytkownika"
            })
        }

        bcrypt.compare(req.body.password, user.password, (err, hash) => {
            if (hash) {

                const payload = {
                    admin: user.admin
                }

                const token = jwt.sign(payload, 'supersecret', {
                    expiresIn: 1440
                })

                return res.send({
                    success: true,
                    token
                })

            } else {
                
                return res.status(401).send({
                    success: false,
                    message: 'Nieprawiłowy email lub hasło'
                })
            }
        })

    }).catch((e) => {
        res.status(401).send()
    })
})

app.listen(3000, () => {
    console.log('Started on port 3000')
})
const ObjectId = require('mongodb').ObjectID
const express = require('express')
const bodyParser = require('body-parser')
const { mongoose } = require('./db/mongoose')
const { User } = require('./model/user')
const morgan = require('morgan')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const keys = require('./helper/secretkey')
const auth = require('./middleware/authenticate')
const cors = require('cors')
const _ = require('lodash')

const checkToken = require('./utilites/todoAuth')
const port = process.env.PORT || 8080


//Umożliwia otrzymywanie informacji o żądaniach
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Morgan wyświetla żądania w konsoli
app.use(morgan('dev'))

app.use(cors({exposedHeaders: ['x-auth']}));

app.post('/users', (req, res) => {
    var user = new User({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        lastname: req.body.lastname
    })



    user.save().then((doc) => {

        res.send({
            success: true,
            message: 'Brawo!!! Udało ci się zarejestrować nowe konto, na twojej skrzynce pocztowej znajduje się mail weryfikacyjny potrzebny do aktywowania konta'
        })
    }, (e) => {
        console.log(e)
        res.send({
            success: false,
            message: 'Użytkownik z tym adresem email został już zarejestrowany'
        })
    })
})

app.get('/verify/me', (req, res) => {
    let token = req.header('x-auth')
    try {
        var encoded = jwt.decode(token, keys.SECRET_KEY.key.toString())
    } catch (error) {
        return res.status(400).send();
    }

    User.findById(encoded.id, (err, doc) => {
        if (err) {
            return res.status(400).send()
        }
        return res.send(doc);
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
                    admin: user.admin,
                    id: user._id
                }

                const token = jwt.sign(payload, keys.SECRET_KEY.toString(), {})

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

app.delete('/usersDelete/:id', auth.authenticateAdmin, (req, res) => {
    User.findOneAndRemove({ _id: req.params.id }).then((user) => {
        return res.send({
            message: 'Użytkownik został usunięty',
            body: user
        })
    }).catch((e) => {
        return res.send({
            message: 'Użytkownik nie został usunięty',
            error: e
        })
    })
})

app.delete('/users/me', auth.authenticate, (req, res) => {
    const token = req.header('x-auth') || req.body.token
    console.log(token + ' to jest token')
    try {
        decoded = jwt.verify(token, keys.SECRET_KEY.toString())
    } catch (e) {
        return res.status(401).send()
    }

    User.findOneAndRemove({ _id: decoded.id }).then((user) => {
        return res.send({
            message: "Użytkownik został ususnięty",
            body: user
        })
    }).catch((e) => {
        return res.send({
            message: 'Użytkownik nie został usunięty'
        })
    })
})


app.post('/newDayTodo', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))
    const todo = req.body
    todo.dayOfMonth = todo.day
    User.findByIdAndUpdate({ _id: decoded.id },
        { $push: { dayTodos: todo } },
        (err, success) => {
            if (err) {
                console.log(err)
                return res.status(403).send()
            } else {
                return res.send(success)
            }

        }
    )
})

app.delete('/deleteDayTodo/:id', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))
    const todoId = req.params.id
    User.update({ _id: decoded.id },
        { $pull: { dayTodos: { _id: todoId } } },
        { safe: true },
        (err, obj) => {
            if (err) {
                console.log(err)
                return res.status(401).send()
            } else {
                console.log(obj)
                return res.send(obj)
            }
        })
})

app.delete('/deleteMonthTodo/:id', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))
    const todoId = req.params.id

    User.update({ _id: decoded.id },
        { $pull: { monthTodos: { _id: todoId } } },
        { safe: true },
        (err, obj) => {
            if (err) {
                console.log(err)
                return res.status(401).send()
            } else {
                console.log(obj)
                return res.send(obj)
            }
        })
})

app.post('/newMonthTodo', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))
    const todo = req.body
    User.findByIdAndUpdate({ _id: decoded.id },
        { $push: { monthTodos: todo } },
        (err, success) => {
            if (err) {
                console.log(err)
                return res.status(403).send()
            } else {
                return res.send(success)
            }

        }
    )
})

app.post('/newLongTodo', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))
    const todo = req.body
    User.findByIdAndUpdate({ _id: decoded.id },
        { $push: { longTodos: todo } },
        (err, success) => {
            if (err) {
                console.log(err)
                return res.status(403).send()
            } else {
                return res.send(success)
            }

        }
    )
})

app.get('/allDayTodos', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))

    User.findById({ _id: decoded.id }, (err, success) => {
        if (err) {
            return res.status(403).send()
        } else {
            return res.send(success.dayTodos)
        }
    })
})



app.get('/allMonthTodos', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))

    User.findById({ _id: decoded.id }, (err, success) => {
        if (err) {
            return res.status(403).send()
        } else {
            return res.send(success.monthTodos)
        }
    })
})

app.get('/allLongTodos', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))

    User.findById({ _id: decoded.id }, (err, success) => {
        if (err) {
            return res.status(403).send()
        } else {
            return res.send(success.longTodos)
        }
    })
})

app.put('/updateLongTodo', auth.authenticate, (req, res) => {
    const decoded = checkToken.getDecoded(req.header('x-auth'))
    const email = req.body.email

    User.updateOne({ email, "longTodos.when": req.body.when }, { $set: { "longTodos.$.title": req.body.title } }, (err, raw) => {
        if (err) {
            return res.status(403).send()
        }
        return res.send(raw)
    })
})



app.listen(port, () => {
    console.log(`Started on ${port}`)
})
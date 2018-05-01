const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema

var todo = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    startAt: {
        type: Date,
        required: true
    },
    endAt: {
        type: Date,
        required: true
    }
})

var userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'To nie jest prawidłowy email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    lastname: {
        type: String,
        required: true,
        maxlength: 20
    },
    todos: [todo]

})

var User = mongoose.model('User', userSchema)

module.exports = {
    User
}
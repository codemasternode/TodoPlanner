const mongoose = require('mongoose')
const validator = require('validator')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const _ = require('lodash')

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

userSchema.methods.toJSON = function () {
    var user = this
    var userObject = user.toObject()

    return _.pick(userObject, ['email', 'name','lastname'])

}

userSchema.pre('save', function (next) {
    var user = this
    if (!user.isModified('password')) {
        return next()
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash
            next()
        })
    })

})

var User = mongoose.model('User', userSchema)

module.exports = {
    User
}
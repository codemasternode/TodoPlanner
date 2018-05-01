const mongoose = require('mongoose')

const Schema = mongoose.Schema

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
    }
})
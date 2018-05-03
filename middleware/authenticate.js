const jwt = require('jsonwebtoken')
const key = require('../helper/secretkey')

const authenticate = (req, res, next) => {
    const token = req.header['x-auth'] || req.body.token

    jwt.verify(token, key.SECRET_KEY.toString(), (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(403).send({
                success: false
            })
        } else {
            req.decoded = decoded
            next()
        }
    })
}

module.exports = {
    authenticate
}
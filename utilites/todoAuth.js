const jwt = require('jsonwebtoken')
const key = require('../helper/secretkey')

module.exports = {
    getDecoded(token, res) {
        try {
            var decoded = jwt.decode(token, key.SECRET_KEY)
        } catch (error) {
            return res.status(401).send()
        }
        return decoded
    }
}
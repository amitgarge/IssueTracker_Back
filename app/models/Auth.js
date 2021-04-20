const time = require('../libs/timeLib')

const mongoose = require('mongoose'),
Schema = mongoose.Schema

const Auth = new Schema({
    userId: {
        type: String
    },
    authToken: {
        type: String
    },
    tokenSecret: {
        type: String
    },
    tokenGenerationTime: {
        type: Date,
        default: time.now()
    }
})

module.exports = mongoose.model('Auth', Auth)
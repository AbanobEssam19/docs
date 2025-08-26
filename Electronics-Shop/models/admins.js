const mongoose = require('mongoose');

const Admins = mongoose.model('Admins', 
    {
        username: String,
        password: String
    }
)

module.exports = Admins
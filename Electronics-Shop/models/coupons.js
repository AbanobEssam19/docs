const mongoose = require('mongoose');

const Coupons = mongoose.model('Coupons', 
    {
        code: String,
        expiryDate: Date,
        discount: Number,
        minPurchase: Number,
        newUser: Boolean
    }
)

module.exports = Coupons;
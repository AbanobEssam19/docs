const mongoose = require('mongoose');

const CartItem = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
    quantity: Number
});

const Orders = mongoose.model('Orders', 
    {
        orderID: Number,
        cart: { type: [CartItem], default: [] },
        date: Date,
        total: Number,
        shipping: Boolean,
        address: String,
        city: String,
        region: String,
        status: {type: String, default: "Processing"},
        notes: {type: String, default: ""}
    }
)

module.exports = Orders
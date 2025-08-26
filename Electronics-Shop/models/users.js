const mongoose = require('mongoose');

const CartItem = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
    productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
    quantity: Number
});

const Users = mongoose.model('Users', 
    {
        username: String,
        password: String,
        name: String,
        email: String,
        cart: { type: [CartItem], default: [] },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' , default: []}],
        firstname: {type: String, default: ""},
        lastname: {type: String, default: ""},
        address: {type: String, default: ""},
        phone: {type: String, default: ""},
        city: {type: String, default: ""},
        region: {type: String, default: ""},
        orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Orders' , default: []}],
        printingOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PrintingOrders' , default: []}],
        total: {type: Number, default: 0},
        usedCoupons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Coupons', default: []}]
    }
)

module.exports = Users;
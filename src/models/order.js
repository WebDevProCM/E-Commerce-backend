const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    ordId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    orderDate: {
        type: Date,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        required: true,
        default: 0
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    paid: {
        type: String,
        default: "no",
    },
    products: [{
        prodId: String,
        image: String,
        quantity: Number,
        name: String,
        price: Number,
        total: Number
    }]
})

const Order = mongoose.model("Orders", orderSchema);

module.exports = Order;
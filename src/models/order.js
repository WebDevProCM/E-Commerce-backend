const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    ordId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    deliveryDate: {
        type: Date,
        required: true,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        default: "preparing"
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
        name: String,
        image: String,
        quantity: Number,
        price: Number,
        total: Number
    }]
}, {timestamps: true})

const Order = mongoose.model("Orders", orderSchema);

module.exports = Order;
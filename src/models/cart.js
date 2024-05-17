const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
})

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
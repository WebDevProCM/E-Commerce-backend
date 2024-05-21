const express = require("express");
const Cart = require("../models/cart.js");
const Product = require("../models/product.js");
const User = require("../models/user.js");
const apiAuth = require("../middleware/apiAuth.js");
const auth = require("../middleware/auth.js");

const router = new express.Router();

router.post("/api/cart", apiAuth, async (req, res) =>{
    try{
        req.body.user = req.session.user._id;
        const product = await Product.findById(req.body.product);
        if(!product){
            return res.send({error: "Product not found!"});
        }
        if(product.status === 0){
            return res.send({error: "Product is not available!"});
        }
        if(req.body.quantity > product.quantity){
            return res.send({error: "Not having enough quantities"});
        }
        req.body.total = req.body.quantity * product.price;

        const checkExistCart = await Cart.findOne({user: req.session.user._id, product: req.body.product}).populate("product", 
        {name: 1, prodId: 1, image: 1, price: 1, category: 1, type: 1 });
        
        if(checkExistCart){
            if((req.body.quantity + checkExistCart.quantity) > product.quantity){
                return res.send({error: "Not having enough quantities"});
            }
            req.body.total = req.body.quantity * product.price;
            checkExistCart.quantity = req.body.quantity;
            checkExistCart.total = req.body.total;
            await checkExistCart.save();
            return res.send(checkExistCart);   
        }

        const cart = new Cart(req.body);
        await cart.save();
        await cart.populate("product", {name: 1, prodId: 1, image: 1, price: 1,  category: 1, type: 1});
        res.send(cart);
    }catch(error){
        console.log(error);
        res.send({error: "Something went wrong!"});
    }
});

router.get("/api/cart", apiAuth, async (req, res) =>{
    console.log(req.sessionID);
    try{
        const carts = await Cart.find({user: req.session.user._id}).populate("product", 
            {name: 1, prodId: 1, image: 1, price: 1, category: 1, type: 1});
        res.send(carts);
    }catch(error){
        console.log(error);
        res.send({error: "Something went wrong!"});
    }
});

router.get("/api/cart/:id", apiAuth, async (req, res) =>{
    try{
        const cart = await Cart.findOne({user: req.session.user._id, _id: req.params.id}).populate("product", 
            {name: 1, prodId: 1, image: 1, price: 1, category: 1, type: 1});
        if(!cart){
            return res.send({error: "Cart item not found!"});
        }
        res.send(cart);
    }catch(error){
        console.log(error);
        res.send({error: "Something went wrong!"});
    }
});

router.patch("/api/cart/:id", apiAuth, async (req, res) =>{
    try{
        const allowedFields = ["quantity"];
        const updatingFields = Object.keys(req.body);
        const checkValidity = updatingFields.every((field) =>{
            return allowedFields.includes(field);
        })
        if(!checkValidity){
            return res.send({error: "Invalid field update"});
        }
        const cart = await Cart.findOne({user: req.session.user._id, _id: req.params.id}).populate("product", 
            {name: 1, prodId: 1, image: 1, price: 1, category: 1, type: 1 });
        if(!cart){
            return res.send({error: "Cart item not found!"});
        }
        const product = await Product.findById(cart.product._id);
        if(!product){
            return res.send({error: "Product is not found!"});
        }
        if(req.body.quantity > product.quantity){
            return res.send({error: "Not having enough quantities!"});
        }
        cart.quantity = req.body.quantity;
        cart.total = req.body.quantity * product.price;

        await cart.save();
        res.send(cart);
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});

router.delete("/api/cart/:id", apiAuth, async (req, res) =>{
    try{
        const cart = await Cart.findOneAndDelete({user: req.session.user._id, _id: req.params.id}).populate("product", 
            {name: 1, prodId: 1, image: 1, price: 1, category: 1, type: 1 });
        if(!cart){
            return res.send({error: "Cart item not found!"});
        }
        res.send(cart);
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});

module.exports = router;
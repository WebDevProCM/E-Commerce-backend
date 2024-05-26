const express = require("express");
const Review = require("../models/reviews.js");
const Product = require("../models/product.js");
const apiAuth = require("../middleware/apiAuth.js");
const publicAuth = require("../middleware/publicAuth.js");
const auth = require("../middleware/auth.js");

const router = new express.Router();

router.post("/api/review", apiAuth, async (req, res) =>{
    try{
        req.body.user = req.session.user._id;
        const product = await Product.findById(req.body.product);
        if(!product){
            return res.send({error: "Product not found!"});
        }

        const review = new Review(req.body);
        await review.save();
        await review.populate("product", {name: 1, _id: 1, prodId: 1,category: 1});
        await review.populate("user", {name: 1, email: 1, address: 1});
        res.send(review);
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});

router.get("/api/review", publicAuth, async (req, res) =>{
    try{
        const reviews = await Review.find().populate("product", 
            {name: 1, prodId: 1, _id: 1, category: 1}).populate("user", 
            {name: 1, email: 1, address: 1});
        res.send(reviews);
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});

router.get("/api/review/:id", publicAuth, async (req, res) =>{
    try{
        const review = await Review.findById(req.params.id);
        await review.populate("product", {name: 1, prodId: 1, _id: 1, category: 1});
        await review.populate("user", {name: 1, email: 1, address: 1});

        if(!review){
            return res.send({error: "Reviewed item not found!"});
        }
        res.send(review);
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});

router.patch("/api/review/:id", apiAuth, async (req, res) =>{
    try{
        const allowedFields = ["stars", "description"];
        const updatingFields = Object.keys(req.body);
        const checkValidity = updatingFields.every((field) =>{
            return allowedFields.includes(field);
        })
        if(!checkValidity){
            return res.send({error: "Invalid field update"});
        }
        const review = await Review.findOneAndUpdate({user: req.session.user._id, _id: req.params.id}, req.body, {new: true});
        if(!review){
            return res.send({error: "Reviewed item not found!"});
        }
        await review.populate("product", {name: 1, prodId: 1, _id: 1, category: 1});
        await review.populate("user", {name: 1, email: 1, address: 1});

        await review.save();
        res.send(review);
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});

router.delete("/api/review/:id", apiAuth, async (req, res) =>{
    try{
        const review = await Review.findOneAndDelete({user: req.session.user._id, _id: req.params.id});
        if(!review){
            return res.send({error: "Reviewed item not found!"});
        }
        await review.populate("product", {name: 1, prodId: 1, _id: 1, category: 1});
        await review.populate("user", {name: 1, email: 1, address: 1});

        res.send(review);
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});

module.exports = router;
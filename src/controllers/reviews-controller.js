const Review = require("../models/reviews.js");
const Product = require("../models/product.js");
const catchAsyncError = require("../utilis/catchAsyncError.js");
const AppError = require("../utilis/errorHandler.js");

const create = catchAsyncError(async (req, res, next) =>{
    req.body.user = req.session.user._id;
    const product = await Product.findById(req.body.product);
    if(!product){
        return next(new AppError("product not found!", 500));
    }

    const review = new Review(req.body);
    await review.save();
    await review.populate("product", {name: 1, _id: 1, prodId: 1,category: 1});
    await review.populate("user", {name: 1, email: 1, address: 1});
    res.send(review);
})

const getAll = catchAsyncError(async (req, res, next) =>{
    const reviews = await Review.find().populate("product", 
        {name: 1, prodId: 1, _id: 1, category: 1}).populate("user", 
        {name: 1, email: 1, address: 1});
    res.send(reviews);
})

const getOne = catchAsyncError(async (req, res, next) =>{
    const reviews = await Review.find({product: req.params.id}).populate("product", 
        {name: 1, prodId: 1, _id: 1, category: 1}).populate("user", 
        {name: 1, email: 1});
    res.send(reviews);
})

const update = catchAsyncError(async (req, res, next) =>{
    const allowedFields = ["stars", "description"];
    const updatingFields = Object.keys(req.body);
    const checkValidity = updatingFields.every((field) =>{
        return allowedFields.includes(field);
    })
    if(!checkValidity){
        return next(new AppError("Invalid field update", 400));
    }
    const review = await Review.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
    if(!review){
        return next(new AppError("Reviewed item not found!", 404));
    }
    await review.populate("product", {name: 1, prodId: 1, _id: 1, category: 1});
    await review.populate("user", {name: 1, email: 1, address: 1});

    await review.save();
    res.send(review);
})

const remove = catchAsyncError(async (req, res, next) =>{
    const review = await Review.findOneAndDelete({_id: req.params.id});
    if(!review){
        return next(new AppError("Reviewed item not found!", 404));
    }
    await review.populate("product", {name: 1, prodId: 1, _id: 1, category: 1});
    await review.populate("user", {name: 1, email: 1, address: 1});

    res.send(review);
})

module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove
}
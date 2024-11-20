const Cart = require("../models/cart.js");
const Product = require("../models/product.js");
const catchAsyncError = require("../utilis/catchAsyncError.js");
const AppError = require("../utilis/errorHandler.js");

const create = catchAsyncError(async (req, res, next) =>{
    req.body.user = req.session.user._id;
    const product = await Product.findById(req.body.product);
    if(!product){
        return next(new AppError("Product not found!", 404));
    }
    if(product.status === 0){
        return next(new AppError("Product is not available!", 404));
    }
    if(parseFloat(req.body.quantity) > product.quantity){
        return next(new AppError("Not having enough quantities", 404));
    }
    
    req.body.total = parseFloat(req.body.quantity) * product.price;
    req.body.total = parseFloat(req.body.total).toFixed(2);

    const checkExistCart = await Cart.findOne({user: req.session.user._id, product: req.body.product}).populate("product");
    
    if(checkExistCart){
        if((parseFloat(req.body.quantity) + checkExistCart.quantity) > product.quantity){
            return next(new AppError("Not having enough quantities", 404));
        }
        req.body.total = parseFloat(req.body.quantity) * product.price;
        req.body.total =  parseFloat(req.body.total).toFixed(2);
        checkExistCart.quantity = parseFloat(req.body.quantity);
        checkExistCart.total = parseFloat(req.body.total);
        await checkExistCart.save();
        return res.send(checkExistCart);   
    }

    const cart = new Cart(req.body);
    await cart.save();
    await cart.populate("product");
    res.send(cart);
})

const getAll = catchAsyncError(async (req, res, next) =>{
    const carts = await Cart.find({user: req.session.user._id}).populate("product", 
        {name: 1, prodId: 1, image: 1, price: 1, category: 1, type: 1});
    res.send(carts);
})

const getOne = catchAsyncError(async (req, res, next) =>{
    const cart = await Cart.findOne({user: req.session.user._id, _id: req.params.id}).populate("product", 
        {name: 1, prodId: 1, image: 1, price: 1, category: 1, type: 1});
    if(!cart){
        return next(new AppError("Cart item not found!", 404));
    }
    res.send(cart);
})

const update = catchAsyncError(async (req, res, next) =>{
    const allowedFields = ["quantity"];
    const updatingFields = Object.keys(req.body);
    const checkValidity = updatingFields.every((field) =>{
        return allowedFields.includes(field);
    })
    if(!checkValidity){
        return next(new AppError("Invalid field update", 400));
    }
    const cart = await Cart.findOne({user: req.session.user._id, _id: req.params.id}).populate("product");
    if(!cart){
        return next(new AppError("Cart item not found!", 404));
    }
    const product = await Product.findById(cart.product._id);
    if(!product){
        return next(new AppError("Product is not found!", 404));
    }
    if(parseFloat(req.body.quantity) > product.quantity){
        return next(new AppError("Not having enough quantities!", 404));
    }
    cart.quantity = parseFloat(req.body.quantity);
    cart.total = parseFloat(req.body.quantity) * product.price;
    cart.total =  parseFloat(cart.total).toFixed(2);

    await cart.save();
    res.send(cart);
})

const remove = catchAsyncError (async (req, res, next) =>{
    const cart = await Cart.findOneAndDelete({user: req.session.user._id, _id: req.params.id}).populate("product");
    if(!cart){
        return next(new AppError("Cart item not found!", 404));
    }
    res.send(cart);
})

module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove
}
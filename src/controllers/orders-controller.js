const Order = require("../models/order.js");
const User = require("../models/user.js");
const Product = require("../models/product.js");
const idGenerator = require("../utilis/idGenerator.js");
const catchAsyncError = require("../utilis/catchAsyncError.js");
const AppError = require("../utilis/errorHandler.js");

const create = catchAsyncError(async (req, res, next) =>{
    req.body.ordId = idGenerator.ordIdGenerator();
    req.body.customer = req.session.user._id;
    req.body.paid = "no";

    const currentDate = new Date();
    req.body.deliveryDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const user = await User.findById(req.body.customer);
    if(!user){
        return next(new AppError("User not found!", 404));
    }

    // if(product.status > 1){
    //     return res.send({error: "Product not available at the moment!"});
    // }

    // if(product.quantity < parseFloat(req.body.quantity)){
    //     return res.send({error: "Not having enough quantities!"});
    // }


    // const checkExstingProduct = order.products.find(detail => detail.prodId === req.body.prodId);
    // if(checkExstingProduct){
    //     checkExstingProduct.quantity = checkExstingProduct.quantity + parseInt(req.body.quantity);
    //     checkExstingProduct.total = checkExstingProduct.quantity * checkExstingProduct.price;
    // }else{
    //     order.products.push({
    //         quantity: parseFloat(req.body.quantity),
    //         prodId: product.prodId,
    //         image: product.image,
    //         name: product.name,
    //         price: product.price,
    //         total: product.price * parseInt(req.body.quantity)
    //     });
    // }

    let totalAmount = 0;
    let errorMsg = '';
    let products = [];

    for(let i=0; i < req.body.products.length; i++){
        let ordProduct = await Product.findOne({prodId: req.body.products[i].prodId});
        if(!ordProduct){
            errorMsg = {error: "Product not Found!"};
            break;
        }

        if(ordProduct.status > 1){
            errorMsg = {error: "Product not available at the moment!"};
            break;
        }

        if(ordProduct.quantity < parseFloat(req.body.products[i].quantity)){
            errorMsg = {error: "Not having enough quantities!"};
            break;
        }

        req.body.products[i].totalAmount = ordProduct.price * req.body.products[i].quantity;
        req.body.products[i].name = ordProduct.name;
        req.body.products[i].image = ordProduct.image;
        req.body.products[i].price = ordProduct.price;
        totalAmount = totalAmount + req.body.products[i].totalAmount;
        products.push(req.body.products[i]);
    }
    
    if(errorMsg.error){
        return next(new AppError(errorMsg.error, 404));
    }
    req.body.totalAmount = totalAmount;
    req.body.products = products;

    let order = new Order(req.body);
    if(!order){
        return next(new AppError("Order not created!", 404));
    }

    await order.save();
    res.send(order);
})

const getAdmin = catchAsyncError(async (req, res, next) =>{
    const orders = await Order.find({}).populate("customer", {name:1, _id: 1});
    res.send(orders);
})

const get = catchAsyncError(async (req, res, next) =>{
    const orders = await Order.find({customer: req.session.user._id});
    if(!orders){
        return next(new AppError("Order is not found!", 404));
    }

    res.send(orders);
})

const update = catchAsyncError(async (req, res, next) =>{
    const allowedFields = ["deliveryDate", "status", "paid"];
    const updatingFields = Object.keys(req.body);
    const validationCheck = updatingFields.every((field) =>{
        return allowedFields.includes(field);
    });

    if(!validationCheck){
        return next(new AppError("Invalid field update!", 400));
    }

    const newDate = new Date(req.body.deliveryDate);
    req.body.deliveryDate = newDate;
    
    let order = await Order.findOneAndUpdate({ordId: req.params.id}, req.body, {new: true});
    if(!order){
        return next(new AppError("Order not updated!", 404));
    }

    await order.save();
    await order.populate("customer", {name: 1, _id: 1});
    res.send(order);
})

const remove = catchAsyncError(async (req, res, next) =>{
    let order = await Order.findOneAndDelete({ordId: req.params.ordId});
    if(!order){
        return next(new AppError("Order not found!", 404));
    }

    for(let i=0; i < order.products.length(); i++){
        let ordProduct = await Product.findOne({prodId: req.body.products[i].prodId});
        if(!ordProduct){
            continue;
        }

        ordProduct.quantity = ordProduct.quantity + order.products[i].quantity;
        await ordProduct.save();
    }
    
    res.send(order);
})

module.exports = {
    create,
    getAdmin,
    get,
    update,
    remove
}
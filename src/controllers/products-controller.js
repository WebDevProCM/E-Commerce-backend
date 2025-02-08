const idGenerator = require("../utilis/idGenerator.js");
const imageCloud = require("../utilis/cloudinaryUploadImage.js");
const Product = require("../models/product.js");
const catchAsyncError = require("../utilis/catchAsyncError.js");
const AppError = require("../utilis/errorHandler.js");

const create = catchAsyncError(async (req, res, next) =>{
    req.body.prodId = idGenerator.prodIdGenerator();
    if(req.files){
        const imageName = await imageCloud.uploadProductImage(req.files.image);
        if(imageName.error){
            return next(new AppError(imageName.error, 400));
        }

        req.body.image = imageName;
    }
    req.body.price = parseFloat(req.body.price).toFixed(2);

    if(req.body.oldPrice !== 0){
        req.body.oldPrice = parseFloat(req.body.oldPrice).toFixed(2);
    }

    const product = new Product(req.body);
    if(!product){
        return next(new AppError("product not created!", 500));
    }

    await product.save();
    res.send(product);
})

const getAll = catchAsyncError(async (req, res, next) =>{
    const currentPage = req.params.page < 1 ? 1 : req.params.page;
    const productsPerPage = 9;
    const skip = (currentPage - 1) * productsPerPage;

    const totalDocuments = await Product.countDocuments({category: {$in: ["Unisex", req.params.category]}});
    const products = await Product.aggregate([
        {
            $match: { category: { $in: ["Unisex", req.params.category] } }
        },
        {
            $lookup:{
                from:"reviews",
                localField: "_id",
                foreignField: "product",
                as: "reviews"
            }
        },
        {
            $addFields:{
                averageRating: {$avg: "$reviews.stars"},
                totalReviews: {$size: "$reviews"}
            }
        },
        {
            $project:{
                reviews: 0
            }
        },
        {$skip: skip},
        {$limit: productsPerPage}
    ]);
    res.send({products: products, total: totalDocuments});
})

const getOne = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findOne({prodId: req.params.id});
    if(!product){
        return next(new AppError("product not found!", 400));
    }
    if(req.session.public){
        req.session.public.products.push(product);
    }
    // console.log(product);
    res.send(product);
})

const update = catchAsyncError(async (req, res, next) =>{
    const allowedFields = ["name", "quantity", "price", "oldPrice", "status", "image", "category", "type", "description", "ml"];

    if(req.files){
        const imageName = await imageCloud.uploadProductImage(req.files.image);
        if(imageName.error){
            return next(new AppError(imageName.error, 400));
        }

        req.body.image = imageName;
    }

    const updatingFields = Object.keys(req.body);
    const validationCheck = updatingFields.every((field) =>{
        return allowedFields.includes(field);
    });

    if(!validationCheck){
        return next(new AppError("Invalid field update!", 400));
    }
    if(req.body.price){
        req.body.price = parseFloat(req.body.price).toFixed(2);
    }

    if(req.body.oldPrice !== 0){
        req.body.oldPrice = parseFloat(req.body.oldPrice).toFixed(2);
    }

    const product = await Product.findOne({prodId: req.params.id});
    if(!product){
        return next(new AppError("product not updated!", 500));
    }
    // const oldImageName = product.image;
    updatingFields.forEach((field)=>{
        product[field] = req.body[field];
    });

    // if(oldImageName !== product.image){
    //     const result =  await Product.prevImageRemove(oldImageName);
    // }

    await product.save();
    res.send(product);
})

const remove = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findOneAndDelete({prodId: req.params.id});
    if(!product){
        return next(new AppError("product not found!", 500));
    }
    res.send(product);
})

module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove
}
const imageCloud = require("../utilis/cloudinaryUploadImage.js");
const idGenerator = require("../utilis/idGenerator.js");
const User = require("../models/user.js");
const catchAsyncError = require("../utilis/catchAsyncError.js");

const loginCheck = catchAsyncError(async (req, res, next) =>{
    if(req.session.user){
        return res.send(req.session.user);
    }
    res.send();
})

const login = catchAsyncError(async (req, res, next) =>{
        const user = await User.authentication(req.body.email, req.body.password);
        if(user.error){
            return next(new AppError(user.error, 401));
        }
        req.session.user = User.sendPublicData(user);
        res.send(User.sendPublicData(user));
})

const logout = catchAsyncError(async (req, res, next) =>{
    req.session.user = undefined;
    res.send({success: "Looged Out"});
})

const create = catchAsyncError(async (req, res, next) =>{
    req.body.cusId = idGenerator.cusIdGenerator();
    const user = new User(req.body);
    if(!user){
        return next(new AppError("User not created!", 401));
    }

    await user.save();
    res.send(User.sendPublicData(user));
    // }catch(error){
    //     if(error.message.includes("Invalid email")){
    //         return res.send({error: "Invalid email address!"});
    //     }
    //     res.send({error:"something went wrong!"});
    // }
})

const getOne = catchAsyncError(async (req, res, next) =>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new AppError("User not found!", 404));
    }

    res.send(User.sendPublicData(user));
})

const getAll = catchAsyncError(async (req, res, next) =>{
    const users = await User.find({});
    res.send(users);
})

const update = catchAsyncError(async (req, res, next) =>{
    const allowedFields = ["name", "address", "password", "image"];
    if(req.files){
        const imageName = await imageCloud.uploadImage(req.files.image);
        if(imageName.error){
            return next(new AppError(imageName.error, 500));
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
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new AppError("User not updated!", 400));
    }
    // const oldImageName = user.image;

    updatingFields.forEach((field)=>{
        user[field] = req.body[field];
    });

    // if(oldImageName !== user.image){
    //     const result =  await User.prevImageRemove(oldImageName);
    // }

    await user.save();
    if(req.session.user){
        req.session.user = await User.sendPublicData(user);
    }
    res.send(User.sendPublicData(user));
})

const remove = catchAsyncError(async (req, res, next) =>{
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user){
        return next(new AppError("User not removed!", 500));
    }

    res.send(User.sendPublicData(user));
})

module.exports = {
    loginCheck,
    login,
    logout,
    create,
    getOne,
    getAll,
    update,
    remove
}
const Admin = require("../models/admin");
const catchAsyncError = require("../utilis/catchAsyncError");
const AppError = require("../utilis/errorHandler");

const loginCheck = catchAsyncError(async (req, res, next) =>{
        if(req.session.admin){
            return res.send(req.session.admin);
        }
        res.send();

})

const login = catchAsyncError(async (req, res, next) =>{
    const admin = await Admin.authentication(req.body.email, req.body.password);
    if(admin.error){
        return next(new AppError(admin.error, 401));
    }
    req.session.admin = await Admin.sendPublicData(admin);
    res.send(Admin.sendPublicData(admin));

})

const logout = catchAsyncError(async (req, res, next) =>{
        if(!req.session.admin){
            return next(new AppError("Admin user not found!", 401))
        }

        req.session.admin = null;
        res.send({succuess: "Logout successfully!"});
})

const createAdmin = catchAsyncError(async (req, res, next) =>{
    const admin = new Admin(req.body);
    if(!admin){
        return next(new AppError("Admin not created!", 400));
    }

    await admin.save();
    res.send(Admin.sendPublicData(admin));
})

const getAll = catchAsyncError(async (req, res, next) =>{
    const admins = await Admin.find({});
    res.send(admins);
})

const getOne = catchAsyncError(async (req, res, next) =>{
    const admin = await Admin.findById(req.params.id);
    if(!admin){
        return next(new AppError("admin not found!", 404));
    }

    res.send(Admin.sendPublicData(admin));
})

const update = catchAsyncError(async (req, res, next) =>{
    const allowedFields = ["name", "image", "password"];
    if(req.files){
        const imageName = await Admin.uploadImage(req.files.image);
        if(imageName.error){
            return next(new AppError(imageName.error));
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
    const admin = await Admin.findById(req.params.id);
    if(!admin){
        return next(new AppError("admin not updated!", 401));
    }
    const oldImageName = admin.image;
    updatingFields.forEach((field)=>{
        admin[field] = req.body[field];
    });

    if(oldImageName !== admin.image){
        const result =  await Admin.prevImageRemove(oldImageName);
    }

    await admin.save();
    req.session.user = await Admin.sendPublicData(admin)
    res.send(Admin.sendPublicData(admin));

})

const remove =  catchAsyncError(async (req, res, next) =>{
    const admin = await Admin.findOneAndDelete({_id: req.params.id});
    if(!admin){
        return next(new AppError("admin not removed!"));
    }

    res.send(Admin.sendPublicData(admin));
})

module.exports = {
    loginCheck,
    login,
    logout,
    createAdmin,
    getAll,
    getOne,
    update,
    remove
}
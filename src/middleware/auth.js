const catchAsyncError = require("../utilis/catchAsyncError");

const Adminauth = catchAsyncError(async (req, res, next) =>{
    if(!req.session.admin){
        return res.send({error: "Not a authorized Admin"});
    }
    next();
})

module.exports = Adminauth;
const catchAsyncError = require("../utilis/catchAsyncError");

const apiAuth = catchAsyncError(async (req, res, next) =>{
    if(!req.session.user && !req.session.admin){
        return res.send({error: "You are not a authorized user!"});
    }
    next();
})

module.exports = apiAuth;
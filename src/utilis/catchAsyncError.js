const AppError = require("./errorHandler");

const catchAsyncError = (fn) =>{
    return (req, res, next) =>{
        fn(req, res, next).catch((e) => next(new AppError("Something went wrong!")));
    }
}

module.exports = catchAsyncError
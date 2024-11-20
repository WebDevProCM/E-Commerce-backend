class AppError extends Error{
    constructor(message, code){
        super(message);
        this.statusCode = code ? code : 500;
        this.status = `${this.statusCode}`.startsWith(4) ? "Fail" : "Error";
        this.operational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
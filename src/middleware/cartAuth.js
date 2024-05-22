const cartAuth = async (req, res, next) =>{
    if(!req.session.user){
        if(!req.session.public){
            req.session.public = {products: [], cart: []}
        }
    }

    next();
}

module.exports = cartAuth;
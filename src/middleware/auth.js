const auth = async (req, res, next) =>{
    // if(!req.session.user || !req.session.admin){
    //     return res.redirect("/")
    // }
    next();
}

module.exports = auth;
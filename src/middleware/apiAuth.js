const apiAuth = async (req, res, next) =>{
    if(!req.session.user){
        return res.send({error: "You are not a authorized user!"});
    }
    next();
}

module.exports = apiAuth;
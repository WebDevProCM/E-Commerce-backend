const auth = async (req, res, next) =>{
    if(!req.session.user){
        return res.send({error: "Not a authorized user"})
    }
    next();
}

module.exports = auth;
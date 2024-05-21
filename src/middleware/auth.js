const auth = async (req, res, next) =>{
    console.log(req.sessionID);
    if(!req.session.user){
        return res.send({error: "Not a authorized user"})
    }
    next();
}

module.exports = auth;
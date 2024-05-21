const apiAuth = async (req, res, next) =>{
    if(!req.session.user){
        return res.send({error: "You are not a authorized user!"});
    }
    // req.session.user = {
    //     "_id": "664701b666468e4ad39ec021",
    //     "name": "smack",
    //     "email": "smack@gmail.com",
    //     "address": "256"
    // };
    next();
}

module.exports = apiAuth;
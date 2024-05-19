const apiAuth = async (req, res, next) =>{
    // if(!req.session.user || !req.session.admin){
    //     return res.send({error: "You are not a authorized user!"});
    // }
    const user = {
        "_id": "664701b666468e4ad39ec021",
        "name": "smack",
        "email": "smack@gmail.com",
        "address": "256"
    };
    req.session.user = user;
    next();
}

module.exports = apiAuth;
const express = require("express");
const User = require("../models/user.js");

const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/apiAuth.js");
const idGenerator = require("../utilis/idGenerator.js");

const router = new express.Router();

router.post("/user", async (req, res) =>{
    const user = await User.authentication(req.body.email, req.body.password);
    if(user.error){
        return res.send({error: user.error})
    }
    req.session.user = await User.sendPublicData(user);
    res.send(User.sendPublicData(user));
});

//-------------------api endpoints---------------------------------------
router.post("/api/user", apiAuth, async (req, res) =>{
    try{
        const user = new User(req.body);
        if(!user){
            return res.send({error: "User not created!"});
        }

        await user.save();
        res.send(User.sendPublicData(user));
    }catch(error){
        console.log(error);
        if(error.message.includes("Invalid email")){
            return res.send({error: "Invalid email address!"});
        }
        res.send({error:"something went wrong!"});
    }
});

router.get("/api/user", apiAuth, async (req, res) =>{
    try{
        const users = await User.find({});
        res.send(users);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.get("/api/user/:id", apiAuth, async (req, res) =>{
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.send({error: "User not found!"});
        }

        res.send(User.sendPublicData(user));
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.patch("/api/user/:id", apiAuth, async (req, res) =>{
    try{
        const allowedFields = ["name", "address", "password", "image"];
        const updatingFields = Object.keys(req.body);
        const validationCheck = updatingFields.every((field) =>{
            return allowedFields.includes(field);
        });

        if(!validationCheck){
            return res.send({error: "Invalid field update!"});
        }
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!user){
            res.send({error: "User not updated!"});
        }

        await user.save();
        res.send(User.sendPublicData(user));
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.delete("/api/user/:id", apiAuth, async (req, res) =>{
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.send({error: "User not removed!"});
        }

        res.send(User.sendPublicData(user));
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

module.exports = router;
const express = require("express");
const User = require("../models/user.js");
const Adminauth = require("../middleware/auth.js");
const apiAuth = require("../middleware/apiAuth.js");
const imageCloud = require("../utilis/cloudinaryUploadImage.js");
const idGenerator = require("../utilis/idGenerator.js");

const router = new express.Router();

router.get("/user/logged", async (req, res) =>{
    try{
        if(req.session.user){
            return res.send(req.session.user);
        }
        res.send();
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});

router.post("/user/login", async (req, res) =>{
    try{
        const user = await User.authentication(req.body.email, req.body.password);
        if(user.error){
            return res.send({error: user.error})
        }
        req.session.user = User.sendPublicData(user);
        res.send(User.sendPublicData(user));
    }catch(error){
        res.send({error:"Something went wrong!"});
    }
});
router.post("/user/logout", apiAuth, async (req, res) =>{
    try{
        req.session.user = undefined;
        res.send({success: "Looged Out"});
    }catch(error){
        res.send({error: "Something went wrong!"});
    }
});
//-------------------api endpoints---------------------------------------
router.post("/api/user", async (req, res) =>{
    req.body.cusId = idGenerator.cusIdGenerator();
    try{
        const user = new User(req.body);
        if(!user){
            return res.send({error: "User not created!"});
        }

        await user.save();
        res.send(User.sendPublicData(user));
    }catch(error){
        if(error.message.includes("Invalid email")){
            return res.send({error: "Invalid email address!"});
        }
        res.send({error:"something went wrong!"});
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

router.get("/api/users", Adminauth, async (req, res) =>{
    try{
        const users = await User.find({});
        res.send(users);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.patch("/api/user/:id", apiAuth, async (req, res) =>{
    try{
        const allowedFields = ["name", "address", "password", "image"];
        if(req.files){
            const imageName = await imageCloud.uploadImage(req.files.image);
            if(imageName.error){
                return res.send({error: imageName.error});
            }

            req.body.image = imageName;
        }
        const updatingFields = Object.keys(req.body);
        const validationCheck = updatingFields.every((field) =>{
            return allowedFields.includes(field);
        });

        if(!validationCheck){
            return res.send({error: "Invalid field update!"});
        }
        const user = await User.findById(req.params.id);
        if(!user){
            res.send({error: "User not updated!"});
        }
        // const oldImageName = user.image;

        updatingFields.forEach((field)=>{
            user[field] = req.body[field];
        });

        // if(oldImageName !== user.image){
        //     const result =  await User.prevImageRemove(oldImageName);
        // }

        await user.save();
        if(req.session.user){
            req.session.user = await User.sendPublicData(user);
        }
        res.send(User.sendPublicData(user));
    }catch(error){
        console.log(error);
        res.send({error: "something went wrong!"});
    }
});

router.delete("/api/user/:id", Adminauth, async (req, res) =>{
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
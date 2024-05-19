const express = require("express");
const Admin = require("../models/admin.js");

const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/apiAuth.js");

const router = new express.Router();

router.post("/", async (req, res) =>{
    const admin = await Admin.authentication(req.body.email, req.body.password);
    if(admin.error){
        return res.send({error: admin.error})
    }
    req.session.admin = await Admin.sendPublicData(admin);
    res.send(Admin.sendPublicData(admin));
});

//-------------------api endpoints---------------------------------------
router.post("/api/admin", apiAuth, async (req, res) =>{
    try{
        const admin = new Admin(req.body);
        if(!admin){
            return res.send({error: "Admin not created!"});
        }

        await admin.save();
        res.send(Admin.sendPublicData(admin));
    }catch(error){
        console.log(error);
        res.send({error:"something went wrong!"});
    }
});

router.get("/api/admin", apiAuth, async (req, res) =>{
    try{
        const admins = await Admin.find({});
        res.send(admins);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.get("/api/admin/:id", apiAuth, async (req, res) =>{
    try{
        const admin = await Admin.findById(req.params.id);
        if(!admin){
            return res.send({error: "admin not found!"});
        }

        res.send(Admin.sendPublicData(admin));
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.patch("/api/admin/:id", apiAuth, async (req, res) =>{
    try{
        const allowedFields = ["name", "image", "password"];
        if(req.files){
            const imageName = await Admin.uploadImage(req.files.image);
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
        const admin = await Admin.findById(req.params.id);
        if(!admin){
            return res.send({error: "admin not updated!"});
        }
        const oldImageName = admin.image;
        updatingFields.forEach((field)=>{
            admin[field] = req.body[field];
        });

        if(oldImageName !== admin.image){
            const result =  await Admin.prevImageRemove(oldImageName);
        }

        await admin.save();
        req.session.user = await Admin.sendPublicData(admin)
        res.send(Admin.sendPublicData(admin));
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.delete("/api/admin/:id", apiAuth, async (req, res) =>{
    try{
        const admin = await Admin.findOneAndDelete({_id: req.params.id});
        if(!admin){
            return res.send({error: "admin not removed!"});
        }

        res.send(Admin.sendPublicData(admin));
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

module.exports = router;
const express = require("express");
const Product = require("../models/product.js");
const adminAuth = require("../middleware/auth.js");
const apiAuth = require("../middleware/apiAuth.js");
const idGenerator = require("../utilis/idGenerator.js");
const imageCloud = require("../utilis/cloudinaryUploadImage.js");

const router = new express.Router();

//-------------------api endpoints---------------------------------------
router.post("/api/product", adminAuth, async (req, res) =>{
    req.body.prodId = idGenerator.prodIdGenerator();
    try{
        if(req.files){
            const imageName = await imageCloud.uploadProductImage(req.files.image);
            if(imageName.error){
                return res.send({error: imageName.error});
            }

            req.body.image = imageName;
        }
        req.body.price = parseFloat(req.body.price).toFixed(2);

        if(req.body.oldPrice !== 0){
            req.body.oldPrice = parseFloat(req.body.oldPrice).toFixed(2);
        }

        const product = new Product(req.body);
        if(!product){
            return res.send({error: "product not created!"});
        }

        await product.save();
        res.send(product);
    }catch(error){
        console.log(error);
        res.send({error:"something went wrong!"});
    }
});

router.get("/api/product", async (req, res) =>{
    try{
        const products = await Product.find({});
        res.send(products);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.get("/api/product/:id", async (req, res) =>{
    try{
        const product = await Product.findOne({prodId: req.params.id});
        if(!product){
            return res.send({error: "product not found!"});
        }
        if(req.session.public){
            req.session.public.products.push(product);
        }
        res.send(product);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.patch("/api/product/:id", adminAuth, async (req, res) =>{
    try{
        const allowedFields = ["name", "quantity", "price", "oldPrice", "status", "image", "category", "type", "description", "ml"];

        if(req.files){
            const imageName = await imageCloud.uploadProductImage(req.files.image);
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
        if(req.body.price){
            req.body.price = parseFloat(req.body.price).toFixed(2);
        }

        if(req.body.oldPrice !== 0){
            req.body.oldPrice = parseFloat(req.body.oldPrice).toFixed(2);
        }

        const product = await Product.findOne({prodId: req.params.id});
        if(!product){
            res.send({error: "product not updated!"});
        }
        // const oldImageName = product.image;
        updatingFields.forEach((field)=>{
            product[field] = req.body[field];
        });

        // if(oldImageName !== product.image){
        //     const result =  await Product.prevImageRemove(oldImageName);
        // }

        await product.save();
        res.send(product);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.delete("/api/product/:id", adminAuth, async (req, res) =>{
    try{
        const product = await Product.findOneAndDelete({prodId: req.params.id});
        if(!product){
            return res.send({error: "product not found!"});
        }
        res.send(product);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

module.exports = router;
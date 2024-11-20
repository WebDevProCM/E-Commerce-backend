const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate: (email) =>{
            if(!validator.isEmail(email)){
                throw new Error("Invalid email address!");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
    }
})

adminSchema.pre("save",async function (next){
    const admin = this;
    if(admin.isModified("password")){
        admin.password = await bcrypt.hash(admin.password, 8);
    }

    next();
});

adminSchema.statics.uploadImage = (imageFile) =>{
    const allowedExt = ["jpg", "jpeg", "png", "JPEG"];
    let result = "";
    const imageName = imageFile.name;
    const imageExt = imageName.split(".").pop();
    
    const isValidExt = allowedExt.includes(imageExt);
    if(!isValidExt){
        return result = {error: "Invalid Image Format!"}
    } 

    const newImageName = new ObjectId().toHexString() + "." + imageExt;
    imageFile.mv(path.resolve(`./public/images/admin/${newImageName}`), (error) => {
        if(error){
            return result =  {error: "something went wrong!"}
        }
    });
    return result = newImageName;
}

adminSchema.statics.prevImageRemove = async (imageName) =>{
    if(imageName === "noAdminImage.png"){
        return {error: "No image to remove!"}
    }

    await fs.unlink(`./public/images/admin/${imageName}`, (error) =>{
        if(error){
            return {error: "something went wrong!"}
        }
    });
    return {success: "old image removed!"};
}

adminSchema.statics.sendPublicData = (admin) =>{
    return{
        _id: admin._id,
        name: admin.name,
        image: admin.image,
        email: admin.email
    }
}

adminSchema.statics.authentication = async (email, password) =>{
    const admin = await Admin.findOne({email: email});

    if(!admin){
        return {error: "Invalid Credentials"}
    }

    const passwordCheck = await bcrypt.compare(password, admin.password);

    if(!passwordCheck){
        return {error: "Invalid Credentials"}
    }

    return admin;
}

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    cusId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    email:{
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
    address: {
        type: String,
        default: "world",
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
        default: "noUserImage"
    }
});

// userSchema.statics.uploadImage = (imageFile) =>{
//     const allowedExt = ["jpg", "jpeg", "png", "JPEG"];
//     let result = "";
//     const imageName = imageFile.name;
//     const imageExt = imageName.split(".").pop();
    
//     const isValidExt = allowedExt.includes(imageExt);
//     if(!isValidExt){
//         return result = {error: "Invalid Image Format!"}
//     } 

//     const newImageName = new ObjectId().toHexString() + "." + imageExt;
//     imageFile.mv(path.resolve(`./public/images/users/${newImageName}`), (error) => {
//         if(error){
//             return result =  {error: "something went wrong!"}
//         }
//     });
//     return result = newImageName;
// }

// userSchema.statics.prevImageRemove = async (imageName) =>{
//     if(imageName === "noUserImage.png"){
//         return {error: "No image to remove!"}
//     }

//     await fs.unlink(`./public/images/users/${imageName}`, (error) =>{
//         if(error){
//             return {error: "something went wrong!"}
//         }
//     });
//     return {success: "old image removed!"};
// }

userSchema.statics.sendPublicData = (user) =>{
    return{
        _id: user._id,
        cusId: user.cusId,
        name: user.name,
        image: user.image,
        email: user.email,
        address: user.address
    }
}

userSchema.statics.authentication = async (email, password) =>{
    const user = await User.findOne({email: email});

    if(!user){
        return {error: "Invalid Credentials"}
    }

    const passwordCheck = await bcrypt.compare(password, user.password);

    if(!passwordCheck){
        return {error: "Invalid Credentials"}
    }

    return user;
}

userSchema.pre("save",async function (next){
    const user = this;
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

const User =  mongoose.model("Users", userSchema);

module.exports = User;


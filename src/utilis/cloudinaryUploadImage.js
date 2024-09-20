const cloudinary = require('cloudinary').v2

if(!process.env.CLOUDINARY_CLOUD_NAME){
    console.log(process.env.CLOUDINARY_CLOUD_NAME)
    throw new Error("Cloudinary name is not define!")
}
if(!process.env.CLOUDINARY_API_KEY){
    throw new Error("Cloudinary api key is not define!")
}
if(!process.env.CLOUDINARY_API_SECRET){
    throw new Error("Cloudinary secret is not define!")
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})

async function uploadImage(image){
    const fileSize = 1024 * 1024 * 3;
    if(image.size > fileSize){
        return {error: "Image size should be less than 3MB"}
    }
    const MIME = image.mimetype;
    const encoding = 'base64';
    const base64Data = image.data.toString('base64');
    const fileURL = 'data:' + MIME + ';' + encoding + ',' + base64Data;
    const result = await cloudinary.uploader.upload(fileURL, {
        folder: 'E-commerce-users'
    })
    return result.secure_url;
}

async function uploadProductImage(image){
    const fileSize = 1024 * 1024 * 3;
    if(image.size > fileSize){
        return {error: "Image size should be less than 3MB"}
    }
    const MIME = image.mimetype;
    const encoding = 'base64';
    const base64Data = image.data.toString('base64');
    const fileURL = 'data:' + MIME + ';' + encoding + ',' + base64Data;
    const result = await cloudinary.uploader.upload(fileURL, {
        folder: 'E-commerce-Products'
    })
    return result.secure_url;
}

module.exports = {uploadImage, uploadProductImage}
const multer = require("multer");
const cloudinary = require("cloudinary");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: "IssueTracker",
    allowedFormats: ["jpg", "png", "pdf"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
});
const parser = multer({ storage: storage });

let uploadCloudinary = (parser);

module.exports = {
    uploadCloudinary: uploadCloudinary
}
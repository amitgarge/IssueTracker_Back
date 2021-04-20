const cloudinary = require("cloudinary");
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

let deleteFromCloudinary = (public_id) => {
    cloudinary.uploader.destroy(public_id,
        function (error, result) {
            console.log(result, error);
        });
}

module.exports = {
    deleteFromCloudinary: deleteFromCloudinary
}
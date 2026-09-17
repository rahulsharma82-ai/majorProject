const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// yaha pe ham cloudinary ko congigure kar rhe hai 
cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});

// yaha pe ham storage ke liye define kar rhe hai 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wanderlust-DEV",
    allowerdFormates:["png","jpg","jpeg"], //ham yaha pe ye sab type ke file wale pic ko store kar rhe hia 
  },
});

module.exports={
    cloudinary,
    storage,
}
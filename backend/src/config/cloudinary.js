const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
 * Uploads a file buffer to Cloudinary and returns { url, publicId }.
 * Wrapped so controllers don't talk to the cloudinary SDK directly.
 */
const uploadBufferToCloudinary = (buffer, folder = 'pharmacare/medicines') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = (publicId) => {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary };

/*cloudinary.js is a configuration file that initializes the Cloudinary SDK 
using credentials stored in environment variables.
Instead of configuring Cloudinary in every controller, we configure 
it once and export the instance. Controllers then import this configured instance 
to upload images, such as prescription files, and store the returned secure URL 
in the database.*/
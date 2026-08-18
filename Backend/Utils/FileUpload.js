const { json } = require('express');
const {Jimp} =require('jimp')

const cloudinary = require('cloudinary').v2;

cloudinary.config(JSON.parse(process.env.cloudnaryconfig));


exports.uploadimage = async (files) => { 
  const fileArray = Object.values(files); // Convert files object to an array
  const results = []; // This will store the result of each upload

  // Upload each file one by one
  for (const file of fileArray) {
    try {

       const image = await Jimp.read(file.data);

      // Resize image
      image.resize({
        w: 1000
      });

      // Convert image to JPEG buffer
      const buffer = await image.getBuffer("image/jpeg");

      const result = await new Promise((resolve, reject) => {
        // Upload the file to Cloudinary
        cloudinary.uploader.upload_stream(
          (error, result) => {
           
           
            if (error) {
              reject(error); // Reject if there's an error
            } else {
              resolve(result); // Resolve with the result if upload is successful
            }
          }
        ).end(buffer); // Start uploading the file
      });
      

      results.push(result); // Store the result of the upload
    } catch (error) {
      console.error('Error uploading file:', error); // Log the error if upload fails
    }
  }
 
  return results; // Return the list of upload results
};
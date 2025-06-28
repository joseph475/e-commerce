const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImage = async (file, folder = 'pos-products') => {
  try {
    console.log('Uploading image to Cloudinary:', {
      path: file.path,
      folder: folder,
      originalname: file.originalname
    });

    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    });

    console.log('Cloudinary upload successful:', {
      url: result.secure_url,
      public_id: result.public_id
    });

    // Clean up temporary file
    try {
      fs.unlinkSync(file.path);
      console.log('Temporary file cleaned up:', file.path);
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Clean up temporary file even on error
    try {
      fs.unlinkSync(file.path);
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file after error:', cleanupError);
    }
    
    throw new Error('Failed to upload image: ' + error.message);
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

// Generate thumbnail URL
const getThumbnailUrl = (publicId, width = 200, height = 200) => {
  return cloudinary.url(publicId, {
    width: width,
    height: height,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getThumbnailUrl
};

import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance with memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Utility function to upload image buffer to Cloudinary
export const uploadToCloudinary = async (buffer, folder = 'visitor') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `society-sync/${folder}`,
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload image to Cloudinary'));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

// Specific upload functions for visitor photos
export const uploadVisitorPhoto = async (buffer) => {
  return await uploadToCloudinary(buffer, 'visitor/photo');
};

export const uploadVisitorIdCard = async (buffer) => {
  return await uploadToCloudinary(buffer, 'visitor/id');
};

// Multer middleware for different upload types
export const uploadVisitorPhotoMiddleware = upload.single('photo');
export const uploadVisitorIdCardMiddleware = upload.single('idCardPhoto');

// Export the base upload instance for general use
export { upload, cloudinary };

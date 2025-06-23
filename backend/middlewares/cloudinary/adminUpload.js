
import cloudinary from "../../config/cloudinary.js";
import fs from 'fs/promises';

export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: "No images uploaded" });
    }
    console.log("req.files:", req.files);


    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    const uploadedImages = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "adminUploads",
      });
      uploadedImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
      await fs.unlink(file.tempFilePath);
    }

    req.uploadedImages = uploadedImages;
    next();
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
     return res.status(500).json({ message: "Image upload failed", error: error.message || error });

  }
};

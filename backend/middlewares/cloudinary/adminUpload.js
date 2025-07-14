



import cloudinary from "../../config/cloudinary.js";
import fs from "fs/promises";

export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.images ) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const uploadedImages = [];

    for (const [index, file] of files.entries()) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "adminUploads",
      });

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
        isPrimary: index === 0, 
        alt: index === 0 ? "Featured image" : "Gallery image",
      });

      await fs.unlink(file.tempFilePath);
    }

    req.uploadedImages = uploadedImages;
    next();
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return res.status(500).json({
      message: "Image upload failed",
      error: error.message || error,
    });
  }
};








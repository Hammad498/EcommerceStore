import cloudinary from "../../config/cloudinary.js";

const uploadImage=async(req,res,next)=>{
    try {
        if(!req.files || !req.files.image ){
            return res.status(400).json({ message: "No image file provided" });
        }

        const file=req.files.image;
        const result=await cloudinary.uploader.upload(file,tempFilePath, {
            folder: "adminUploads",
            resource_type: "image"
        })
        req.body.image = result.secure_url; 
        next();
    } catch (error) {
        res.status(500).json({
            message: "Image upload failed",
            error: error.message
        });
    }
}


export default uploadImage;
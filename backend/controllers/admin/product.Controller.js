import Product from "../../models/product.Model.js";
import cloudinary from "../../config/cloudinary.js";




export const addProduct=async(req,res)=>{
    try {
        const {
            title,
            slug,
            description,
            brand,
            category,
            tags,
            variations,
            specs,
            sku,
            discount
        }=req.body;

        const parsedVariations = variations ? JSON.parse(variations) : [];
        const parsedSpecs = specs ? JSON.parse(specs) : [];
        const tagsArray = tags ? JSON.parse(tags) : [];

        const images = (req.uploadedImages || []).map(img => img.url);


        const newProduct=new Product({
            title,
            slug,
            description,
            brand,
            category,
            tags: tagsArray,
            images,
            variations: parsedVariations,
            specs: parsedSpecs,
            sku,
            discount:discount ? JSON.parse(discount) : null,
            inStock: parsedVariations.some((v) => v.stock > 0),
        })

        await newProduct.save();
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message || "Internal Server Error"
        });
    }
}


/////////////////////////////////

export const getAllProduct=async(req,res)=>{
    try {
        const products=await Product.find().populate('reviews.user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        console.log("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message || "Internal Server Error"
        });
    }
}

////////////////////////////////////////////////


const extractPublicId = (url) => {
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.split('.')[0];
};

export const editproduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // If new images uploaded, delete old ones from Cloudinary
    const images = req.uploadedImages?.map(img => img.url) || [];

    if (images.length > 0 && product.images.length > 0) {
      for (const imageUrl of product.images) {
        const publicId = extractPublicId(imageUrl);
        await cloudinary.uploader.destroy(`adminUploads/${publicId}`);
      }
    }

    const updatedData = {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      brand: req.body.brand,
      category: req.body.category,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      variations: req.body.variations ? JSON.parse(req.body.variations) : [],
      specs: req.body.specs ? JSON.parse(req.body.specs) : [],
      sku: req.body.sku,
      discount: req.body.discount ? JSON.parse(req.body.discount) : null,
      images: images.length > 0 ? images : product.images, 
      inStock: req.body.variations
        ? JSON.parse(req.body.variations).some(v => v.stock > 0)
        : product.inStock
    };

    const editedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: editedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message || "Internal Server Error"
    });
  }
};
////////////////////////////////////////////////


export const deleteProduct=async(req,res)=>{
    try {
        const productId=req.params.id;
        if(!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const product=await Product.findById(productId);
        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete images from Cloudinary
        for (const imageUrl of product.images) {
            const publicId = extractPublicId(imageUrl);
            await cloudinary.uploader.destroy(`adminUploads/${publicId}`);
        }
        await Product.findByIdAndDelete(productId);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message || "Internal Server Error"
        });
    }
}
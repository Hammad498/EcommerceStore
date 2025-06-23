import Product from "../../models/product.Model.js";



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
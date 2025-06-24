import category from "../../../models/product/category.model.js";
import cloudinary from "../../../config/cloudinary.js";


export const createCategory=async(req,res)=>{
    const {name,slug,description,parentCategory,image,filterAttributes}=req.body;
    if(!name || !slug){
        return res.status(400).json({message:"Name and slug are required"});
    }

    try {
        const existingCategory = await category.findOne({ slug: slug });    
        if (existingCategory) {
            return res.status(400).json({message:"Category with this slug already exists"});
        }
        const images = (req.uploadedImages || []).map(image => image.url);
       
        const filterAttributes = filterCategoryParsed.map(attr => ({
            name: attr.name,
            type: attr.type || "enum",
            options: attr.options || [] 
        }));
        const newCategory = new category({
            name,
            slug,
            description,
            parentCategory: parentCategory || null,
            image: images || null,
            filterAttributes: filterAttributes || []
        });
        const savedCategory = await newCategory.save();
        return res.status(201).json({message:"Category created successfully",category:savedCategory});
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({message:"Internal server error"});
        
    }
}

///////////////////////////////////////////////

export const getAllCategory=async(req,res)=>{
    res.status(200).json({
        message:"All categories fetched successfully",
        categories: await category.find({}).populate("parentCategory")
    });
}
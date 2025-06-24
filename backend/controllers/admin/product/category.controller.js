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
       
       const filterCategoryParsed = filterAttributes ? JSON.parse(filterAttributes) : [];
const parsedFilterAttributes = filterCategoryParsed.map(attr => ({
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
            filterAttributes: parsedFilterAttributes || []
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
    try {
        const categories = await category.find().populate("parentCategory", "name slug");
        return res.status(200).json({message:"Categories fetched successfully",categories});
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({message:"Internal server error"});
    }
}

//////////////////////////////////////////////


export const getAllCategoryById=async(req,res)=>{
    try {
        const categoryId = req.params.id;
        if (!categoryId) {
            return res.status(400).json({message:"category ID is required"});
        }
        const categoryData=await category.findById(categoryId).populate("parentCategory", "name slug");
        if (!categoryData) {
            return res.status(404).json({message:"Category not found"});
        }
        return res.status(200).json({message:"Category fetched successfully",category:categoryData});

    } catch (error) {
        console.error("Error fetching category by ID:", error);
        return res.status(500).json({message:"Internal server error"});
    }
}

////////////////////////////////////////////////


export const editCategory=async(req,res)=>{
    try {
        const categoryId = req.params.id;
        if (!categoryId) {
            return res.status(400).json({message:"Category ID is required"});
        }
        const {name,slug,description,parentCategory,image,filterAttributes}=req.body;
        if (!name || !slug) {
            return res.status(400).json({message:"Name and slug are required"});
        }
        const existingCategory = await category.findOne({ slug: slug, _id: { $ne: categoryId } });
        if (existingCategory) {
            return res.status(400).json({message:"Category with this slug already exists"});
        }
        const images = (req.uploadedImages || []).map(image => image.url);
        const filterCategoryParsed = filterAttributes ? JSON.parse(filterAttributes) : [];
        const filterAttributesParsed = filterCategoryParsed.map(attr => ({
            name: attr.name,
            type: attr.type || "enum",
            options: attr.options || [] 
        }));
        const updatedCategory = {
            name,
            slug,
            description,
            parentCategory: parentCategory || null,
            image: images || null,
            filterAttributes: filterAttributesParsed || []
        };
        const updatedCategoryData = await category.findByIdAndUpdate(categoryId, updatedCategory, { new: true });
        if (!updatedCategoryData) {
            return res.status(404).json({message:"Category not found"});
        }
        return res.status(200).json({message:"Category updated successfully",category:updatedCategoryData});

    } catch (error) {
        console.error("Error editing category:", error);
        return res.status(500).json({message:"Internal server error"});
        
    }
}
/////////////////////////////////////////////////////////////


export const deleteCategory=async(req,res)=>{
    try {
        const categoryId = req.params.id;
        if (!categoryId) {
            return res.status(400).json({message:"Category ID is required"});
        }
        const categoryData = await category.findById(categoryId);
        if (!categoryData) {
            return res.status(404).json({message:"Category not found"});
        }
        await category.findByIdAndDelete(categoryId);
        return res.status(200).json({message:"Category deleted successfully"});
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({message:"Internal server error"});
    }
}
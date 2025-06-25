import Category from "../../../models/product/category.model.js";
import slugify from "slugify";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

///////////////////////////////////

export const createCategory = async (req, res) => {
  try {
    // console.log("REQ.BODY:", req.body);
    // console.log("REQ.UPLOADED IMAGES:", req.uploadedImages);

    const { name, slug, description, attributes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const sluged = slug || slugify(name, { lower: true, strict: true });

    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug: sluged }],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    
    let parsedAttributes = [];
    if (attributes) {
      try {
        parsedAttributes = typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch (e) {
        console.error("Invalid JSON in attributes:", e);
        return res.status(400).json({ success: false, message: "Invalid attributes format" });
      }
    }

    const images = (req.uploadedImages || []).map((img) => img.url);

    const category = new Category({
      name,
      slug: sluged,
      description,
      attributes: parsedAttributes,
      images: images,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: [category,category._id],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



/////////////////////////////////////////////////

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, attributes } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    // Parse attributes
    let parsedAttributes = [];
    try {
      parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
    } catch (e) {
      console.error("Invalid JSON in attributes:", e);
      return res.status(400).json({ success: false, message: "Invalid attributes format" });
    }

    const updatedData = {
      name,
      slug: slug || slugify(name, { lower: true, strict: true }),
      description,
      attributes: parsedAttributes,
      image: (req.uploadedImages || []).map((img) => img.url),
    };

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
      
    });

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


////////////////////////////////////////


export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: "Category ID is required" });
        }
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        await Category.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Server error" });
        
    }
}


import Product from "../../../models/product/product.model.js";
import Category from "../../../models/product/category.model.js";
import slugify from "slugify";



export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      brand,
      category,
      badges,
      baseSKU,
      variations,
      metaTitle,
      metaDescription,
      isFeatured,
      slug,
    } = req.body;

    if (!title || !description || !brand ||!badges || !category || !baseSKU || !variations || variations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const generatedSlug = slug || slugify(title, { lower: true, strict: true });

    const images = (req.uploadedImages || []).map((img) => ({
      url: img.url,
      alt: `Main image for ${title}`,
    }));

    let parsedVariations;
    try {
      parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid variations format" });
    }

    
    const requiredAttributes = categoryDoc.attributes.filter(attr => attr.required).map(attr => attr.name.toLowerCase());
    for (const [index, variation] of parsedVariations.entries()) {
      for (const attrName of requiredAttributes) {
        if (!variation.attributes || !variation.attributes[attrName]) {
          return res.status(400).json({
            success: false,
            message: `Variation ${index + 1} is missing required attribute: ${attrName}`,
          });
        }
      }
    }

    const processedVariations = parsedVariations.map((variation, index) => {
      const variantSKU = `${baseSKU}-${index + 1}`;
      return {
        variantSKU,
        attributes: variation.attributes,
        price: variation.price ?? 0,
        discountPrice: variation.discountPrice ?? 0,
        stock: variation.stock ?? 0,
        isActive: variation.isActive !== false,
        images: (variation.uploadedImages || []).map((img) => ({
          url: img.url,
          alt: img.alt || `Image for ${variantSKU}`,
        })),
      };
    });

    const product = new Product({
      title,
      slug: generatedSlug,
      description,
      brand,
      category: categoryDoc._id,
      badges,
      baseSKU,
      variations: processedVariations,
      metaTitle,
      metaDescription,
      isFeatured: !!isFeatured,
      images,
      createdBy: req.user?._id,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

///////////////////////////////////////////////////////////////////

export const getAllProducts=async(req,res)=>{
  try {
    const product=await Product.find({}).populate({
      path:"category",
      select:"name"
    }).populate({
      path:"createdBy", select:"name"
    }).sort({createdAt:-1})
    .select("-__v  -createdBy.email -createdBy.role");
    if(!product || product.length === 0){
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: product,
    });
  } catch (error) {
    console.log("Error in fetching all the products!");
    res.status(500).json({
      success:false,
      message:"Failed to fetch:server error",
      error:error.message
    })
  }
}


///////////////////////////////////


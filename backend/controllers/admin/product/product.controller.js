
import Product from "../../../models/product/product.model.js";
import Category from "../../../models/product/category.model.js";
import slugify from "slugify";
import {skuGenerator} from '../../../services/skuGenerator.js'
import mongoose from "mongoose";



// export const createProduct = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       brand,
//       category,
//       badges,
//       variations,
//       metaTitle,
//       metaDescription,
//       isFeatured,
//       slug,
//     } = req.body;

//     if (!title || !description || !brand ||!badges || !category  || !variations || variations.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     const baseSKU=skuGenerator({title});

//     const categoryDoc = await Category.findById(category);
//     if (!categoryDoc) {
//       return res.status(404).json({ success: false, message: "Category not found" });
//     }

//     const generatedSlug = slug || slugify(title, { lower: true, strict: true });

//     const images = (req.uploadedImages || []).map((img) => ({
//       url: img.url,
//       alt: `Main image for ${title}`,
//     }));

//     let parsedVariations;
//     try {
//       parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;
//     } catch (e) {
//       return res.status(400).json({ success: false, message: "Invalid variations format" });
//     }

    
//     const requiredAttributes = categoryDoc.attributes.filter(attr => attr.required).map(attr => attr.name.toLowerCase());
//     for (const [index, variation] of parsedVariations.entries()) {
//       for (const attrName of requiredAttributes) {
//         if (!variation.attributes || !variation.attributes[attrName]) {
//           return res.status(400).json({
//             success: false,
//             message: `Variation ${index + 1} is missing required attribute: ${attrName}`,
//           });
//         }
//       }
//     }

//     const processedVariations = parsedVariations.map((variation, index) => {
//       const variantSKU = skuGenerator({title:baseSKU, attributes: variation.attributes}) || `${baseSKU}-${index + 1}`;
//       return {
//         variantSKU,
//         attributes: variation.attributes,
//         price: variation.price ?? 0,
//         discountPrice: variation.discountPrice ?? 0,
//         stock: variation.stock ?? 0,
//         isActive: variation.isActive !== false,
//         images: (variation.uploadedImages || []).map((img) => ({
//           url: img.url,
//           alt: img.alt || `Image for ${variantSKU}`,
//         })),
//       };
//     });

    

//     const product = new Product({
//       title,
//       slug: generatedSlug,
//       description,
//       brand,
//       category: categoryDoc._id,
//       badges,
//       baseSKU: baseSKU,
//       variations: processedVariations,
//       metaTitle,
//       metaDescription,
//       isFeatured: !!isFeatured,
//       images,
//       createdBy: req.user?._id,
//     });

//     await product.save();

//     res.status(201).json({
//       success: true,
//       message: "Product created successfully",
//       data: product,
//     });

//   } catch (error) {
//     console.error("Error creating product:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create product",
//       error: error.message,
//     });
//   }
// };

///////////////////////////////////////////////////////////////////





/////////////////////////////////



export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      brand,
      category,
      badges,
      variations,
      metaTitle,
      metaDescription,
      isFeatured,
      slug,
    } = req.body;

    if (!title || !description || !brand || !badges || !category || !variations) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const baseSKU = skuGenerator({ title });

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const generatedSlug = slug || slugify(title, { lower: true, strict: true });
    const images = req.uploadedImages || [];

    let parsedVariations;
    try {
      parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid variations format" });
    }

    const requiredAttributes = categoryDoc.attributes
      .filter(attr => attr.required)
      .map(attr => attr.name.toLowerCase());

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
      const variantSKU = skuGenerator({ title: baseSKU, attributes: variation.attributes }) || `${baseSKU}-${index + 1}`;
      return {
        variantSKU,
        attributes: variation.attributes,
        price: variation.price ?? 0,
        discountPrice: variation.discountPrice ?? 0,
        stock: variation.stock ?? 0,
        isActive: variation.isActive !== false,
        images: [], 
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




//////////////////////////


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

export const getById=async(req,res)=>{
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }
    const product=await Product.findById(id).populate({
      path:"category",
      select:"name"
    }).populate({
      path:"createdBy", select:"name"
    }).select("-__v -createdBy.email -createdBy.role");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    })
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
}

////////////////////////


// export const editproduct=async(req,res)=>{
//   try{
//     const {id}=req.params;
//     if(!id){
//       return res.status(400).json({
//         success: false,
//         message: "Product ID is required",
//       })
//     }
//     const product=await Product.findById(id);
//     if(!product){
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       })
//     }
//     const {title,description,brand,category,badges,baseSKU,variations,metaTitle,metaDescription,isFeatured,slug}=req.body;
//     if(!title || !description ||!slug || !brand || !badges || !category || !baseSKU || !variations || variations.length === 0){
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       })
//     }
//     const categoryDoc=await Category.findById(category);
//     if(!categoryDoc){
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       })
//     }
    

//     const generatedSlug = slug || slugify(title, { lower: true, strict: true });
//     const images = (req.uploadedImages || []).map((img) => ({
//       url: img.url,
//       alt: `Main image for ${title}`,
//     }));
//     let parsedVariations;
//     try {
//       parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;
//     } catch (e) {
//       return res.status(400).json({ success: false, message: "Invalid variations format" });
//     }

//     const requiredAttributes = categoryDoc.attributes.filter(attr => attr.required).map(attr => attr.name.toLowerCase());
//     for (const [index, variation] of parsedVariations.entries()) {
//       for (const attrName of requiredAttributes) {
//         if (!variation.attributes || !variation.attributes[attrName]) {
//           return res.status(400).json({
//             success: false,
//             message: `Variation ${index + 1} is missing required attribute: ${attrName}`,
//           });
//         }
//       }
//     }
    
//     const processedVariations=parsedVariations.map((variation,index)=>{
//       const variantSKU=`${baseSKU}-${index +1}`;
//       return {
//         variantSKU,
//         attributes: variation.attributes,
//         price: variation.price ?? 0,
//         discountPrice: variation.discountPrice ?? 0,
//         stock: variation.stock ?? 0,
//         isActive: variation.isActive !== false,
//         images: (variation.uploadedImages || []).map((img) => ({
//           url: img.url,
//           alt: img.alt || `Image for ${variantSKU}`,
//         })),
//       }
//     })
//     const updatedProduct = await Product.findByIdAndUpdate(
//   id,
//   {
//     title,
//     description,
//     brand,
//     slug: generatedSlug,
//     category: categoryDoc._id,
//     badges,
//     baseSKU,
//     variations: processedVariations,
//     metaTitle,
//     metaDescription,
//     isFeatured: !!isFeatured,
//     images,
//     updatedBy: req.user?._id, 
//   },
//   { new: true }
// );

//     res.status(200).json({
//       success:true,
//       message:"Successfully updated!",
//       data:updatedProduct
//     })
//   }catch(error){
//     console.log("Error in editing product:", error);
//     res.status(500).json({
//       success:false,
//       message:"Failed to edit product: server error",
//       error:error.message
//     })
//   }
// }




export const editproduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      title,
      description,
      brand,
      category,
      badges,
      variations,
      metaTitle,
      metaDescription,
      isFeatured,
      slug,
    } = req.body;

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const generatedSlug = slug || slugify(title, { lower: true, strict: true });

    const updatedImages = req.uploadedImages?.length
      ? req.uploadedImages
      : existingProduct.images;

    let parsedVariations;
    try {
      parsedVariations = typeof variations === "string" ? JSON.parse(variations) : variations;
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid variations format" });
    }

    const processedVariations = parsedVariations.map((variation, index) => {
      const variantSKU = skuGenerator({ title, attributes: variation.attributes }) || `${existingProduct.baseSKU}-${index + 1}`;
      return {
        variantSKU,
        attributes: variation.attributes,
        price: variation.price ?? 0,
        discountPrice: variation.discountPrice ?? 0,
        stock: variation.stock ?? 0,
        isActive: variation.isActive !== false,
        images: [], // Optional variant-level image logic
      };
    });

    Object.assign(existingProduct, {
      title,
      slug: generatedSlug,
      description,
      brand,
      category: categoryDoc._id,
      badges,
      metaTitle,
      metaDescription,
      isFeatured: !!isFeatured,
      images: updatedImages,
      variations: processedVariations,
    });

    await existingProduct.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: existingProduct,
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};




///////////////////////////////////


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const deleted = await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Successfully deleted!",
      data: deleted,
    });

  } catch (error) {
    console.error('Error deleting product:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Unable to delete the product! : Server error",
      error: error.message || "Unknown error"
    });
  }
};
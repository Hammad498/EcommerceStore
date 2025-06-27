import { body, validationResult } from "express-validator";

export const productValidation = [
  body('title')
    .notEmpty().withMessage('Product title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),

  body('slug')
    .optional()
    .isLength({ min: 3 }).withMessage('Slug must be at least 3 characters long')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be lowercase with hyphens'),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),

  body('brand')
    .notEmpty().withMessage('Brand is required')
    .isLength({ min: 2 }).withMessage('Brand must be at least 2 characters long'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),



  body('variations')
    .notEmpty().withMessage('Variations are required')
    .custom((value) => {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Variations must be a non-empty array');
      }

      for (const variation of parsed) {
        if (!variation.attributes || typeof variation.attributes !== 'object') {
          throw new Error('Each variation must have an attributes object');
        }

        if (variation.price !== undefined && (typeof variation.price !== 'number' || variation.price < 0)) {
          throw new Error('Variation price must be a non-negative number');
        }

        if (variation.discountPrice !== undefined && (typeof variation.discountPrice !== 'number' || variation.discountPrice < 0)) {
          throw new Error('Variation discountPrice must be a non-negative number');
        }

        if (variation.stock !== undefined && (typeof variation.stock !== 'number' || variation.stock < 0)) {
          throw new Error('Variation stock must be a non-negative number');
        }

        if (variation.isActive !== undefined && typeof variation.isActive !== 'boolean') {
          throw new Error('Variation isActive must be a boolean');
        }

        if (variation.uploadedImages !== undefined) {
          if (!Array.isArray(variation.uploadedImages)) {
            throw new Error('Variation images must be an array');
          }
          for (const img of variation.uploadedImages) {
            if (!img.url || typeof img.url !== 'string' || !img.url.startsWith('http')) {
              throw new Error('Each image must have a valid URL');
            }
          }
        }
      }

      return true;
    }),

  body('metaTitle')
    .optional()
    .isLength({ max: 60 }).withMessage('Meta title must not exceed 60 characters'),

  body('metaDescription')
    .optional()
    .isLength({ max: 160 }).withMessage('Meta description must not exceed 160 characters'),

  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

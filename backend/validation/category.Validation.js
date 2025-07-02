import {body} from 'express-validator';

// export const categoryValidation = [
//     body('name')
//         .notEmpty().withMessage('Category name is required')
//         .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long'),
//     body('slug')
//         .notEmpty().withMessage('Slug is required')
//         .isLength({ min: 3 }).withMessage('Slug must be at least 3 characters long')
//         .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be lowercase and can only contain letters, numbers, and hyphens'),
//     body('description')
//         .optional()
//         .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
//     body('attributes')
//         .optional()
//         .isArray().withMessage('Attributes must be an array')
//         .custom((value) => {
//             if (value.length === 0) {
//                 return true; // Allow empty array
//             }
//             for (const attr of value) {
//                 if (!attr.name || !attr.type) {
//                     throw new Error('Each attribute must have a name and type');
//                 }
//                 if (!['dropdown', 'color', 'size', 'text'].includes(attr.type)) {
//                     throw new Error('Attribute type must be one of: dropdown, color, size, text');
//                 }
//             }
//             return true;
//         })
//         .withMessage('Invalid attributes format'),
//     body('images')
//         .optional()
//         .isArray().withMessage('Images must be an array')
//         .custom((value) => {
//             if (value.length === 0) {
//                 return true; // Allow empty array
//             }
//             for (const img of value) {
//                 if (typeof img !== 'string' || !img.startsWith('http')) {
//                     throw new Error('Each image must be a valid URL');
//                 }
//             }
//             return true;
//         })
//         .withMessage('Invalid images format'),

//     body('isActive')
//         .optional()
//         .isBoolean().withMessage('isActive must be a boolean value'),
//     (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ success: false, errors: errors.array() });
//         }
//         next();
//     }
// ];
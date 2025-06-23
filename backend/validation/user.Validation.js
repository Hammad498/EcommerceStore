import { body } from "express-validator";



export const loginValidation = [
  body("email").trim().isEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),
    
    body("password").trim().isEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  body("rememberMe").optional().isBoolean().withMessage("Remember Me must be a boolean value"),
];
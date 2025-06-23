import { body } from "express-validator";



export const loginValidation = [
  body("email").trim().isEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

    body("password").trim().isEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  body("rememberMe").optional().isBoolean().withMessage("Remember Me must be a boolean value"),
];


export const registerValidation = [
  body("name").trim().isEmpty().withMessage("Name is required")
    .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    body("email").trim().isEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),
    body("password").trim().isEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  body("address.street").trim().isEmpty().withMessage("Street is required"),
    body("address.city").trim().isEmpty().withMessage("City is required"),
    body("address.state").trim().isEmpty().withMessage("State is required"),
    body("address.country").trim().isEmpty().withMessage("Country is required"),
    body("address.region").trim().isEmpty().withMessage("Region is required"),
    body("address.zip").trim().isEmpty().withMessage("Zip code is required")
    .isPostalCode("any").withMessage("Invalid zip code format"),
    body("address.addressLine1").trim().isEmpty().withMessage("Address Line 1 is required"),
    body("address.addressLine2").trim().isEmpty().withMessage("Address Line 2 is required"),
    body("phone").optional().isMobilePhone("any").withMessage("Invalid phone number format"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Role must be either 'user' or 'admin'"),
    body("isVerified").optional().isBoolean().withMessage("isVerified must be a boolean value"),


]
    
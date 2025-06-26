import User from "../../models/user.model.js";
import { validationResult } from 'express-validator';


export const loginUser=async(req,res)=>{
    const {email,password}=req.body;
 if(!email || !password){
     return res.status(400).json({message:"Email and password are required"});
 }
 const user=await User.findOne({email});
    if(!user){
        return res.status(404).json({message:"User not found: needed to be registered first"});
    }

    const isPasswordMatch=await user.matchPassword(password);
    if(!isPasswordMatch){
        return res.status(401).json({message:"Invalid email or password"});
    }

    const token = user.generateToken();

    res.status(200).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified:user.isVerified
        },
        message: "Login successful"
    });
}


//////////////////









export const registerUser = async (req, res) => {
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    
    const {
        name,
        email,
        password,
        address,
        phone,
        role = "user",
        isVerified = true
    } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = new User({
            name,
            email,
            password,
            address,
            phone,
            role,
            isVerified
        });

        await user.save();

        const token = user.generateToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            },
            message: "User registered successfully"
        });

    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};






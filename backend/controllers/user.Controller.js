
import User from "../models/user.model.js"


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
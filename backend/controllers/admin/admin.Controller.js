
import User from "../../models/user.model.js";


export const loginAdmin=async(req,res)=>{
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


////////////////////////////////////////////////

export const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email }); 

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
        name,
        email,
        password,
        role: "admin",
        isVerified: true
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
        message: "Admin registered successfully"
    });
};


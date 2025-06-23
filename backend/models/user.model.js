import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min: 3,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match: /.+\@.+\..+/,
        min: 5,
    },
    password:{
        type:String,
        required:true,
        min: 6,
    },
    role:{
        type:String,
        enum:["user", "admin"],
        default:"user",
    },
    address:{
        street:{
            type:String,
            required:true,
        },
        city:{
            type:String,
            required:true,
        },
        state:{
            type:String,
            required:true,
        },
        country:{
            type:String,
            required:true,
        },
        region:{
            type:String,
            required:true,
        },
        zip:{
            type:String,
            required:true,
        },
        addressLine1:{
            type:String,
            required:true,
        },
        addressLine2:{
            type:String,
            required:true,
        },

    
    },
    phone:{
        type:String,
        required:true,
        match: /^\d{10}$/,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
    },
})


userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next();
    }
    try {
        const salt=await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);
        next();
    } catch (error) {
        return next(error);
    }
});


userSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.generateToken=function(){
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}

const User=mongoose.model("User",userSchema);
export default User;
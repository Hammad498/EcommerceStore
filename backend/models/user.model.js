import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  companyName: String,
  addressLine1: String,
  addressLine2: String,
  city: {
    type: String,
    
    default: 'Other',
  },
  state: {
    type: String,
   
    default: 'Other',
  },
  postalCode: String,
  country: {
    type: String,
    
    default: 'Other',
  },
  email: {
    type: String,
    match: /.+\@.+\..+/,
  },
  phone: {
    type: String,
    
  },
}, { _id: false,timestamps: true });




const userSchema=new mongoose.Schema({

    images: {
    type: String,
    default: "", 
  },
  displayName: {
    type: String,
  },
    name:{
        type:String,
        required:true,
        min: 3,
    },
    username: {
    type: String,
    unique: true,
    sparse: true,
  },
  fullName:{
        type:String,
  },
    email:{
        type:String,
        required:true,
        unique:true,
        match: /.+\@.+\..+/,
        min: 5,
    },
    secondaryEmail: {
    type: String,
    match: /.+\@.+\..+/,
  },
    password:{
        type:String,
        required:true,
        min: 6,
    },
    phone: {
    type: String,
    
  },
  country: {
    type: String,
    
    default: 'Other',
  },
  state: {
    type: String,
    
    default: 'Other',
  },
  zip: String,
    role:{
        type:String,
        enum:["user", "admin"],
        default:"user",
    },
    
    
    isVerified:{
        type:Boolean,
        default:false,
    },

    shippingAddress:addressSchema,
    billingAddress:addressSchema,


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

userSchema.methods.generateToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};


const User=mongoose.model("User",userSchema);
export default User;
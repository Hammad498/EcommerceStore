import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const generateToken=(req,res)=>{
    const token=jwt.sign(
        { id: this._id },process.env.JWT_SECRET, 
        { expiresIn: '30d' });


    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 
    });
    res.status(200).json({
        success: true,
        token,
        message: 'Token generated successfully'
    });
}
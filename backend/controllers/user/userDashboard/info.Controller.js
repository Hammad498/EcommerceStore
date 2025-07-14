import User from "../../../models/user.model.js";

export const updateUserAccount = async (req, res) => {
  try {
    const {
      displayName,
      username,
      fullName,
      email,
      secondaryEmail,
      phone,
      country,
      state,
      zip,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const uploadedImage = req.uploadedImages?.[0];

    const updateFields = {
      displayName,
      username,
      fullName,
      email,
      secondaryEmail,
      phone,
      country,
      state,
      zip,
    };

    
    if (uploadedImage?.url) {
      updateFields.images = uploadedImage.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    );

    return res.status(200).json({
      message: "User account updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user account:", error);
    return res.status(500).json({
      message: "Failed to update user account",
      success: false,
      error: error.message,
    });
  }
};

////////////////////////////////////////////


export const updateShippingAddress=async(req,res)=>{
    try {
        const {
            firstName,
            lastName,
            companyName,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            email,
            phone
        }=req.body;

        const user=await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false,
            });
        }
        const updateFields = {
            shippingAddress: {
                firstName,
                lastName,
                companyName,
                addressLine1,
                addressLine2,
                city,
                state,
                postalCode,
                country,
                email,
                phone
            }
        };
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true }
        );
        return res.status(200).json({
            message: " address updated successfully",
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating  address:", error);
        return res.status(500).json({
            message: "Failed to update  address",
            success: false,
            error: error.message,
        });
    }
}


///////////////////////////////////////////////////////

export const updateBillingAddress=async(req,res)=>{
    try {
        const {
            firstName,
            lastName,
            companyName,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            email,
            phone
        }=req.body;

        const user=await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false,
            });
        }
        const updateFields = {
            billingAddress: {
                firstName,
                lastName,
                companyName,
                addressLine1,
                addressLine2,
                city,
                state,
                postalCode,
                country,
                email,
                phone
            }
        };
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true }
        );
        return res.status(200).json({
            message: " address updated successfully",
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating  address:", error);
        return res.status(500).json({
            message: "Failed to update  address",
            success: false,
            error: error.message,
        });
    }
}
///////////////////////////////////////////////////////


export const getUserAllInfo=async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select('+password +shippingAddress +billingAddress ');
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "User information retrieved successfully",
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error retrieving user information:", error);
        return res.status(500).json({
            message: "Failed to retrieve user information",
            success: false,
            error: error.message,
        });
    }
}

/////////////////////////////////////////


export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
        success: false,
      });
    }

    // Ensure new and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
        success: false,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Validate current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
        success: false,
      });
    }

    // Prevent reusing the same password
    const isSameAsOld = await user.matchPassword(newPassword);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password must be different from the current password",
        success: false,
      });
    }

    // Optional: Enforce stronger password policy (basic example)
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
        success: false,
      });
    }

    // Save new password (will be hashed in pre-save hook)
    user.password = newPassword;
await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      message: "Failed to update password",
      success: false,
      error: error.message,
    });
  }
};

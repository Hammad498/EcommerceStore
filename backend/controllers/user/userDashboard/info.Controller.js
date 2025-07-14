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

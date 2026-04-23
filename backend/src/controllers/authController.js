const User = require("../models/User");
const { sendEmail } = require("../utils/sendEmail");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated",
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Requirement: email cannot be changed after registration.
    if (
      req.body.email !== undefined &&
      req.body.email !== null &&
      req.body.email !== "" &&
      req.body.email !== currentUser.email
    ) {
      return res.status(400).json({
        success: false,
        error: "Email cannot be changed after registration",
      });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      preferences: req.body.preferences,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update details error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: "Password is incorrect",
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Send reset password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select(
      "+passwordResetOtp +passwordResetOtpExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found with this email",
      });
    }

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    user.passwordResetOtp = otp;
    user.passwordResetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Eat Express Password Reset OTP",
      text: `Your OTP to reset password is ${otp}. It is valid for 10 minutes.`,
      html: `<p>Your OTP to reset password is <strong>${otp}</strong>.</p><p>This OTP is valid for 10 minutes.</p>`,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +passwordResetOtp +passwordResetOtpExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found with this email",
      });
    }

    if (!user.passwordResetOtp || !user.passwordResetOtpExpire) {
      return res.status(400).json({
        success: false,
        error: "Please request a new OTP",
      });
    }

    if (user.passwordResetOtpExpire.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new OTP",
      });
    }

    if (user.passwordResetOtp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    user.password = newPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
};

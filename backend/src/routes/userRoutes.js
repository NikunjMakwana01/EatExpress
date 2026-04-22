const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, email, phone, address, preferences } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (preferences) user.preferences = preferences;

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;

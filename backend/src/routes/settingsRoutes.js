const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const Settings = require("../models/Settings");

const router = express.Router();

// @route   GET /api/settings
// @access  Public
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @route   PUT /api/settings
// @access  Private/Admin
router.put(
  "/",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const updates = req.body || {};

      const existing = await Settings.getSingleton();
      Object.assign(existing, updates);
      await existing.save();

      res.json({
        success: true,
        data: existing,
      });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to save settings",
      });
    }
  }
);

module.exports = router;


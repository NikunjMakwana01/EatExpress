const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get("/", getCategories);

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get("/:id", getCategory);

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
router.post(
  "/",
  [
    protect,
    authorize("admin"),
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Description cannot be more than 200 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    await createCategory(req, res);
  }
);

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put(
  "/:id",
  [
    protect,
    authorize("admin"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Description cannot be more than 200 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    await updateCategory(req, res);
  }
);

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;

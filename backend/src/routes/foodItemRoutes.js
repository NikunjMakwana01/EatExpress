const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const FoodItem = require("../models/FoodItem");
const Category = require("../models/Category");
const upload = require("../middleware/upload");

const router = express.Router();

// @desc    Get all food items with filtering
// @route   GET /api/food-items
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      isVegetarian,
      isVegan,
      isSpicy,
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (isVegetarian === "true") filter.isVegetarian = true;
    if (isVegan === "true") filter.isVegan = true;
    if (isSpicy === "true") filter.isSpicy = true;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const foodItems = await FoodItem.find(filter)
      .populate("category", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FoodItem.countDocuments(filter);

    res.json({
      success: true,
      count: foodItems.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: foodItems,
    });
  } catch (error) {
    console.error("Get food items error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Upload food item image
// @route   POST /api/food-items/upload
// @access  Private/Admin
router.post(
  "/upload",
  protect,
  authorize("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Please upload a file",
        });
      }

      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          path: req.file.path,
          url: `/uploads/${req.file.filename}`,
        },
      });
    } catch (error) {
      console.error("Upload image error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Get single food item
// @route   GET /api/food-items/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id).populate(
      "category",
      "name description"
    );

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        error: "Food item not found",
      });
    }

    res.json({
      success: true,
      data: foodItem,
    });
  } catch (error) {
    console.error("Get food item error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Create food item
// @route   POST /api/food-items
// @access  Private/Admin
router.post(
  "/",
  [
    protect,
    authorize("admin"),
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("description")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Description must be between 10 and 500 characters"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("category")
      .isMongoId()
      .withMessage("Please provide a valid category ID"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        name,
        description,
        price,
        category,
        image,
        isVegetarian,
        isVegan,
        isSpicy,
        preparationTime,
        calories,
        allergens,
        ingredients,
        nutritionalInfo,
      } = req.body;

      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: "Category not found",
        });
      }

      const foodItem = await FoodItem.create({
        name,
        description,
        price,
        category,
        image,
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        isSpicy: isSpicy || false,
        preparationTime: preparationTime || 15,
        calories,
        allergens,
        ingredients,
        nutritionalInfo,
      });

      const populatedFoodItem = await FoodItem.findById(foodItem._id).populate(
        "category",
        "name"
      );

      res.status(201).json({
        success: true,
        data: populatedFoodItem,
      });
    } catch (error) {
      console.error("Create food item error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Update food item
// @route   PUT /api/food-items/:id
// @access  Private/Admin
router.put(
  "/:id",
  [
    protect,
    authorize("admin"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Description must be between 10 and 500 characters"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const foodItem = await FoodItem.findById(req.params.id);

      if (!foodItem) {
        return res.status(404).json({
          success: false,
          error: "Food item not found",
        });
      }

      // Update fields
      const updateFields = [
        "name",
        "description",
        "category",
        "price",
        "image",
        "isVegetarian",
        "isVegan",
        "isSpicy",
        "preparationTime",
        "calories",
        "allergens",
        "ingredients",
        "nutritionalInfo",
        "isAvailable",
      ];

      updateFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          foodItem[field] = req.body[field];
        }
      });

      const updatedFoodItem = await foodItem.save();
      const populatedFoodItem = await FoodItem.findById(
        updatedFoodItem._id
      ).populate("category", "name");

      res.json({
        success: true,
        data: populatedFoodItem,
      });
    } catch (error) {
      console.error("Update food item error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Delete food item
// @route   DELETE /api/food-items/:id
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        error: "Food item not found",
      });
    }

    await foodItem.deleteOne();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete food item error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;

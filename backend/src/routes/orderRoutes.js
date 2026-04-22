const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const Order = require("../models/Order");
const FoodItem = require("../models/FoodItem");

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post(
  "/",
  [
    protect,
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    body("items.*.foodItem").isMongoId().withMessage("Invalid food item ID"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("deliveryAddress.street")
      .notEmpty()
      .withMessage("Street address is required"),
    body("deliveryAddress.city").notEmpty().withMessage("City is required"),
    body("deliveryAddress.state").notEmpty().withMessage("State is required"),
    body("deliveryAddress.zipCode")
      .notEmpty()
      .withMessage("ZIP code is required"),
    body("contactInfo.phone")
      .notEmpty()
      .withMessage("Phone number is required"),
    body("contactInfo.email").isEmail().withMessage("Valid email is required"),
    body("paymentMethod")
      .isIn(["razorpay", "cod"])
      .withMessage("Invalid payment method"),
    body("totalAmount")
      .isFloat({ min: 0 })
      .withMessage("Total amount must be positive"),
    body("finalAmount")
      .isFloat({ min: 0 })
      .withMessage("Final amount must be positive"),
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
        items,
        deliveryAddress,
        contactInfo,
        specialInstructions,
        totalAmount,
        deliveryFee,
        tax,
        finalAmount,
        paymentMethod,
      } = req.body;

      // Validate food items exist and are available
      for (let item of items) {
        const foodItem = await FoodItem.findById(item.foodItem);
        if (!foodItem) {
          return res.status(400).json({
            success: false,
            error: `Food item with ID ${item.foodItem} not found`,
          });
        }
        if (!foodItem.isAvailable) {
          return res.status(400).json({
            success: false,
            error: `Food item ${foodItem.name} is not available`,
          });
        }
      }

      // Create order
      const order = await Order.create({
        user: req.user.id,
        items,
        deliveryAddress,
        contactInfo,
        specialInstructions,
        totalAmount,
        deliveryFee: deliveryFee || 0,
        tax: tax || 0,
        finalAmount,
        paymentMethod,
        // Payment status depends on payment method:
        // - Razorpay payments are confirmed by the frontend modal before redirecting here.
        // - COD is not paid yet, so we keep it as pending.
        paymentStatus:
          paymentMethod === "razorpay" || paymentMethod === "card"
            ? "completed"
            : "pending",
      });

      // Populate food item details
      const populatedOrder = await Order.findById(order._id).populate(
        "items.foodItem",
        "name description price image"
      );

      res.status(201).json({
        success: true,
        data: populatedOrder,
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get("/my-orders", protect, async (req, res) => {
  try {
    const { status, dateRange, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { user: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate };
      }
    }

    if (search) {
      filter.$or = [
        { "items.name": { $regex: search, $options: "i" } },
        { "contactInfo.phone": { $regex: search, $options: "i" } },
        { "contactInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate("items.foodItem", "name description price image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.foodItem", "name description price image")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if user owns this order or is admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this order",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put(
  "/:id/status",
  [
    protect,
    authorize("admin"),
    body("status")
      .isIn([
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ])
      .withMessage("Invalid status"),
    body("cancellationReason")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Cancellation reason cannot exceed 200 characters"),
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

      const { status, cancellationReason } = req.body;

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      // Update order status
      order.status = status;

      if (status === "cancelled" && cancellationReason) {
        order.cancellationReason = cancellationReason;
      }

      await order.save();

      const updatedOrder = await Order.findById(order._id)
        .populate("items.foodItem", "name description price image")
        .populate("user", "name email");

      res.json({
        success: true,
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Cancel order (User only)
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put(
  "/:id/cancel",
  [
    protect,
    body("reason")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Cancellation reason cannot exceed 200 characters"),
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

      const { reason } = req.body;

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      // Check if user owns this order
      if (order.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to cancel this order",
        });
      }

      // Check if order can be cancelled (within 5 minutes of creation)
      // User rule: can cancel only before "out_for_delivery".
      // Once out_of_delivery started, cancellation is not allowed.
      const forbiddenStatuses = ["out_for_delivery", "delivered", "cancelled"];
      if (forbiddenStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          error: "Order cannot be cancelled after it is out for delivery",
        });
      }

      // Cancel order
      order.status = "cancelled";

      if (reason) {
        order.cancellationReason = reason;
      }

      await order.save();

      const updatedOrder = await Order.findById(order._id)
        .populate("items.foodItem", "name description price image")
        .populate("user", "name email");

      res.json({
        success: true,
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Add review to order
// @route   POST /api/orders/:id/review
// @access  Private
router.post(
  "/:id/review",
  [
    protect,
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("review")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Review cannot exceed 500 characters"),
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

      const { rating, review } = req.body;

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      // Check if user owns this order
      if (order.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to review this order",
        });
      }

      // Check if order is delivered
      if (order.status !== "delivered") {
        return res.status(400).json({
          success: false,
          error: "Can only review delivered orders",
        });
      }

      // Check if already reviewed
      if (order.rating) {
        return res.status(400).json({
          success: false,
          error: "Order has already been reviewed",
        });
      }

      // Add review
      await order.addReview(rating, review);

      const updatedOrder = await Order.findById(order._id)
        .populate("items.foodItem", "name description price image")
        .populate("user", "name email");

      res.json({
        success: true,
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Add review error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get("/", [protect, authorize("admin")], async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const orders = await Order.find(filter)
      .populate("items.foodItem", "name description price image")
      .populate("user", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user.role === "admin" ? null : req.user.id;
    const stats = await Order.getStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;

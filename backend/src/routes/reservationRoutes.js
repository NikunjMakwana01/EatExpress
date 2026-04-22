const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const Reservation = require("../models/Reservation");

const router = express.Router();

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
router.post(
  "/",
  [
    protect,
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("phone")
      .matches(/^[0-9]{10}$/)
      .withMessage("Please provide a valid 10-digit phone number"),
    body("date").isISO8601().withMessage("Please provide a valid date"),
    body("time")
      .isIn([
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
        "21:30",
      ])
      .withMessage("Please select a valid time"),
    body("guests")
      .isInt({ min: 1, max: 20 })
      .withMessage("Guests must be between 1 and 20"),
    body("tableType")
      .isIn(["2-seater", "4-seater", "6-seater", "8-seater", "private"])
      .withMessage("Please select a valid table type"),
    body("occasion")
      .optional()
      .isIn(["birthday", "anniversary", "business", "casual", "other"])
      .withMessage("Please select a valid occasion"),
    body("specialRequests")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Special requests cannot exceed 500 characters"),
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
        email,
        phone,
        date,
        time,
        guests,
        tableType,
        occasion,
        specialRequests,
      } = req.body;

      // Check if reservation date is in the future
      const reservationDate = new Date(date);
      const now = new Date();

      // Reset time to start of day for comparison
      const reservationDateOnly = new Date(reservationDate);
      reservationDateOnly.setHours(0, 0, 0, 0);
      const nowOnly = new Date(now);
      nowOnly.setHours(0, 0, 0, 0);

      if (reservationDateOnly < nowOnly) {
        return res.status(400).json({
          success: false,
          error: "Reservation date must be in the future",
        });
      }

      // Check table availability
      const availability = await Reservation.checkAvailability(
        date,
        time,
        tableType,
        guests
      );
      if (!availability.available) {
        return res.status(400).json({
          success: false,
          error: `Sorry, no availability for ${guests} guests at ${time} on ${new Date(
            date
          ).toLocaleDateString()}. Available capacity: ${
            availability.availableCapacity
          } guests.`,
        });
      }

      // Create reservation
      const reservation = await Reservation.create({
        user: req.user.id,
        name,
        email,
        phone,
        date: reservationDate,
        time,
        numberOfPeople: guests,
        tableType,
        occasion: occasion || "casual",
        specialRequests,
      });

      const populatedReservation = await Reservation.findById(
        reservation._id
      ).populate("user", "name email");

      res.status(201).json({
        success: true,
        data: populatedReservation,
      });
    } catch (error) {
      console.error("Create reservation error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({
        success: false,
        error: "Server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Get user's reservations
// @route   GET /api/reservations/my-reservations
// @access  Private
router.get("/my-reservations", protect, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { user: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reservations = await Reservation.find(filter)
      .populate("user", "name email")
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(filter);

    res.json({
      success: true,
      count: reservations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: reservations,
    });
  } catch (error) {
    console.error("Get user reservations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: "Reservation not found",
      });
    }

    // Check if user owns this reservation or is admin
    if (
      reservation.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this reservation",
      });
    }

    res.json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error("Get reservation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Update reservation status (Admin only)
// @route   PUT /api/reservations/:id/status
// @access  Private/Admin
router.put(
  "/:id/status",
  [
    protect,
    authorize("admin"),
    body("status")
      .isIn(["pending", "confirmed", "cancelled", "completed"])
      .withMessage("Invalid status"),
    body("cancellationReason")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Cancellation reason cannot exceed 200 characters"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
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

      const { status, cancellationReason, notes } = req.body;

      const reservation = await Reservation.findById(req.params.id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reservation not found",
        });
      }

      // Update reservation status
      if (status === "confirmed") {
        await reservation.confirm();
      } else if (status === "cancelled") {
        await reservation.cancel(req.user.id, cancellationReason);
      } else if (status === "completed") {
        await reservation.complete();
      } else {
        reservation.status = status;
        await reservation.save();
      }

      // Update notes if provided
      if (notes !== undefined) {
        reservation.notes = notes;
        await reservation.save();
      }

      const updatedReservation = await Reservation.findById(
        reservation._id
      ).populate("user", "name email");

      res.json({
        success: true,
        data: updatedReservation,
      });
    } catch (error) {
      console.error("Update reservation status error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Cancel reservation (User only)
// @route   PUT /api/reservations/:id/cancel
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

      const reservation = await Reservation.findById(req.params.id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          error: "Reservation not found",
        });
      }

      // Check if user owns this reservation
      if (reservation.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to cancel this reservation",
        });
      }

      // Rule:
      // - If reservation is PENDING and deposit NOT paid => user can delete it.
      // - If reservation is CONFIRMED and deposit paid => user must contact owner/admin.
      // - Otherwise => user cannot delete/cancel from app.

      if (reservation.status === "cancelled" || reservation.status === "completed") {
        return res.status(400).json({
          success: false,
          error: "Reservation cannot be cancelled",
        });
      }

      // If deposit is already paid, user must contact admin/owner.
      if (reservation.depositPaid || reservation.paymentStatus === "completed") {
        return res.status(400).json({
          success: false,
          error: "Deposit already paid. Please contact the restaurant owner to cancel.",
        });
      }

      if (reservation.status !== "pending") {
        return res.status(400).json({
          success: false,
          error: "Only pending reservations can be deleted before paying the deposit.",
        });
      }

      // Delete pending + unpaid reservation
      await reservation.deleteOne();

      res.json({ success: true, data: {} });
    } catch (error) {
      console.error("Cancel reservation error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
      });
    }
  }
);

// @desc    Check table availability
// @route   GET /api/reservations/availability
// @access  Public
router.get("/availability", async (req, res) => {
  try {
    const { date, time, tableType, guests } = req.query;

    if (!date || !time || !tableType || !guests) {
      return res.status(400).json({
        success: false,
        error: "Date, time, table type, and guests are required",
      });
    }

    const availability = await Reservation.checkAvailability(
      date,
      time,
      tableType,
      parseInt(guests)
    );

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Check availability error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get available time slots for a date
// @route   GET /api/reservations/available-times
// @access  Public
router.get("/available-times", async (req, res) => {
  try {
    const { date, guests } = req.query;

    if (!date || !guests) {
      return res.status(400).json({
        success: false,
        error: "Date and guests are required",
      });
    }

    const timeSlots = [
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "18:00",
      "18:30",
      "19:00",
      "19:30",
      "20:00",
      "20:30",
      "21:00",
      "21:30",
    ];

    const availableTimes = [];

    for (const time of timeSlots) {
      const availability = await Reservation.checkAvailability(
        date,
        time,
        "4-seater",
        parseInt(guests)
      );
      if (availability.available) {
        availableTimes.push(time);
      }
    }

    res.json({
      success: true,
      data: {
        date,
        guests: parseInt(guests),
        availableTimes,
      },
    });
  } catch (error) {
    console.error("Get available times error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get all reservations (Admin only)
// @route   GET /api/reservations
// @access  Private/Admin
router.get("/", [protect, authorize("admin")], async (req, res) => {
  try {
    const {
      status,
      date,
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "asc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reservations = await Reservation.find(filter)
      .populate("user", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(filter);

    res.json({
      success: true,
      count: reservations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: reservations,
    });
  } catch (error) {
    console.error("Get all reservations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// @desc    Get reservation statistics
// @route   GET /api/reservations/stats
// @access  Private
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user.role === "admin" ? null : req.user.id;
    const stats = await Reservation.getStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get reservation stats error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;

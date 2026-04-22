const Reservation = require("../models/Reservation");
const User = require("../models/User");

// @desc    Get user reservations
// @route   GET /api/reservations
// @access  Private
const getReservations = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .sort("-date")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reservation.countDocuments(query);

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
    console.error("Get reservations error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate(
      "user",
      "name email phone"
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
};

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  try {
    const { name, email, phone, date, time, numberOfPeople, specialRequests } =
      req.body;

    // Check if date is in the past
    const reservationDate = new Date(date);
    const now = new Date();
    if (reservationDate < now) {
      return res.status(400).json({
        success: false,
        error: "Reservation date cannot be in the past",
      });
    }

    // Check if reservation is within 30 days
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    if (reservationDate > thirtyDaysFromNow) {
      return res.status(400).json({
        success: false,
        error: "Reservations can only be made up to 30 days in advance",
      });
    }

    // Check availability
    const availability = await checkAvailability(date, time, numberOfPeople);
    if (!availability.available) {
      return res.status(400).json({
        success: false,
        error: "No availability for the selected date and time",
      });
    }

    const reservation = await Reservation.create({
      user: req.user.id,
      name,
      email,
      phone,
      date: reservationDate,
      time,
      numberOfPeople,
      specialRequests,
    });

    const populatedReservation = await Reservation.findById(
      reservation._id
    ).populate("user", "name email phone");

    res.status(201).json({
      success: true,
      data: populatedReservation,
    });
  } catch (error) {
    console.error("Create reservation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private
const updateReservation = async (req, res) => {
  try {
    const { name, email, phone, date, time, numberOfPeople, specialRequests } =
      req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: "Reservation not found",
      });
    }

    // Check if user owns this reservation or is admin
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this reservation",
      });
    }

    // Check if reservation can be updated (not completed or cancelled)
    if (["completed", "cancelled"].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        error: "Cannot update completed or cancelled reservation",
      });
    }

    // Update fields
    if (name !== undefined) reservation.name = name;
    if (email !== undefined) reservation.email = email;
    if (phone !== undefined) reservation.phone = phone;
    if (date !== undefined) reservation.date = new Date(date);
    if (time !== undefined) reservation.time = time;
    if (numberOfPeople !== undefined)
      reservation.numberOfPeople = numberOfPeople;
    if (specialRequests !== undefined)
      reservation.specialRequests = specialRequests;

    const updatedReservation = await reservation.save();
    const populatedReservation = await Reservation.findById(
      updatedReservation._id
    ).populate("user", "name email phone");

    res.json({
      success: true,
      data: populatedReservation,
    });
  } catch (error) {
    console.error("Update reservation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: "Reservation not found",
      });
    }

    // Check if user owns this reservation or is admin
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to cancel this reservation",
      });
    }

    // Check if reservation can be cancelled
    if (["completed", "cancelled"].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        error: "Reservation cannot be cancelled",
      });
    }

    reservation.status = "cancelled";
    reservation.cancelledAt = new Date();
    reservation.cancelledBy = req.user.id;
    if (cancellationReason) {
      reservation.cancellationReason = cancellationReason;
    }

    const updatedReservation = await reservation.save();
    const populatedReservation = await Reservation.findById(
      updatedReservation._id
    ).populate("user", "name email phone");

    res.json({
      success: true,
      data: populatedReservation,
    });
  } catch (error) {
    console.error("Cancel reservation error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Check availability
// @route   GET /api/reservations/availability
// @access  Public
const checkAvailability = async (date, time, numberOfPeople) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get existing reservations for the date and time
  const existingReservations = await Reservation.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    time: time,
    // Only confirmed reservations block table capacity.
    status: { $in: ["confirmed"] },
  });

  // Count total people for this time slot
  const totalPeople = existingReservations.reduce((sum, reservation) => {
    return sum + reservation.numberOfPeople;
  }, 0);

  // Assuming restaurant has a total capacity of 50 people
  const totalCapacity = 50;
  const availableCapacity = totalCapacity - totalPeople;

  return {
    available: availableCapacity >= numberOfPeople,
    totalPeople,
    availableCapacity,
    requestedPeople: numberOfPeople,
  };
};

// @desc    Get availability
// @route   GET /api/reservations/availability
// @access  Public
const getAvailability = async (req, res) => {
  try {
    const { date, time, numberOfPeople } = req.query;

    if (!date || !time || !numberOfPeople) {
      return res.status(400).json({
        success: false,
        error: "Please provide date, time, and number of people",
      });
    }

    const availability = await checkAvailability(
      date,
      time,
      parseInt(numberOfPeople)
    );

    res.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Get all reservations (Admin only)
// @route   GET /api/reservations/admin/all
// @access  Private/Admin
const getAllReservations = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const reservations = await Reservation.find(query)
      .populate("user", "name email phone")
      .sort("-date")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reservation.countDocuments(query);

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
};

module.exports = {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  getAvailability,
  getAllReservations,
};

const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create payment order for food order
// @route   POST /api/payments/create-order
// @access  Private
const createOrderPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Order ID and amount are required",
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to pay for this order",
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `order_${orderId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        orderId: orderId,
        type: "food_order",
      },
    });

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create order payment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment order",
    });
  }
};

// @desc    Create payment order for reservation
// @route   POST /api/payments/create-reservation-payment
// @access  Private
const createReservationPayment = async (req, res) => {
  try {
    const { reservationId, amount } = req.body;

    if (!reservationId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Reservation ID and amount are required",
      });
    }

    // Verify reservation exists and belongs to user
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: "Reservation not found",
      });
    }

    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to pay for this reservation",
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `reservation_${reservationId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        reservationId: reservationId,
        type: "reservation_deposit",
      },
    });

    // Update reservation with Razorpay order ID
    reservation.razorpayOrderId = razorpayOrder.id;
    await reservation.save();

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create reservation payment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment order",
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Payment verification parameters are required",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }

    // Find order or reservation by Razorpay order ID
    let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    let reservation = null;

    if (!order) {
      reservation = await Reservation.findOne({
        razorpayOrderId: razorpay_order_id,
      });
    }

    if (!order && !reservation) {
      return res.status(404).json({
        success: false,
        error: "Order or reservation not found",
      });
    }

    // Update payment status
    if (order) {
      order.paymentStatus = "completed";
      order.razorpayPaymentId = razorpay_payment_id;
      order.status = "confirmed";
      await order.save();

      res.json({
        success: true,
        data: {
          type: "order",
          orderId: order._id,
          paymentStatus: "completed",
        },
      });
    } else if (reservation) {
      reservation.paymentStatus = "completed";
      reservation.razorpayPaymentId = razorpay_payment_id;
      reservation.depositPaid = true;
      reservation.status = "confirmed";
      await reservation.save();

      res.json({
        success: true,
        data: {
          type: "reservation",
          reservationId: reservation._id,
          paymentStatus: "completed",
        },
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Get user's orders with payments
    const orders = await Order.find({
      user: req.user.id,
      paymentStatus: { $in: ["completed", "failed"] },
    })
      .select(
        "totalAmount paymentStatus paymentMethod createdAt razorpayOrderId"
      )
      .sort("-createdAt")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get user's reservations with payments
    const reservations = await Reservation.find({
      user: req.user.id,
      paymentStatus: { $in: ["completed", "failed"] },
    })
      .select("depositAmount paymentStatus createdAt razorpayOrderId")
      .sort("-createdAt")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Combine and sort by date
    const payments = [...orders, ...reservations].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const total =
      (await Order.countDocuments({
        user: req.user.id,
        paymentStatus: { $in: ["completed", "failed"] },
      })) +
      (await Reservation.countDocuments({
        user: req.user.id,
        paymentStatus: { $in: ["completed", "failed"] },
      }));

    res.json({
      success: true,
      count: payments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: payments,
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/refund
// @access  Private/Admin
const refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Payment ID is required",
      });
    }

    // Create refund
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Convert to paise
      speed: "normal",
      notes: {
        reason: reason || "Customer request",
      },
    });

    res.json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error("Refund payment error:", error);
    res.status(500).json({
      success: false,
      error: "Refund failed",
    });
  }
};

module.exports = {
  createOrderPayment,
  createReservationPayment,
  verifyPayment,
  getPaymentHistory,
  refundPayment,
};

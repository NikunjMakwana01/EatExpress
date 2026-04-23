const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Settings = require("../models/Settings");
const { sendEmail } = require("../utils/sendEmail");

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create payment order for food order
// @route   POST /api/payments/create-order
// @access  Private
router.post(
  "/create-order",
  [
    protect,
    body("amount").isFloat({ min: 1 }).withMessage("Amount must be at least 1"),
    body("currency")
      .optional()
      .isIn(["INR", "USD"])
      .withMessage("Currency must be INR or USD"),
    body("orderId").optional().isMongoId().withMessage("Invalid order ID"),
    body("receipt")
      .optional()
      .isString()
      .withMessage("Receipt must be a string"),
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

      const { amount, currency = "INR", orderId, receipt } = req.body;

      // Create Razorpay order
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          orderId: orderId,
          userId: req.user.id,
          type: "food_order",
        },
      };

      const razorpayOrder = await razorpay.orders.create(options);

      res.json({
        success: true,
        data: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          key_id: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (error) {
      console.error("Create payment order error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create payment order",
      });
    }
  },
);

// @desc    Create payment order for reservation deposit
// @route   POST /api/payments/create-reservation-payment
// @access  Private
router.post(
  "/create-reservation-payment",
  [
    protect,
    body("amount")
      .isFloat({ min: 100 })
      .withMessage("Deposit amount must be at least 100"),
    body("reservationId").isMongoId().withMessage("Invalid reservation ID"),
    body("currency")
      .optional()
      .isIn(["INR", "USD"])
      .withMessage("Currency must be INR or USD"),
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

      const { amount, reservationId, currency = "INR" } = req.body;

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
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: currency,
        // Razorpay `receipt` has a max length of 40 chars.
        // Keep it compact: res_<last6ofid>_<6digits_timestamp>.
        receipt: `res_${reservationId.slice(-6)}_${String(Date.now()).slice(-6)}`,
        notes: {
          reservationId: reservationId,
          userId: req.user.id,
          type: "reservation_deposit",
        },
      };

      const razorpayOrder = await razorpay.orders.create(options);

      reservation.razorpayOrderId = razorpayOrder.id;
      await reservation.save();

      res.json({
        success: true,
        data: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          key_id: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (error) {
      console.error("Create reservation payment error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create payment order",
      });
    }
  },
);

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
router.post(
  "/verify",
  [
    protect,
    body("razorpay_order_id")
      .notEmpty()
      .withMessage("Razorpay order ID is required"),
    body("razorpay_payment_id")
      .notEmpty()
      .withMessage("Razorpay payment ID is required"),
    body("razorpay_signature")
      .notEmpty()
      .withMessage("Razorpay signature is required"),
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

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return res.status(400).json({
          success: false,
          error: "Payment verification failed",
        });
      }

      // Get payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      // Reservation deposit payment
      const reservation = await Reservation.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (reservation) {
        // Ensure reservation belongs to this user
        if (
          reservation.user.toString() !== req.user.id &&
          req.user.role !== "admin"
        ) {
          return res.status(403).json({
            success: false,
            error: "Not authorized to verify this reservation payment",
          });
        }

        reservation.paymentStatus = "completed";
        reservation.depositPaid = true;
        reservation.razorpayPaymentId = razorpay_payment_id;
        reservation.status = "confirmed";
        reservation.confirmedAt = new Date();
        await reservation.save();

        const settings = await Settings.getSingleton();
        const restaurantName = settings.restaurantName || "Eat Express";

        let emailSent = false;
        try {
          const subject = `${restaurantName} - Reservation Deposit Receipt`;
          const html = `<div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
  <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.1);">

    <div style="background:linear-gradient(135deg,#f97316,#dc2626); padding:20px; text-align:center; color:white;">
      <h1 style="margin:0;">${restaurantName}</h1>
      <p style="margin:5px 0 0;">Reservation Receipt</p>
    </div>

    <!-- Body -->
    <div style="padding:25px; color:#333;">
      <h2>Hi ${reservation.name},</h2>
      <p>Your reservation deposit has been received successfully.</p>

      <div style="margin-top:20px; padding:15px; border-radius:10px; background:#fff7ed; border:1px solid #fdba74;">
        <h3 style="color:#ea580c;">Reservation Details</h3>
        <p><strong>ID:</strong> ${reservation._id}</p>
        <p><strong>Date:</strong> ${new Date(reservation.date).toDateString()}</p>
        <p><strong>Time:</strong> ${reservation.time}</p>
        <p><strong>Guests:</strong> ${reservation.numberOfPeople}</p>
        <p><strong>Table:</strong> ${reservation.tableType}</p>
      </div>

      <div style="margin-top:20px; padding:15px; border-radius:10px; background:#f0fdf4; border:1px solid #86efac;">
        <h3 style="color:#16a34a;">Payment Details</h3>
        <p><strong>Amount:</strong> ₹${reservation.depositAmount}</p>
        <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
      </div>

      <p style="margin-top:20px;">
        Thank you for booking with <strong>${restaurantName}</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#111827; color:#9ca3af; text-align:center; padding:15px;">
      <p style="margin:0;">© ${new Date().getFullYear()} ${restaurantName}</p>
    </div>

  </div>
</div>
`;

          await sendEmail({
            to: reservation.email,
            subject,
            text: `Hi ${reservation.name} , your reservation is confirmed.`,
            html,
          });
          emailSent = true;
        } catch (emailError) {
          // Payment is still successful even if the email sending fails.
          console.error("Receipt email send failed:", emailError);
        }

        return res.json({
          success: true,
          data: {
            type: "reservation",
            reservationId: reservation._id,
            paymentStatus: "completed",
            emailSent,
            payment: {
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              method: payment.method,
            },
          },
        });
      }

      // Food order payment (optional; not used by current frontend reservation flow)
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (order) {
        if (
          order.user.toString() !== req.user.id &&
          req.user.role !== "admin"
        ) {
          return res.status(403).json({
            success: false,
            error: "Not authorized to verify this order payment",
          });
        }

        order.paymentStatus = "completed";
        order.razorpayPaymentId = razorpay_payment_id;
        if (order.status === "pending") {
          order.status = "confirmed";
        }
        await order.save();

        return res.json({
          success: true,
          data: {
            type: "order",
            orderId: order._id,
            paymentStatus: "completed",
            emailSent: false,
            payment: {
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              method: payment.method,
            },
          },
        });
      }

      return res.status(404).json({
        success: false,
        error: "Order or reservation not found",
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        error: "Payment verification failed",
      });
    }
  },
);

// @desc    Mark reservation deposit payment as failed (Razorpay payment.failed)
// @route   POST /api/payments/reservation-deposit-failed
// @access  Private
router.post(
  "/reservation-deposit-failed",
  [
    protect,
    body("reservationId").isMongoId().withMessage("Invalid reservation ID"),
    body("reason").optional().isString().isLength({ max: 200 }),
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

      const { reservationId, reason } = req.body;

      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        return res
          .status(404)
          .json({ success: false, error: "Reservation not found" });
      }

      if (
        reservation.user.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to mark this reservation payment",
        });
      }

      // If deposit was already paid, don't override it.
      if (
        reservation.depositPaid ||
        reservation.paymentStatus === "completed"
      ) {
        return res.status(400).json({
          success: false,
          error: "Deposit already paid for this reservation",
        });
      }

      reservation.paymentStatus = "failed";
      reservation.depositPaid = false;
      if (
        reservation.status !== "confirmed" &&
        reservation.status !== "cancelled"
      ) {
        reservation.status = "pending";
      }
      if (reason) {
        reservation.cancellationReason = reason;
      }

      await reservation.save();

      res.json({
        success: true,
        data: {
          reservationId: reservation._id,
          paymentStatus: reservation.paymentStatus,
        },
      });
    } catch (error) {
      console.error("Reservation deposit failed error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to mark reservation payment as failed",
      });
    }
  },
);

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private
router.get("/:paymentId", protect, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        email: payment.email,
        contact: payment.contact,
        timestamp: payment.created_at,
        captured: payment.captured,
        refundStatus: payment.refund_status,
      },
    });
  } catch (error) {
    console.error("Get payment details error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get payment details",
    });
  }
});

// @desc    Refund payment
// @route   POST /api/payments/:paymentId/refund
// @access  Private/Admin
router.post(
  "/:paymentId/refund",
  [
    protect,
    body("amount")
      .optional()
      .isFloat({ min: 1 })
      .withMessage("Refund amount must be positive"),
    body("reason").optional().isString().withMessage("Reason must be a string"),
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

      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      // Check if user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Only admins can process refunds",
        });
      }

      // Create refund options
      const refundOptions = {};
      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Convert to paise
      }
      if (reason) {
        refundOptions.reason = reason;
      }

      const refund = await razorpay.payments.refund(paymentId, refundOptions);

      res.json({
        success: true,
        data: {
          refundId: refund.id,
          paymentId: refund.payment_id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
          reason: refund.reason,
          timestamp: refund.created_at,
        },
      });
    } catch (error) {
      console.error("Refund payment error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process refund",
      });
    }
  },
);

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
router.get("/stats", protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only admins can view payment statistics",
      });
    }

    // Get payments from Razorpay (this is a simplified version)
    // In a real application, you'd want to store payment data in your database
    const payments = await razorpay.payments.all({
      count: 100, // Get last 100 payments
    });

    // Calculate statistics
    const totalPayments = payments.items.length;
    const totalAmount = payments.items.reduce((sum, payment) => {
      return sum + payment.amount / 100; // Convert from paise to rupees
    }, 0);
    const successfulPayments = payments.items.filter(
      (payment) => payment.status === "captured",
    ).length;
    const failedPayments = payments.items.filter(
      (payment) => payment.status === "failed",
    ).length;

    res.json({
      success: true,
      data: {
        totalPayments,
        totalAmount,
        successfulPayments,
        failedPayments,
        successRate:
          totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get payment statistics",
    });
  }
});

// @desc    Webhook for payment events
// @route   POST /api/payments/webhook
// @access  Public
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-razorpay-signature"];
      const body = req.body;

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          error: "Invalid webhook signature",
        });
      }

      const event = JSON.parse(body);

      // Handle different payment events
      switch (event.event) {
        case "payment.captured":
          // Payment was successful
          console.log("Payment captured:", event.payload.payment.entity);
          // Update order/reservation status in your database
          break;

        case "payment.failed":
          // Payment failed
          console.log("Payment failed:", event.payload.payment.entity);
          // Update order/reservation status in your database
          break;

        case "refund.processed":
          // Refund was processed
          console.log("Refund processed:", event.payload.refund.entity);
          // Update refund status in your database
          break;

        default:
          console.log("Unhandled event:", event.event);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({
        success: false,
        error: "Webhook processing failed",
      });
    }
  },
);

module.exports = router;

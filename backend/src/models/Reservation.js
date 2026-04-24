const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
      match: [/^[0-9]{10}$/, "Please add a valid 10-digit phone number"],
    },
    date: {
      type: Date,
      required: [true, "Please select a date"],
    },
    time: {
      type: String,
      required: [true, "Please select a time"],
    },
    numberOfPeople: {
      type: Number,
      required: [true, "Please specify number of people"],
      min: [1, "At least 1 person required"],
      max: [20, "Maximum 20 people per reservation"],
    },
    tableType: {
      type: String,
      required: [true, "Please select a table type"],
      enum: ["2-seater", "4-seater", "6-seater", "8-seater", "private"],
    },
    occasion: {
      type: String,
      enum: ["birthday", "anniversary", "business", "casual", "other"],
      default: "casual",
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot be more than 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    tableNumber: {
      type: Number,
    },
    depositAmount: {
      type: Number,
      default: 100,
    },
    depositPaid: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    confirmedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      maxlength: [
        200,
        "Cancellation reason cannot be more than 200 characters",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
reservationSchema.index({ user: 1 });
reservationSchema.index({ date: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ date: 1, time: 1 });

// Pre-save middleware to validate date
reservationSchema.pre("save", function (next) {
  try {
    const now = new Date();
    const reservationDate = new Date(this.date);

    // Check if reservation date is in the past (compare only dates, not time)
    const reservationDateOnly = new Date(reservationDate);
    reservationDateOnly.setHours(0, 0, 0, 0);
    const nowOnly = new Date(now);
    nowOnly.setHours(0, 0, 0, 0);

    if (reservationDateOnly < nowOnly) {
      return next(new Error("Reservation date cannot be in the past"));
    }

    // Check if reservation is within 30 days
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    if (reservationDate > thirtyDaysFromNow) {
      return next(
        new Error("Reservations can only be made up to 30 days in advance")
      );
    }

    next();
  } catch (error) {
    console.error("Pre-save validation error:", error);
    next(error);
  }
});

// Static method to check table availability
reservationSchema.statics.checkAvailability = async function (
  date,
  time,
  tableType,
  guests
) {
  try {
    // Create new Date objects to avoid modifying the original date
    const reservationDate = new Date(date);
    const startOfDay = new Date(reservationDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reservationDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all reservations for the given date and time
    const existingReservations = await this.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      time: time,
      tableType: tableType,
      // Only confirmed reservations block table availability.
      // Pending reservations are kept for tracking until deposit is paid.
      status: { $in: ["confirmed"] },
    });

    // Calculate total capacity needed
    const totalCapacityNeeded =
      existingReservations.reduce((total, reservation) => {
        return total + reservation.numberOfPeople;
      }, 0) + guests;

    // Define restaurant capacity (this can be adjusted based on your restaurant size)
    const restaurantCapacity = 100; // Total restaurant capacity
    const availableCapacity = restaurantCapacity - totalCapacityNeeded;

    return {
      available: availableCapacity >= 0,
      availableCapacity: Math.max(0, availableCapacity),
      totalCapacity: restaurantCapacity,
      usedCapacity: restaurantCapacity - availableCapacity,
    };
  } catch (error) {
    console.error("Check availability error:", error);
    throw error;
  }
};

// Instance methods for reservation status management
reservationSchema.methods.confirm = async function () {
  this.status = "confirmed";
  this.confirmedAt = new Date();
  return await this.save();
};

reservationSchema.methods.cancel = async function (cancelledBy, reason) {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  return await this.save();
};

reservationSchema.methods.complete = async function () {
  this.status = "completed";
  return await this.save();
};

// Static method to get reservation statistics
reservationSchema.statics.getStats = async function (userId = null) {
  try {
    const filter = userId ? { user: userId } : {};

    const stats = await this.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await this.countDocuments(filter);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.countDocuments({
      ...filter,
      createdAt: { $gte: today },
    });

    return {
      total,
      today: todayCount,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    };
  } catch (error) {
    console.error("Get stats error:", error);
    throw error;
  }
};

module.exports = mongoose.model("Reservation", reservationSchema);

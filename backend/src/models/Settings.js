const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, default: "Eat Express" },
    restaurantEmail: { type: String, default: "info@eatexpress.com" },
    restaurantPhone: { type: String, default: "(555) 123-4567" },
    restaurantAddress: { type: String, default: "123 Food Street, City, State 12345" },
    openingHours: { type: String, default: "11:00 AM - 10:00 PM" },

    deliveryRadius: { type: Number, default: 5 },
    minimumOrder: { type: Number, default: 100 },
    taxRate: { type: Number, default: 5 },
    currency: { type: String, default: "₹" },

    notifications: {
      newOrders: { type: Boolean, default: true },
      newReservations: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
    },

    theme: {
      primaryColor: { type: String, default: "#f97316" },
      secondaryColor: { type: String, default: "#dc2626" },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);


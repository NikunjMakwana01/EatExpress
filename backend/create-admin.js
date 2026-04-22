const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import User model
const User = require("./src/models/User");

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@eatexpress.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@eatexpress.com",
      password: "admin123", // This will be hashed automatically
      phone: "1234567890",
      role: "admin",
      address: {
        street: "Admin Street",
        city: "Admin City",
        state: "Admin State",
        zipCode: "12345",
        country: "Admin Country",
      },
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@eatexpress.com");
    console.log("Password: admin123");
    console.log("Role: admin");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();

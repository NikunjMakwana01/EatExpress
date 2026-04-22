const mongoose = require("mongoose");
require("dotenv").config();

// Import FoodItem model
const FoodItem = require("./src/models/FoodItem");

const checkFoodItems = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all food items
    const foodItems = await FoodItem.find().populate("category");
    
    console.log("\n=== FOOD ITEMS IN DATABASE ===");
    console.log(`Total items: ${foodItems.length}\n`);
    
    foodItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Price: ₹${item.price}`);
      console.log(`   Category: ${item.category?.name || 'No category'}`);
      console.log(`   Image: ${item.image || 'NO IMAGE'}`);
      console.log(`   Available: ${item.isAvailable}`);
      console.log(`   Vegetarian: ${item.isVegetarian}`);
      console.log(`   Vegan: ${item.isVegan}`);
      console.log(`   Spicy: ${item.isSpicy}`);
      console.log("   ---");
    });

    // Check for items without images
    const itemsWithoutImages = foodItems.filter(item => !item.image);
    if (itemsWithoutImages.length > 0) {
      console.log("\n=== ITEMS WITHOUT IMAGES ===");
      itemsWithoutImages.forEach(item => {
        console.log(`- ${item.name} (ID: ${item._id})`);
      });
    } else {
      console.log("\n✅ All items have images!");
    }

    // Check for items with images
    const itemsWithImages = foodItems.filter(item => item.image);
    if (itemsWithImages.length > 0) {
      console.log("\n=== ITEMS WITH IMAGES ===");
      itemsWithImages.forEach(item => {
        console.log(`- ${item.name}: ${item.image}`);
      });
    }

  } catch (error) {
    console.error("Error checking food items:", error);
  } finally {
    await mongoose.disconnect();
  }
};

checkFoodItems(); 
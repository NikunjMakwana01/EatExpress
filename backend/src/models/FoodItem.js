const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a food item name'],
    trim: true,
    maxlength: [100, 'Food item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category']
  },
  image: {
    type: String
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 30,
    min: [5, 'Preparation time must be at least 5 minutes']
  },
  allergens: [{
    type: String
  }],
  ingredients: {
    type: String
  },
  nutritionalInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for better query performance
foodItemSchema.index({ category: 1 });
foodItemSchema.index({ isAvailable: 1 });
foodItemSchema.index({ isVegetarian: 1 });
foodItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);

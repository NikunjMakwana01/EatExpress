const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');

// @desc    Get all food items
// @route   GET /api/food-items
// @access  Public
const getFoodItems = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, isVegetarian, isAvailable } = req.query;
    
    // Build query object
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (isVegetarian !== undefined) {
      query.isVegetarian = isVegetarian === 'true';
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const foodItems = await FoodItem.find(query)
      .populate('category', 'name')
      .sort('name');

    res.json({
      success: true,
      count: foodItems.length,
      data: foodItems
    });
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single food item
// @route   GET /api/food-items/:id
// @access  Public
const getFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id).populate('category', 'name');

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }

    res.json({
      success: true,
      data: foodItem
    });
  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new food item
// @route   POST /api/food-items
// @access  Private/Admin
const createFoodItem = async (req, res) => {
  try {
    const { name, description, price, category, image, isVegetarian, isAvailable, preparationTime } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        error: 'Category not found'
      });
    }

    const foodItem = await FoodItem.create({
      name,
      description,
      price,
      category,
      image,
      isVegetarian: isVegetarian || false,
      isAvailable: isAvailable !== false,
      preparationTime: preparationTime || 30
    });

    const populatedFoodItem = await FoodItem.findById(foodItem._id).populate('category', 'name');

    res.status(201).json({
      success: true,
      data: populatedFoodItem
    });
  } catch (error) {
    console.error('Create food item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update food item
// @route   PUT /api/food-items/:id
// @access  Private/Admin
const updateFoodItem = async (req, res) => {
  try {
    const { name, description, price, category, image, isVegetarian, isAvailable, preparationTime } = req.body;

    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }

    // Check if category exists if being updated
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: 'Category not found'
        });
      }
    }

    // Update fields
    if (name !== undefined) foodItem.name = name;
    if (description !== undefined) foodItem.description = description;
    if (price !== undefined) foodItem.price = price;
    if (category !== undefined) foodItem.category = category;
    if (image !== undefined) foodItem.image = image;
    if (isVegetarian !== undefined) foodItem.isVegetarian = isVegetarian;
    if (isAvailable !== undefined) foodItem.isAvailable = isAvailable;
    if (preparationTime !== undefined) foodItem.preparationTime = preparationTime;

    const updatedFoodItem = await foodItem.save();
    const populatedFoodItem = await FoodItem.findById(updatedFoodItem._id).populate('category', 'name');

    res.json({
      success: true,
      data: populatedFoodItem
    });
  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete food item
// @route   DELETE /api/food-items/:id
// @access  Private/Admin
const deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }

    await foodItem.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Upload food item image
// @route   POST /api/food-items/upload
// @access  Private/Admin
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getFoodItems,
  getFoodItem,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  uploadImage
}; 
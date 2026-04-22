const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');
const User = require('../models/User');

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.foodItem', 'name price image')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.foodItem', 'name price image description')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, specialInstructions } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please add items to your order'
      });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      
      if (!foodItem) {
        return res.status(400).json({
          success: false,
          error: `Food item ${item.foodItem} not found`
        });
      }

      if (!foodItem.isAvailable) {
        return res.status(400).json({
          success: false,
          error: `${foodItem.name} is currently unavailable`
        });
      }

      const itemTotal = foodItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        foodItem: foodItem._id,
        quantity: item.quantity,
        price: foodItem.price
      });
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      specialInstructions,
      status: 'pending',
      paymentStatus: 'completed' // Set payment status to completed for all orders
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('items.foodItem', 'name price image')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, estimatedDeliveryTime } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update fields
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (estimatedDeliveryTime) order.estimatedDeliveryTime = estimatedDeliveryTime;

    const updatedOrder = await order.save();
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('items.foodItem', 'name price image')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled'
      });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('items.foodItem', 'name price image')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get order status
// @route   GET /api/orders/:id/status
// @access  Private
const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('status paymentStatus estimatedDeliveryTime');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      }
    });
  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.foodItem', 'name price')
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  cancelOrder,
  getOrderStatus,
  getAllOrders
}; 
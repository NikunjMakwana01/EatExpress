const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Contact = require('../models/Contact');

const router = express.Router();

// @desc    Submit a contact message
// @route   POST /api/contacts
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private/Admin
router.get('/', [protect, authorize('admin')], async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update message status
// @route   PATCH /api/contacts/:id
// @access  Private/Admin
router.patch('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    let message = await Contact.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    message = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Delete a message
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
    try {
      const message = await Contact.findById(req.params.id);
  
      if (!message) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }
  
      await message.deleteOne();
  
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  });

module.exports = router;

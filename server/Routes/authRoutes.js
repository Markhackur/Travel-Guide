const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Guide = require('../models/Guide');

const router = express.Router();

/* =====================
   REGISTER
===================== */
router.post('/register', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB is not connected. Connection state:', mongoose.connection.readyState);
      return res.status(500).json({ 
        success: false,
        message: 'Database connection error. Please try again later.' 
      });
    }

    const {
      name,
      email,
      password, 
      role,
      languages,
      bio,
      expertise,
    } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'All required fields must be provided' 
      });
    }

    if (!['traveller', 'guide'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role. Must be "traveller" or "guide"' 
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // 1️⃣ Create User (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password, // Pre-save hook will hash this
      role,
    });

    // 2️⃣ If GUIDE → Create Guide Profile
    let guideProfile = null;

    if (role === 'guide') {
      try {
        // Parse languages and expertise if they're strings
        const languagesArray = typeof languages === 'string' 
          ? languages.split(',').map(l => l.trim()).filter(l => l)
          : (Array.isArray(languages) ? languages : []);
        
        const expertiseArray = typeof expertise === 'string'
          ? expertise.split(',').map(e => e.trim()).filter(e => e)
          : (Array.isArray(expertise) ? expertise : []);

        guideProfile = await Guide.create({
          userId: user._id.toString(), // 🔗 Link Guide to User
          name,
          languages: languagesArray,
          bio: bio || '',
          expertise: expertiseArray,
          availability: [],
        });
      } catch (guideError) {
        console.error('Error creating guide profile:', guideError);
        // Don't fail registration if guide creation fails
        // User is already created, so we continue
      }
    }

    // 🔑 JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      role: user.role,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      guideProfile,
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    
    // Return detailed error for debugging
    res.status(500).json({ 
      success: false,
      message: error.message || 'Registration failed',
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: error.stack,
        fullError: error.toString()
      })
    });
  }
});

/* =====================
   LOGIN
===================== */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;

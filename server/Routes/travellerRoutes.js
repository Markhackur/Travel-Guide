const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Itinerary = require('../models/Itinerary');
const Attraction = require('../models/Attraction');
const Guide = require('../models/Guide');

const router = express.Router();

/* =====================
   GET TRAVELLER PROFILE
   GET /api/traveller/profile
===================== */
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'traveller') {
      return res.status(403).json({ message: 'Access denied. Not a traveller account.' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLocation: user.preferredLocation || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err); 
  }
});

/* =====================
   UPDATE TRAVELLER PROFILE
   PATCH /api/traveller/profile
===================== */
router.patch('/profile', async (req, res, next) => {
  try {
    const { name, preferredLocation } = req.body;
    const updateData = {};

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (preferredLocation !== undefined) updateData.preferredLocation = preferredLocation;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'traveller') {
      return res.status(403).json({ message: 'Access denied. Not a traveller account.' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      preferredLocation: user.preferredLocation || '',
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

/* =====================
   GET TRAVELLER BOOKINGS
   GET /api/traveller/bookings
   Query params: status (optional filter)
===================== */
router.get('/bookings', async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { customerId: req.user.id }; // ✅ FIXED: Use customerId instead of email
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Populate attraction and guide details
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const [attraction, guide] = await Promise.all([
          Attraction.findOne({ id: booking.attractionId }).lean(),
          Guide.findOne({ id: booking.guideId }).lean(),
        ]);

        return {
          ...booking,
          attraction: attraction || null,
          guide: guide ? {
            id: guide.id,
            name: guide.name,
            languages: guide.languages,
            rating: guide.rating,
            bio: guide.bio,
            expertise: guide.expertise,
          } : null,
        };
      })
    );

    res.json({
      count: bookingsWithDetails.length,
      bookings: bookingsWithDetails,
    });
  } catch (err) {
    next(err);
  }
});

/* =====================
   GET TRAVELLER ITINERARIES
   GET /api/traveller/itineraries
===================== */
router.get('/itineraries', async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      count: itineraries.length,
      itineraries,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;





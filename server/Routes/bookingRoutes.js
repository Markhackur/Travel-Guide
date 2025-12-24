const express = require('express');
const Booking = require('../models/Booking');
const Attraction = require('../models/Attraction');
const Guide = require('../models/Guide');
const User = require('../models/User');
const roleMiddleware = require('../Middleware/roleMiddleware');

const router = express.Router();

/* =======================
   UTILITY FUNCTIONS
======================= */
const findGuideAvailability = (guide, date) =>
  guide.availability.find((slot) => slot.date === date);

const calculateAvailableSlots = async (guideId, date) => {
  const guide = await Guide.findOne({ id: guideId }).lean();
  if (!guide) return 0;

  const availabilitySlot = findGuideAvailability(guide, date);
  if (!availabilitySlot) return 0;

  // Calculate total booked slots (sum of partySize for confirmed and pending bookings)
  const confirmedBookings = await Booking.find({
    guideId,
    date,
    status: { $in: ['confirmed', 'pending'] },
  }).lean();
 
  const bookedSlots = confirmedBookings.reduce((sum, booking) => sum + (booking.partySize || 0), 0);
  const totalSlots = availabilitySlot.slots || 0;
  console.log(`DEBUG calculateAvailableSlots: guideId=${guideId}, date=${date}, found ${confirmedBookings.length} bookings, bookedSlots=${bookedSlots}, totalSlots=${totalSlots}`);
  return Math.max(0, totalSlots - bookedSlots);
};

/* =======================
   CREATE BOOKING (Traveller only)
   POST /api/bookings
======================= */
router.post('/', roleMiddleware(['traveller']), async (req, res, next) => {
  try {
    // Safety check for authenticated user
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { attractionId, guideId, date, partySize } = req.body;

    // Validation
    if (!attractionId || !guideId || !date || !partySize) {
      return res.status(400).json({
        message: 'Missing required fields: attractionId, guideId, date, partySize',
      });
    }

    if (partySize <= 0) {
      return res.status(400).json({ message: 'Party size must be greater than 0' });
    }

    // 1️⃣ Validate Attraction exists
    const attraction = await Attraction.findOne({ id: attractionId }).lean();
    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }

    // 2️⃣ Validate Guide exists
    const guide = await Guide.findOne({ id: guideId }).lean();
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    // 3️⃣ Validate attraction is linked to the guide
    if (attraction.guideId !== guideId) {
      return res.status(400).json({
        message: 'This attraction is not available with the selected guide',
      });
    }

    // 4️⃣ Check if date is in attraction availability
    if (attraction.availability && attraction.availability.length > 0) {
      if (!attraction.availability.includes(date)) {
        return res.status(400).json({
          message: `This attraction is not available on ${date}`,
        });
      }
    }

    // 5️⃣ Check guide availability and prevent overbooking
    const availableSlots = await calculateAvailableSlots(guideId, date);
    console.log(`DEBUG: availableSlots=${availableSlots}, partySize=${partySize}`);
    if (availableSlots < partySize) {
      console.log(`DEBUG: Overbooking detected, should reject`);
      return res.status(400).json({
        message: `Only ${availableSlots} slot(s) available. Requested: ${partySize}`,
        availableSlots,
        requestedSlots: partySize,
      });
    }

    // 6️⃣ Create booking with customer data from JWT
    const booking = await Booking.create({
      attractionId,
      guideId,
      customerId: req.user.id, // 🔒 From JWT
      customerName: req.user.name, // 🔒 From JWT
      email: req.user.email, // 🔒 From JWT
      date,
      partySize,
      status: 'pending',
    });
    const populatedBooking = await Booking.findOne({ id: booking.id })
      .lean()
      .then(async (b) => {
        const [attractionData, guideData] = await Promise.all([
          Attraction.findOne({ id: b.attractionId }).lean(),
          Guide.findOne({ id: b.guideId }).lean(),
        ]);

        return {
          ...b,
          attraction: attractionData || null,
          guide: guideData
            ? {
                id: guideData.id,
                name: guideData.name,
                languages: guideData.languages,
                rating: guideData.rating,
                bio: guideData.bio,
                expertise: guideData.expertise,
              }
            : null,
        };
      });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   GET ALL BOOKINGS (with filters)
   GET /api/bookings
   - Travellers: See only their bookings
   - Guides: See bookings for their attractions
======================= */
router.get('/', async (req, res, next) => {
  try {
    const { status, guideId, customerId, date } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'traveller') {
      // Travellers can only see their own bookings
      query.customerId = req.user.id;
    } else if (req.user.role === 'guide') {
      // Guides can see bookings for their attractions
      const guide = await Guide.findOne({ userId: req.user.id }).lean();
      if (guide) {
        query.guideId = guide.id;
      } else {
        // Guide profile not found, return empty
        return res.json({ count: 0, bookings: [] });
      }
    }

    // Additional query filters
    if (status) query.status = status;
    if (guideId && req.user.role !== 'traveller') query.guideId = guideId;
    if (customerId && req.user.role === 'guide') query.customerId = customerId;
    if (date) query.date = date;

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
          guide: guide
            ? {
                id: guide.id,
                name: guide.name,
                languages: guide.languages,
                rating: guide.rating,
                bio: guide.bio,
                expertise: guide.expertise,
              }
            : null,
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

/* =======================
   GET SINGLE BOOKING
   GET /api/bookings/:id
======================= */
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ id: req.params.id }).lean();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ownership check
    if (req.user.role === 'traveller' && booking.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    } else if (req.user.role === 'guide') {
      const guide = await Guide.findOne({ userId: req.user.id }).lean();
      if (!guide || guide.id !== booking.guideId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Populate attraction and guide details
    const [attraction, guide] = await Promise.all([
      Attraction.findOne({ id: booking.attractionId }).lean(),
      Guide.findOne({ id: booking.guideId }).lean(),
    ]);

    const bookingWithDetails = {
      ...booking,
      attraction: attraction || null,
      guide: guide
        ? {
            id: guide.id,
            name: guide.name,
            languages: guide.languages,
            rating: guide.rating,
            bio: guide.bio,
            expertise: guide.expertise,
          }
        : null,
    };

    res.json(bookingWithDetails);
  } catch (err) {
    next(err);
  }
});

/* =======================
   UPDATE BOOKING STATUS (Guide only)
   PATCH /api/bookings/:id/status
======================= */
router.patch('/:id/status', roleMiddleware(['guide']), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Find booking
    const booking = await Booking.findOne({ id: req.params.id }).lean();
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify guide owns this booking
    const guide = await Guide.findOne({ userId: req.user.id }).lean();
    if (!guide || guide.id !== booking.guideId) {
      return res.status(403).json({
        message: 'You can only update bookings for your own attractions',
      });
    }

    // Update booking
    const updatedBooking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    ).lean();

    // Populate details
    const [attraction, guideData] = await Promise.all([
      Attraction.findOne({ id: updatedBooking.attractionId }).lean(),
      Guide.findOne({ id: updatedBooking.guideId }).lean(),
    ]);

    const bookingWithDetails = {
      ...updatedBooking,
      attraction: attraction || null,
      guide: guideData
        ? {
            id: guideData.id,
            name: guideData.name,
            languages: guideData.languages,
            rating: guideData.rating,
            bio: guideData.bio,
            expertise: guideData.expertise,
          }
        : null,
    };

    res.json({
      message: 'Booking status updated successfully',
      booking: bookingWithDetails,
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   CANCEL BOOKING (Traveller only)
   PATCH /api/bookings/:id/cancel
======================= */
router.patch('/:id/cancel', roleMiddleware(['traveller']), async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ id: req.params.id }).lean();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify traveller owns this booking
    if (booking.customerId !== req.user.id) {
      return res.status(403).json({
        message: 'You can only cancel your own bookings',
      });
    }

    // Prevent cancelling already cancelled/completed bookings
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    }

    // Update booking
    const updatedBooking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      { status: 'cancelled' },
      { new: true }
    ).lean();

    // Populate details
    const [attraction, guide] = await Promise.all([
      Attraction.findOne({ id: updatedBooking.attractionId }).lean(),
      Guide.findOne({ id: updatedBooking.guideId }).lean(),
    ]);

    const bookingWithDetails = {
      ...updatedBooking,
      attraction: attraction || null,
      guide: guide
        ? {
            id: guide.id,
            name: guide.name,
            languages: guide.languages,
            rating: guide.rating,
            bio: guide.bio,
            expertise: guide.expertise,
          }
        : null,
    };

    res.json({
      message: 'Booking cancelled successfully',
      booking: bookingWithDetails,
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   CHECK AVAILABILITY
   GET /api/bookings/availability/:guideId
======================= */
router.get('/availability/:guideId', async (req, res, next) => {
  try {
    const { date } = req.query;
    const { guideId } = req.params;

    const guide = await Guide.findOne({ id: guideId }).lean();
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    if (date) {
      // Check availability for specific date
      const availableSlots = await calculateAvailableSlots(guideId, date);
      const availabilitySlot = findGuideAvailability(guide, date);

      res.json({
        guideId,
        date,
        totalSlots: availabilitySlot ? availabilitySlot.slots : 0,
        availableSlots,
        isAvailable: availableSlots > 0,
      });
    } else {
      // Return all availability
      const availabilityWithBookings = await Promise.all(
        guide.availability.map(async (slot) => {
          const availableSlots = await calculateAvailableSlots(guideId, slot.date);
          return {
            date: slot.date,
            totalSlots: slot.slots,
            availableSlots,
            isAvailable: availableSlots > 0,
          };
        })
      );

      res.json({
        guideId,
        guideName: guide.name,
        availability: availabilityWithBookings,
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router; 
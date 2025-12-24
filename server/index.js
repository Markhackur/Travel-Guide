require('dotenv').config();
const express = require('express');
const cors = require('cors');

/* =======================
   DB & MODELS
======================= */
const { connectDB } = require('./config/db');
const { defaultData } = require('./utils/dataStore');

const Guide = require('./models/Guide');
const Attraction = require('./models/Attraction');
const Booking = require('./models/Booking');
const Itinerary = require('./models/Itinerary');
const Review = require('./models/Review');
const User = require('./models/User');

/* =======================
   AUTH & MIDDLEWARES
======================= */
const authRoutes = require('./Routes/authRoutes');
const travellerRoutes = require('./Routes/travellerRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');
const itineraryRoutes = require('./Routes/itineraryRoutes');
const reviewRoutes = require('./Routes/reviewRoutes');
const aiRoutes = require('./Routes/aiRoutes');
const authMiddleware = require('./Middleware/authMiddleware');
const roleMiddleware = require('./Middleware/roleMiddleware');
const rateLimiter = require('./Middleware/rateLimiter');

/* =======================A
   GEMINI AI
======================= */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/* =======================
   APP SETUP
======================= */
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limit request size

// Optional: Enable rate limiting for production
// app.use('/api/', rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

/* =======================
   UTILS
======================= */
const findGuideAvailability = (guide, date) =>
  guide.availability.find((slot) => slot.date === date);

/* =======================
   SEED DATABASE
======================= */
async function seedIfEmpty() {
  const [guideCount, attractionCount, bookingCount, itineraryCount, reviewCount, userCount] =
    await Promise.all([
      Guide.estimatedDocumentCount(),
      Attraction.estimatedDocumentCount(),
      Booking.estimatedDocumentCount(),
      Itinerary.estimatedDocumentCount(),
      Review.estimatedDocumentCount(),
      User.estimatedDocumentCount(),
    ]);

  if (attractionCount === 0) await Attraction.insertMany(defaultData.attractions);
  if (bookingCount === 0) await Booking.insertMany(defaultData.bookings);
  if (itineraryCount === 0) await Itinerary.insertMany(defaultData.itineraries);
  if (reviewCount === 0) await Review.insertMany(defaultData.reviews);

}

/* =======================
   ROUTES
======================= */

/* ---- HEALTH ---- */
app.get('/api/health', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    jwtSecret: process.env.JWT_SECRET ? 'set' : 'missing'
  });
});

/* ---- AUTH ---- */
app.use('/api/auth', authRoutes);

/* ---- TRAVELLER PROFILE ---- */
app.use('/api/traveller', authMiddleware, roleMiddleware(['traveller']), travellerRoutes);

/* ---- BOOKINGS ---- */
app.use('/api/bookings', authMiddleware, bookingRoutes);

/* ---- ITINERARIES ---- */
app.use('/api/itineraries', authMiddleware, roleMiddleware(['traveller']), itineraryRoutes);

/* ---- REVIEWS ---- */
// Public: GET reviews
app.get('/api/reviews', async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    const query = {};
    if (targetType) query.targetType = targetType;
    if (targetId) query.targetId = targetId;
    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();
    res.json({ count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
});

// Protected: Create/Update/Delete reviews
app.use('/api/reviews', authMiddleware, reviewRoutes);

/* ---- SUMMARY ---- */
app.get('/api/summary', async (_req, res, next) => {
  try {
    const [attractions, totalGuides, totalBookings] = await Promise.all([
      Attraction.find().lean(),
      Guide.countDocuments(),
      Booking.countDocuments(),
    ]);

    const avgRating =
      attractions.reduce((acc, cur) => acc + (cur.rating || 0), 0) /
      (attractions.length || 1);

    const topAttractions = attractions
      .slice()
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    res.json({
      totalAttractions: attractions.length,
      totalGuides,
      totalBookings,
      averageRating: Number(avgRating.toFixed(2)),
      topAttractions,
    });
  } catch (err) {
    next(err);
  }
});

/* ---- ATTRACTIONS ---- */
app.get('/api/attractions', async (req, res, next) => {
  try {
    const query = (req.query.q || '').toLowerCase();
    const attractions = await Attraction.find().lean();

    const filtered = query
      ? attractions.filter(
          (a) =>
            a.name.toLowerCase().includes(query) ||
            a.location.toLowerCase().includes(query) ||
            a.category.toLowerCase().includes(query)
        )
      : attractions;

    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

/* ---- GUIDES ---- */
app.get('/api/guides', async (req, res, next) => {
  try {
    const { date } = req.query;
    const guides = await Guide.find().lean();
    res.json(date ? guides.filter((g) => findGuideAvailability(g, date)) : guides);
  } catch (err) {
    next(err);
  }
});

app.patch(
  '/api/guides/availability',
  authMiddleware,
  roleMiddleware(['guide']),
  async (req, res, next) => {
    try {
      const { date, slots } = req.body;

      const guide = await Guide.findOne({ userId: req.user.id });
      if (!guide) return res.status(404).json({ message: 'Guide not found' });

      // Ensure userId is set (for legacy guides)
      if (!guide.userId) guide.userId = req.user.id;

      const slot = findGuideAvailability(guide, date);
      if (slot) slot.slots = slots;
      else guide.availability.push({ date, slots });

      await guide.save();
      res.json(guide);
    } catch (err) {
      next(err);
    }
  }
);




/* ---- AI ROUTES ---- */
app.use('/api/ai', authMiddleware, aiRoutes);

/* =======================
   ERROR HANDLER
======================= */
const errorHandler = require('./Middleware/errorHandler');
app.use(errorHandler);

/* =======================
   START SERVER
======================= */
async function start() {
  try {
    await connectDB();
    await seedIfEmpty();
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Attraction = require('../models/Attraction');
const Guide = require('../models/Guide');
const User = require('../models/User');

const router = express.Router();

/* =======================
   UTILITY FUNCTIONS
======================= */

// Calculate average rating
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(2));
};

// Update attraction rating
const updateAttractionRating = async (attractionId) => {
  const reviews = await Review.find({
    targetType: 'attraction',
    targetId: attractionId,
  }).lean();

  const avgRating = calculateAverageRating(reviews);

  await Attraction.findOneAndUpdate(
    { id: attractionId },
    { rating: avgRating },
    { new: true }
  );
}; 

// Update guide rating
const updateGuideRating = async (guideId) => {
  const reviews = await Review.find({
    targetType: 'guide',
    targetId: guideId,
  }).lean();

  const avgRating = calculateAverageRating(reviews);

  await Guide.findOneAndUpdate(
    { id: guideId },
    { rating: avgRating },
    { new: true }
  );
};

// Check if user has booked (for attraction reviews)
const hasBookedAttraction = async (userId, attractionId) => {
  const bookings = await Booking.find({
    customerId: userId,
    attractionId,
    status: { $in: ['confirmed', 'completed'] },
  }).lean();

  return bookings.length > 0;
};

// Check if user has booked with guide (for guide reviews)
const hasBookedWithGuide = async (userId, guideId) => {
  const bookings = await Booking.find({
    customerId: userId,
    guideId,
    status: { $in: ['confirmed', 'completed'] },
  }).lean();

  return bookings.length > 0;
};

/* =======================
   GET ALL REVIEWS
   GET /api/reviews
======================= */
router.get('/', async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    const query = {};

    if (targetType) query.targetType = targetType;
    if (targetId) query.targetId = targetId;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   GET SINGLE REVIEW
   GET /api/reviews/:id
======================= */
router.get('/:id', async (req, res, next) => {
  try {
    const review = await Review.findOne({ id: req.params.id }).lean();

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (err) {
    next(err);
  }
});

/* =======================
   CREATE REVIEW (Traveller only)
   POST /api/reviews
======================= */
router.post('/', async (req, res, next) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    // Validation
    if (!targetType || !targetId || !rating || !comment) {
      return res.status(400).json({
        message: 'Missing required fields: targetType, targetId, rating, comment',
      });
    }

    if (!['attraction', 'guide'].includes(targetType)) {
      return res.status(400).json({
        message: 'targetType must be either "attraction" or "guide"',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5',
      });
    }

    // Get user details
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'traveller') {
      return res.status(403).json({
        message: 'Only travellers can create reviews',
      });
    }

    // Check if target exists
    if (targetType === 'attraction') {
      const attraction = await Attraction.findOne({ id: targetId }).lean();
      if (!attraction) {
        return res.status(404).json({ message: 'Attraction not found' });
      }

      // Check if user has booked this attraction
      const hasBooked = await hasBookedAttraction(req.user.id, targetId);
      if (!hasBooked) {
        return res.status(403).json({
          message: 'You can only review attractions you have booked',
        });
      }
    } else if (targetType === 'guide') {
      const guide = await Guide.findOne({ id: targetId }).lean();
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }

      // Check if user has booked with this guide
      const hasBooked = await hasBookedWithGuide(req.user.id, targetId);
      if (!hasBooked) {
        return res.status(403).json({
          message: 'You can only review guides you have booked with',
        });
      }
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      reviewerId: req.user.id,
      targetType,
      targetId,
    }).lean();

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this ' + targetType,
        existingReview,
      });
    }

    // Create review
    const review = await Review.create({
      targetType,
      targetId,
      reviewerId: req.user.id,
      rating,
      comment,
      reviewer: user.name,
      date: new Date().toISOString().split('T')[0],
    });

    // Update ratings
    if (targetType === 'attraction') {
      await updateAttractionRating(targetId);
    } else if (targetType === 'guide') {
      await updateGuideRating(targetId);
    }

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        message: 'You have already reviewed this ' + req.body.targetType,
      });
    }
    next(err);
  }
});

/* =======================
   UPDATE REVIEW (Traveller only - own reviews)
   PATCH /api/reviews/:id
======================= */
router.patch('/:id', async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOne({ id: req.params.id }).lean();

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.reviewerId !== req.user.id) {
      return res.status(403).json({
        message: 'You can only update your own reviews',
      });
    }

    // Update fields
    const updateData = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: 'Rating must be between 1 and 5',
        });
      }
      updateData.rating = rating;
    }
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    const updatedReview = await Review.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    ).lean();

    // Update ratings
    if (updatedReview.targetType === 'attraction') {
      await updateAttractionRating(updatedReview.targetId);
    } else if (updatedReview.targetType === 'guide') {
      await updateGuideRating(updatedReview.targetId);
    }

    res.json({
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   DELETE REVIEW (Traveller only - own reviews)
   DELETE /api/reviews/:id
======================= */
router.delete('/:id', async (req, res, next) => {
  try {
    const review = await Review.findOne({ id: req.params.id }).lean();

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.reviewerId !== req.user.id) {
      return res.status(403).json({
        message: 'You can only delete your own reviews',
      });
    }

    const targetType = review.targetType;
    const targetId = review.targetId;

    await Review.findOneAndDelete({ id: req.params.id });

    // Update ratings
    if (targetType === 'attraction') {
      await updateAttractionRating(targetId);
    } else if (targetType === 'guide') {
      await updateGuideRating(targetId);
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/* =======================
   GET REVIEWS BY TARGET
   GET /api/reviews/target/:targetType/:targetId
======================= */
router.get('/target/:targetType/:targetId', async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;

    if (!['attraction', 'guide'].includes(targetType)) {
      return res.status(400).json({
        message: 'targetType must be either "attraction" or "guide"',
      });
    }

    const reviews = await Review.find({
      targetType,
      targetId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const avgRating = calculateAverageRating(reviews);

    res.json({
      count: reviews.length,
      averageRating: avgRating,
      reviews,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;






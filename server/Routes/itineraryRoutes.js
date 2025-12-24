const express = require('express');
const Itinerary = require('../models/Itinerary');
const Attraction = require('../models/Attraction');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/* =======================
   UTILITY FUNCTIONS
======================= */

// Check if two date ranges overlap
const datesOverlap = (start1, end1, start2, end2) => {
  if (!start1 || !end1 || !start2 || !end2) return false;
  return start1 <= end2 && start2 <= end1;
};

// Check if itinerary dates overlap with existing itineraries
const checkDateOverlap = async (userId, startDate, endDate, excludeItineraryId = null) => {
  const query = { userId };
  if (excludeItineraryId) {
    query.id = { $ne: excludeItineraryId };
  }
 
  const existingItineraries = await Itinerary.find(query).lean();
  return existingItineraries.some((itinerary) =>
    datesOverlap(startDate, endDate, itinerary.startDate, itinerary.endDate)
  );
};

// Format date for comparison (YYYY-MM-DD)
const formatDate = (dateString) => {
  if (!dateString) return null;
  return dateString.split('T')[0];
};

/* =======================
   GET ALL ITINERARIES
   GET /api/itineraries
======================= */
router.get('/', async (req, res, next) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Populate attraction details
    const itinerariesWithAttractions = await Promise.all(
      itineraries.map(async (itinerary) => {
        const attractions = await Attraction.find({
          id: { $in: itinerary.attractionIds || [] },
        }).lean();

        return {
          ...itinerary,
          attractions: attractions || [],
        };
      })
    );

    res.json({
      count: itinerariesWithAttractions.length,
      itineraries: itinerariesWithAttractions,
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   GET SINGLE ITINERARY
   GET /api/itineraries/:id
======================= */
router.get('/:id', async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      id: req.params.id,
    }).lean();

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Populate attraction details
    const attractions = await Attraction.find({
      id: { $in: itinerary.attractionIds || [] },
    }).lean();

    res.json({
      ...itinerary,
      attractions: attractions || [],
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   CREATE ITINERARY
   POST /api/itineraries
======================= */
router.post('/', async (req, res, next) => {
  try {
    const { title, startDate, endDate, notes, attractionIds } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Get user details
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check date overlap if dates are provided
    if (startDate && endDate) {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      if (formattedStartDate > formattedEndDate) {
        return res.status(400).json({
          message: 'Start date must be before or equal to end date',
        });
      }

      const hasOverlap = await checkDateOverlap(
        req.user.id,
        formattedStartDate,
        formattedEndDate
      );

      if (hasOverlap) {
        return res.status(400).json({
          message: 'Itinerary dates overlap with an existing itinerary',
        });
      }
    }

    // Validate attractions if provided
    if (attractionIds && attractionIds.length > 0) {
      const attractions = await Attraction.find({
        id: { $in: attractionIds },
      }).lean();

      if (attractions.length !== attractionIds.length) {
        return res.status(400).json({
          message: 'One or more attractions not found',
        });
      }
    }

    const itinerary = await Itinerary.create({
      userId: req.user.id,
      travelerName: user.name,
      title,
      startDate: startDate ? formatDate(startDate) : null,
      endDate: endDate ? formatDate(endDate) : null,
      notes: notes || '',
      attractionIds: attractionIds || [],
      items: [],
    });

    // Populate attractions
    const attractions = await Attraction.find({
      id: { $in: itinerary.attractionIds || [] },
    }).lean();

    res.status(201).json({
      message: 'Itinerary created successfully',
      itinerary: {
        ...itinerary.toObject(),
        attractions: attractions || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   UPDATE ITINERARY
   PATCH /api/itineraries/:id
======================= */
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, startDate, endDate, notes } = req.body;

    const itinerary = await Itinerary.findOne({
      id: req.params.id,
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Ownership check
    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (title !== undefined) itinerary.title = title;
    if (notes !== undefined) itinerary.notes = notes;

    // Handle date updates with overlap checking
    const newStartDate = startDate ? formatDate(startDate) : itinerary.startDate;
    const newEndDate = endDate ? formatDate(endDate) : itinerary.endDate;

    if (newStartDate && newEndDate) {
      if (newStartDate > newEndDate) {
        return res.status(400).json({
          message: 'Start date must be before or equal to end date',
        });
      }

      // Check overlap excluding current itinerary
      const hasOverlap = await checkDateOverlap(
        req.user.id,
        newStartDate,
        newEndDate,
        itinerary.id
      );

      if (hasOverlap) {
        return res.status(400).json({
          message: 'Itinerary dates overlap with an existing itinerary',
        });
      }

      itinerary.startDate = newStartDate;
      itinerary.endDate = newEndDate;
    } else if (startDate !== undefined || endDate !== undefined) {
      itinerary.startDate = newStartDate;
      itinerary.endDate = newEndDate;
    }

    await itinerary.save();

    // Populate attractions
    const attractions = await Attraction.find({
      id: { $in: itinerary.attractionIds || [] },
    }).lean();

    res.json({
      message: 'Itinerary updated successfully',
      itinerary: {
        ...itinerary.toObject(),
        attractions: attractions || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   DELETE ITINERARY
   DELETE /api/itineraries/:id
======================= */
router.delete('/:id', async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      id: req.params.id,
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    // Ownership check
    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ message: 'Itinerary deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/* =======================
   ADD ATTRACTIONS TO ITINERARY
   POST /api/itineraries/:id/attractions
======================= */
router.post('/:id/attractions', async (req, res, next) => {
  try {
    const { attractionIds } = req.body;

    if (!attractionIds || !Array.isArray(attractionIds) || attractionIds.length === 0) {
      return res.status(400).json({
        message: 'attractionIds array is required',
      });
    }

    const itinerary = await Itinerary.findOne({
      id: req.params.id,
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Ownership check
    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate attractions exist
    const attractions = await Attraction.find({
      id: { $in: attractionIds },
    }).lean();

    if (attractions.length !== attractionIds.length) {
      return res.status(400).json({
        message: 'One or more attractions not found',
      });
    }

    // Add attractions (avoid duplicates)
    const existingIds = itinerary.attractionIds || [];
    const newIds = attractionIds.filter((id) => !existingIds.includes(id));
    itinerary.attractionIds = [...existingIds, ...newIds];

    await itinerary.save();

    // Populate all attractions
    const allAttractions = await Attraction.find({
      id: { $in: itinerary.attractionIds },
    }).lean();

    res.json({
      message: 'Attractions added successfully',
      added: newIds.length,
      itinerary: {
        ...itinerary.toObject(),
        attractions: allAttractions || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   REMOVE ATTRACTIONS FROM ITINERARY
   DELETE /api/itineraries/:id/attractions
======================= */
router.delete('/:id/attractions', async (req, res, next) => {
  try {
    const { attractionIds } = req.body;

    if (!attractionIds || !Array.isArray(attractionIds) || attractionIds.length === 0) {
      return res.status(400).json({
        message: 'attractionIds array is required',
      });
    }

    const itinerary = await Itinerary.findOne({
      id: req.params.id,
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Ownership check
    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove attractions
    const existingIds = itinerary.attractionIds || [];
    const removedIds = attractionIds.filter((id) => existingIds.includes(id));
    itinerary.attractionIds = existingIds.filter((id) => !attractionIds.includes(id));

    await itinerary.save();

    // Populate remaining attractions
    const remainingAttractions = await Attraction.find({
      id: { $in: itinerary.attractionIds },
    }).lean();

    res.json({
      message: 'Attractions removed successfully',
      removed: removedIds.length,
      itinerary: {
        ...itinerary.toObject(),
        attractions: remainingAttractions || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

/* =======================
   AI GENERATE ITINERARY
   POST /api/itineraries/ai/generate
======================= */
router.post('/ai/generate', async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(500).json({ message: 'Gemini AI not configured' });
    }

    const { city, days, preferences, budget } = req.body;

    if (!city || !days) {
      return res.status(400).json({
        message: 'city and days are required',
      });
    }

    if (days <= 0 || days > 30) {
      return res.status(400).json({
        message: 'days must be between 1 and 30',
      });
    }

    // Get available attractions in the city
    const attractions = await Attraction.find({
      location: { $regex: city, $options: 'i' },
    }).lean();

    if (attractions.length === 0) {
      return res.status(404).json({
        message: `No attractions found in ${city}`,
      });
    }

    // Build context for AI
    const attractionsContext = attractions
      .map(
        (a) =>
          `- ${a.name} (${a.category}): ${a.description}. Duration: ${a.duration}, Price: $${a.price}, Rating: ${a.rating}/5`
      )
      .join('\n');

    const preferencesText = preferences ? `Preferences: ${preferences}. ` : '';
    const budgetText = budget ? `Budget: $${budget}. ` : '';

    const prompt = `You are a travel planning assistant. Create a ${days}-day itinerary for ${city}.

Available attractions:
${attractionsContext}

${preferencesText}${budgetText}
Please create a detailed day-by-day itinerary with:
1. Day number and date suggestions
2. Activities for each day (use attraction names from the list)
3. Logical flow and timing
4. Mix of activities based on categories

Format your response as JSON with this structure:
{
  "title": "Itinerary title",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "items": [
    {
      "day": "Day 1",
      "activities": ["Activity 1", "Activity 2", ...]
    }
  ],
  "notes": "Additional notes and tips"
}

Return ONLY valid JSON, no markdown or extra text.`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?/g, '');
      }

      const aiItinerary = JSON.parse(jsonText);

      // Get user details
      const user = await User.findById(req.user.id).lean();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check date overlap
      if (aiItinerary.startDate && aiItinerary.endDate) {
        const hasOverlap = await checkDateOverlap(
          req.user.id,
          aiItinerary.startDate,
          aiItinerary.endDate
        );

        if (hasOverlap) {
          return res.status(400).json({
            message: 'Generated itinerary dates overlap with an existing itinerary',
            suggestion: 'Please adjust dates or delete conflicting itinerary',
          });
        }
      }

      // Match attractions from AI suggestions
      const suggestedAttractionIds = [];
      const allActivities = aiItinerary.items.flatMap((item) => item.activities || []);

      attractions.forEach((attraction) => {
        const attractionNameLower = attraction.name.toLowerCase();
        if (
          allActivities.some((activity) =>
            activity.toLowerCase().includes(attractionNameLower)
          )
        ) {
          suggestedAttractionIds.push(attraction.id);
        }
      });

      // Create itinerary
      const itinerary = await Itinerary.create({
        userId: req.user.id,
        travelerName: user.name,
        title: aiItinerary.title || `${days}-Day ${city} Itinerary`,
        startDate: aiItinerary.startDate || null,
        endDate: aiItinerary.endDate || null,
        items: aiItinerary.items || [],
        attractionIds: suggestedAttractionIds,
        notes: aiItinerary.notes || '',
      });

      // Populate attractions
      const populatedAttractions = await Attraction.find({
        id: { $in: itinerary.attractionIds },
      }).lean();

      res.status(201).json({
        message: 'AI itinerary generated successfully',
        itinerary: {
          ...itinerary.toObject(),
          attractions: populatedAttractions || [],
        },
      });
    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      return res.status(500).json({
        message: 'Failed to generate itinerary. Please try again.',
        error: aiError.message,
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;





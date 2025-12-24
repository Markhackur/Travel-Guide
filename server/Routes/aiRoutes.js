const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Attraction = require('../models/Attraction');
const Guide = require('../models/Guide');
const Itinerary = require('../models/Itinerary');
const Booking = require('../models/Booking');

const router = express.Router();

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/* =======================
   AI TRAVEL PLANNER
   POST /api/ai/travel-planner
======================= */
router.post('/travel-planner', async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(500).json({ message: 'Gemini AI not configured' });
    }
 
    const { city, days, preferences, budget, travelStyle } = req.body;

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

    // Get attractions in the city
    const attractions = await Attraction.find({
      location: { $regex: city, $options: 'i' },
    }).lean();

    if (attractions.length === 0) {
      return res.status(404).json({
        message: `No attractions found in ${city}`,
      });
    }

    // Get guides in the city
    const guideIds = [...new Set(attractions.map((a) => a.guideId))];
    const guides = await Guide.find({ id: { $in: guideIds } }).lean();

    // Build context
    const attractionsContext = attractions
      .map(
        (a) =>
          `- ${a.name} (${a.category}): ${a.description}. Duration: ${a.duration}, Price: $${a.price}, Rating: ${a.rating}/5`
      )
      .join('\n');

    const preferencesText = preferences ? `Preferences: ${preferences}. ` : '';
    const budgetText = budget ? `Budget: $${budget} total. ` : '';
    const styleText = travelStyle ? `Travel style: ${travelStyle}. ` : '';

    const prompt = `You are an expert travel planner. Create a comprehensive ${days}-day travel plan for ${city}.

Available attractions:
${attractionsContext}

${preferencesText}${budgetText}${styleText}
Create a detailed travel plan including:
1. Day-by-day itinerary with specific activities
2. Estimated costs per day
3. Best times to visit each attraction
4. Travel tips and recommendations
5. Budget breakdown

Format your response as JSON:
{
  "summary": "Brief overview",
  "itinerary": [
    {
      "day": "Day 1",
      "date": "YYYY-MM-DD",
      "activities": ["Activity 1", "Activity 2"],
      "estimatedCost": 100,
      "tips": "Tips for this day"
    }
  ],
  "totalEstimatedCost": 500,
  "tips": "General travel tips",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Return ONLY valid JSON, no markdown or extra text.`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();

      // Extract JSON
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/g, '').replace(/```\n?/g, '');
      }

      const travelPlan = JSON.parse(responseText);

      res.json({
        message: 'Travel plan generated successfully',
        city,
        days,
        plan: travelPlan,
        availableAttractions: attractions.length,
      });
    } catch (aiError) {
      console.error('AI Travel Planner Error:', aiError);
      return res.status(500).json({
        message: 'Failed to generate travel plan. Please try again.',
        error: aiError.message,
      });
    }
  } catch (err) {
    next(err);
  }
});

/* =======================
   AI GENERATE ITINERARY
   POST /api/ai/generate
======================= */
router.post('/generate', async (req, res, next) => {
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

    // Get attractions in the city
    const attractions = await Attraction.find({
      location: { $regex: city, $options: 'i' },
    }).lean();

    if (attractions.length === 0) {
      return res.status(200).json({
        message: 'No attractions found for this city',
        itinerary: [],
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
      let responseText = result.response.text().trim();

      // Extract JSON
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/g, '').replace(/```\n?/g, '');
      }

      const aiItinerary = JSON.parse(responseText);

      res.json({ itinerary: aiItinerary });
    } catch (aiError) {
      console.error('AI Generate Error:', aiError);
      return res.status(500).json({
        message: 'Failed to generate itinerary. Please try again.',
        error: aiError.message,
      });
    }
  } catch (err) {
    next(err);
  }
});

/* =======================
   AI ATTRACTION RECOMMENDATIONS
   POST /api/ai/recommendations
======================= */
router.post('/recommendations', async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(500).json({ message: 'Gemini AI not configured' });
    }

    const { city, preferences, budget, interests, excludeIds } = req.body;

    if (!city) {
      return res.status(400).json({
        message: 'city is required',
      });
    }

    // Get attractions in the city
    let query = {
      location: { $regex: city, $options: 'i' },
    };

    if (excludeIds && Array.isArray(excludeIds) && excludeIds.length > 0) {
      query.id = { $nin: excludeIds };
    }

    const attractions = await Attraction.find(query).lean();

    if (attractions.length === 0) {
      return res.status(404).json({
        message: `No attractions found in ${city}`,
      });
    }

    // Build context
    const attractionsContext = attractions
      .map(
        (a) =>
          `- ${a.name} (${a.category}): ${a.description}. Duration: ${a.duration}, Price: $${a.price}, Rating: ${a.rating}/5, Tags: ${a.tags.join(', ')}`
      )
      .join('\n');

    const preferencesText = preferences ? `Preferences: ${preferences}. ` : '';
    const budgetText = budget ? `Budget: $${budget}. ` : '';
    const interestsText = interests ? `Interests: ${interests.join(', ')}. ` : '';

    const prompt = `You are a travel recommendation expert. Recommend the best attractions in ${city} based on user preferences.

Available attractions:
${attractionsContext}

${preferencesText}${budgetText}${interestsText}
Analyze and recommend the top attractions that match the user's preferences. Consider:
1. User interests and preferences
2. Budget constraints
3. Attraction ratings and reviews
4. Category matching
5. Value for money

Format your response as JSON:
{
  "recommendations": [
    {
      "attractionId": "attraction-id",
      "attractionName": "Name",
      "reason": "Why this is recommended",
      "matchScore": 95
    }
  ],
  "summary": "Brief summary of recommendations"
}

Return ONLY valid JSON, no markdown or extra text.`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();

      // Extract JSON
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/g, '').replace(/```\n?/g, '');
      }

      const recommendations = JSON.parse(responseText);

      // Validate and enrich recommendations with actual attraction data
      const enrichedRecommendations = recommendations.recommendations
        .map((rec) => {
          const attraction = attractions.find((a) => a.id === rec.attractionId);
          return attraction
            ? {
                ...rec,
                attraction: {
                  id: attraction.id,
                  name: attraction.name,
                  location: attraction.location,
                  description: attraction.description,
                  category: attraction.category,
                  duration: attraction.duration,
                  price: attraction.price,
                  rating: attraction.rating,
                  tags: attraction.tags,
                  image: attraction.image,
                },
              }
            : null;
        })
        .filter((rec) => rec !== null);

      res.json({
        message: 'Recommendations generated successfully',
        city,
        summary: recommendations.summary,
        recommendations: enrichedRecommendations,
        totalAvailable: attractions.length,
      });
    } catch (aiError) {
      console.error('AI Recommendations Error:', aiError);
      return res.status(500).json({
        message: 'Failed to generate recommendations. Please try again.',
        error: aiError.message,
      });
    }
  } catch (err) {
    next(err);
  }
});

/* =======================
   AI ITINERARY OPTIMIZATION
   POST /api/ai/optimize-itinerary
======================= */
router.post('/optimize-itinerary', async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(500).json({ message: 'Gemini AI not configured' });
    }

    const { itineraryId } = req.body;

    if (!itineraryId) {
      return res.status(400).json({
        message: 'itineraryId is required',
      });
    }

    // Get itinerary
    const itinerary = await Itinerary.findOne({
      id: itineraryId,
      userId: req.user.id,
    }).lean();

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Get attractions
    const attractions = await Attraction.find({
      id: { $in: itinerary.attractionIds || [] },
    }).lean();

    if (attractions.length === 0) {
      return res.status(400).json({
        message: 'Itinerary has no attractions to optimize',
      });
    }

    // Build context
    const attractionsContext = attractions
      .map(
        (a) =>
          `- ${a.name} (${a.category}): ${a.description}. Duration: ${a.duration}, Price: $${a.price}, Location: ${a.location}`
      )
      .join('\n');

    const currentItinerary = itinerary.items
      .map((item) => `${item.day}: ${item.activities.join(', ')}`)
      .join('\n');

    const prompt = `You are an itinerary optimization expert. Optimize this travel itinerary for better flow, timing, and experience.

Current Itinerary:
${currentItinerary}

Available Attractions:
${attractionsContext}

Travel Dates: ${itinerary.startDate || 'Not specified'} to ${itinerary.endDate || 'Not specified'}

Optimize the itinerary considering:
1. Logical geographic flow (minimize travel time)
2. Best times to visit each attraction
3. Balanced daily schedules (not too packed)
4. Category variety per day
5. Rest periods and meal times
6. Weather considerations if applicable

Format your response as JSON:
{
  "optimizedItems": [
    {
      "day": "Day 1",
      "activities": ["Optimized activity list"],
      "optimizationNotes": "Why this is optimized"
    }
  ],
  "improvements": ["Improvement 1", "Improvement 2"],
  "estimatedSavings": "Time/money saved",
  "tips": "Optimization tips"
}

Return ONLY valid JSON, no markdown or extra text.`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();

      // Extract JSON
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/g, '').replace(/```\n?/g, '');
      }

      const optimization = JSON.parse(responseText);

      res.json({
        message: 'Itinerary optimized successfully',
        itineraryId,
        optimization,
        originalItems: itinerary.items,
      });
    } catch (aiError) {
      console.error('AI Optimization Error:', aiError);
      return res.status(500).json({
        message: 'Failed to optimize itinerary. Please try again.',
        error: aiError.message,
      });
    }
  } catch (err) {
    next(err);
  }
});

/* =======================
   AI CHAT (Enhanced)
   POST /api/ai/chat
======================= */
router.post('/chat', async (req, res, next) => {
  try {
    if (!genAI) {
      return res.status(500).json({ message: 'Gemini AI not configured' });
    }

    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        message: 'message is required',
      });
    }

    // Build context from database if needed
    let contextText = '';
    if (context && context.city) {
      const attractions = await Attraction.find({
        location: { $regex: context.city, $options: 'i' },
      })
        .limit(10)
        .lean();

      if (attractions.length > 0) {
        contextText = `\n\nAvailable attractions in ${context.city}:\n`;
        contextText += attractions
          .map((a) => `- ${a.name}: ${a.description}`)
          .join('\n');
      }
    }

    const prompt = `You are a helpful travel assistant. Answer travel-related questions accurately and helpfully.

${contextText}

User question: ${message}

Provide a helpful, accurate response.`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const reply = result.response.text();

      res.json({
        reply,
        context: context || null,
      });
    } catch (aiError) {
      console.error('AI Chat Error:', aiError);
      return res.status(500).json({
        message: 'Failed to process chat message. Please try again.',
        error: aiError.message,
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;






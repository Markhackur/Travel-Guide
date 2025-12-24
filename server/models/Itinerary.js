const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ItineraryItemSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    activities: { type: [String], default: [] },
  },
  { _id: false },
);

const ItinerarySchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4 },
    userId: { type: String, required: true }, // 🔗 Link to User (traveller)
    travelerName: { type: String, required: true },
    title: { type: String, required: true },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    items: { type: [ItineraryItemSchema], default: [] },
    attractionIds: { type: [String], default: [] }, // 🔗 Linked attractions
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Itinerary', ItinerarySchema);

 
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AttractionSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    image: { type: String, default: '' },
    guideId: { type: String, required: true },
    availability: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Attraction', AttractionSchema);

 
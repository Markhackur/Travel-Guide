const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AvailabilitySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    slots: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const GuideSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4 },

    // 🔗 Link Guide profile to authenticated User
    userId: {
      type: String,
      required: true,
      unique: true,
    }, 

    name: { type: String, required: true },
    languages: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    expertise: { type: [String], default: [] },
    availability: { type: [AvailabilitySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guide', GuideSchema);

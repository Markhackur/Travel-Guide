const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ReviewSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4 },
    targetType: { type: String, enum: ['attraction', 'guide'], required: true },
    targetId: { type: String, required: true },
    reviewerId: { type: String, required: true }, // 🔗 Link to User (traveller)
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    reviewer: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true },
);

// Prevent duplicate reviews (same user reviewing same target)
ReviewSchema.index({ reviewerId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);

 
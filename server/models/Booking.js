const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4 },
    attractionId: { type: String, required: true },
    guideId: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    partySize: { type: Number, required: true },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Booking', BookingSchema);

 
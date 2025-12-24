const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ['guide', 'traveller'],
      required: true,
    },

    // Traveller specific
    preferredLocation: { type: String, default: '' },

    // Guide specific
    location: { type: String, default: '' },
    availability: [
      {
        date: String,
        slots: Number,
      },
    ],
  },
  { timestamps: true }
); 

// Hash password
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);

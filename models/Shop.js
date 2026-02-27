const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  operatingHours: {
    open: { type: String, default: '09:00 AM' },
    close: { type: String, default: '09:00 PM' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
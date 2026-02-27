const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true }, // e.g., "Premium Fade"
  price: { type: Number, required: true },
  durationMinutes: { type: Number, required: true }, // e.g., 30
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
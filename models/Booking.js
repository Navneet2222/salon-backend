const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  
  appointmentDate: { type: String, required: true }, // Format: YYYY-MM-DD
  timeSlot: { type: String, required: true }, // Format: HH:MM AM/PM
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in-chair', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  
  payment: {
    amount: { type: Number, required: true },
    status: { type: String, enum: ['unpaid', 'advance_paid', 'refunded'], default: 'unpaid' },
    transactionId: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
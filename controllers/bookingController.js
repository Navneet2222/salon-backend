const Booking = require('../models/Booking');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Service = require('../models/Service');
const twilio = require('twilio');

// Pulling secret keys from your .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio ONLY if you have added your keys (prevents crashes before you set it up)
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

exports.createBooking = async (req, res) => {
  try {
    const { shopId, serviceId, appointmentDate, timeSlot, advanceAmount } = req.body;
    const customerId = req.user.id;

    // 1. Save the booking in MongoDB
    const newBooking = new Booking({
      shopId,
      serviceId,
      customerId,
      appointmentDate,
      timeSlot,
      payment: { amount: advanceAmount, status: 'pending' },
      status: 'pending'
    });
    await newBooking.save();

    // 2. Fetch the data we need to write the SMS message
    const shop = await Shop.findById(shopId);
    const customer = await User.findById(customerId);
    const service = await Service.findById(serviceId);

    // 3. Fire off the SMS (If Twilio is connected)
    if (client && customer.phone) {
      // Twilio requires the country code. We assume India (+91) if it's missing.
      let phoneToText = customer.phone;
      if (!phoneToText.startsWith('+')) {
        phoneToText = '+91' + phoneToText; 
      }

      const message = `Booking Confirmed! Your ${service.name} at ${shop.name} is scheduled for ${timeSlot}.`;

      try {
        await client.messages.create({
          body: message,
          from: twilioPhone,
          to: phoneToText
        });
        console.log(`✅ SMS Sent Successfully to ${phoneToText}`);
      } catch (smsError) {
        console.error("❌ SMS Failed (Check Twilio logs):", smsError.message);
        // Notice we don't throw an error here! We don't want a failed SMS to cancel the actual haircut.
      }
    } else if (!client) {
        console.log("⚠️ Booking saved, but SMS skipped. Twilio keys are missing from .env!");
    }

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const { shopId } = req.query;
    // Get all bookings for today for this specific shop
    const today = new Date().toISOString().split('T')[0];
    const queue = await Booking.find({ shopId, appointmentDate: today })
      .populate('customerId', 'name phone')
      .populate('serviceId', 'name durationMinutes price');
      
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedBooking) return res.status(404).json({ message: "Booking not found." });
    
    res.json(updatedBooking);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};
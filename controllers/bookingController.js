const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customers only)
exports.createBooking = async (req, res) => {
  try {
    const { shopId, serviceId, appointmentDate, timeSlot, advanceAmount } = req.body;

    // 1. Double-check that the slot isn't already taken
    const existingBooking = await Booking.findOne({
      shopId,
      appointmentDate,
      timeSlot,
      status: { $in: ['pending', 'confirmed', 'in-chair'] } // Ignore cancelled/completed slots
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Sorry, this time slot was just taken!' });
    }

    // 2. Create the booking
    const newBooking = new Booking({
      customerId: req.user.userId,
      shopId,
      serviceId,
      appointmentDate,
      timeSlot,
      payment: {
        amount: advanceAmount,
        status: advanceAmount > 0 ? 'advance_paid' : 'unpaid' // Simplified for MVP
      }
    });

    await newBooking.save();

    // 3. THE MAGIC: Broadcast the new booking to the Shop Owner in real-time!
    const io = req.app.get('io');
    io.to(shopId.toString()).emit('newBooking', newBooking);

    res.status(201).json({
      message: 'Booking confirmed!',
      booking: newBooking
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while creating booking' });
  }
};

// @desc    Get today's live queue for a shop
// @route   GET /api/bookings/queue
// @access  Private (Shop Owners only)
exports.getShopQueue = async (req, res) => {
  try {
    // Note: In a real production app, you'd calculate "today's date" dynamically
    // For this MVP, we will just fetch all active bookings for this owner's shop
    const { shopId } = req.query; 

    const queue = await Booking.find({ 
      shopId,
      status: { $in: ['pending', 'confirmed', 'in-chair'] }
    }).populate('customerId', 'name phone').populate('serviceId', 'name durationMinutes');

    res.status(200).json(queue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while fetching queue' });
  }
};

// @desc    Update booking status (e.g., Mark as "In Chair" or "Completed")
// @route   PUT /api/bookings/:id/status
// @access  Private (Shop Owners only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'in-chair', 'completed', 'cancelled'
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndUpdate(
      bookingId, 
      { status }, 
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Broadcast the update so the customer app can see their status change!
    const io = req.app.get('io');
    io.to(booking.shopId.toString()).emit('queueUpdated', booking);

    res.status(200).json({ message: `Booking marked as ${status}`, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while updating status' });
  }
};
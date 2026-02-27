const Service = require('../models/Service');
const Shop = require('../models/Shop');

// @desc    Add a new service to the logged-in owner's shop
// @route   POST /api/services
// @access  Private (Shop Owners only)
exports.createService = async (req, res) => {
  try {
    // 1. Check if the user is an owner/admin
    if (req.user.role !== 'shop_owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only shop owners can add services.' });
    }

    // 2. Find the shop that belongs to this logged-in owner
    const shop = await Shop.findOne({ ownerId: req.user.userId });
    if (!shop) {
      return res.status(404).json({ message: 'You must create a shop profile first before adding services.' });
    }

    // 3. Extract the service details from the request
    const { name, price, durationMinutes } = req.body;

    // 4. Create the service and link it to the shop's ID
    const newService = new Service({
      shopId: shop._id,
      name,
      price,
      durationMinutes
    });

    await newService.save();

    res.status(201).json({
      message: 'Service added successfully!',
      service: newService
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while adding service' });
  }
};

// @desc    Get all services for a specific shop
// @route   GET /api/services/:shopId
// @access  Public (Customers need to see this without logging in)
exports.getServicesByShop = async (req, res) => {
  try {
    // Look up the shop ID from the URL parameters
    const services = await Service.find({ shopId: req.params.shopId, isActive: true });
    
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while fetching services' });
  }
};
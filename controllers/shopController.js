const Shop = require('../models/Shop');

// ==========================================
// SUPPLY SIDE (PRIVATE: ONLY SHOP OWNERS)
// ==========================================

// @desc    Create a new shop profile
// @route   POST /api/shops
// @access  Private
exports.createShop = async (req, res) => {
  try {
    if (req.user.role !== 'shop_owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only shop owners can create a shop.' });
    }

    const { name, address, location, operatingHours } = req.body;

    const existingShop = await Shop.findOne({ ownerId: req.user.userId });
    if (existingShop) {
      return res.status(400).json({ message: 'You already have a shop registered.' });
    }

    const newShop = new Shop({
      name,
      address,
      location,
      operatingHours,
      ownerId: req.user.userId
    });

    await newShop.save();

    res.status(201).json({
      message: 'Shop created successfully!',
      shop: newShop
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while creating shop' });
  }
};

// @desc    Get the logged-in owner's shop details
// @route   GET /api/shops/my-shop
// @access  Private
exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.userId });
    
    if (!shop) {
      return res.status(404).json({ message: 'No shop found for this user.' });
    }

    res.status(200).json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while fetching shop' });
  }
};


// ==========================================
// DEMAND SIDE (PUBLIC: ANY CUSTOMER)
// ==========================================

// @desc    Get all active shops (Marketplace Feed)
// @route   GET /api/shops
// @access  Public
exports.getAllShops = async (req, res) => {
  try {
    // We only want to show shops that are currently active/open
    const shops = await Shop.find({ isActive: true });
    res.status(200).json(shops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while fetching all shops' });
  }
};

// @desc    Get a single shop's details by its ID
// @route   GET /api/shops/:id
// @access  Public
exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    
    res.status(200).json(shop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while fetching shop details' });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const { name, address, bannerImage } = req.body;
    // Find the shop by its ID and ensure the logged-in owner is the one updating it
    const updatedShop = await Shop.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { name, address, bannerImage },
      { new: true }
    );
    
    if (!updatedShop) return res.status(404).json({ message: "Shop not found or unauthorized." });
    
    res.json(updatedShop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
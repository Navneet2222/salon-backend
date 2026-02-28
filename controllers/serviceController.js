const Service = require('../models/Service');
const Shop = require('../models/Shop');

exports.createService = async (req, res) => {
  try {
    // We grab exactly what the new frontend is sending us
    const { shopId, name, price, durationMinutes } = req.body;

    if (!shopId) {
      return res.status(400).json({ message: "Shop ID is missing. Please refresh your dashboard." });
    }

    // Verify the shop actually exists in the database
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "You must create a shop profile first before adding services." });
    }

    // Create and save the new service
    const newService = new Service({
      shopId,
      name,
      price,
      durationMinutes
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error("❌ Add Service Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getServicesByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const services = await Service.find({ shopId });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
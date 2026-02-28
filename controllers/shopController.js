const Shop = require('../models/Shop');

// 1. Create a new shop
exports.createShop = async (req, res) => {
  try {
    const { name, address, bannerImage } = req.body;

    // Create the shop, pulling the owner's ID from the secure login token
    const newShop = new Shop({
      name,
      address,
      bannerImage: bannerImage || "", // Save the image if it exists, otherwise leave blank
      ownerId: req.user.id 
    });

    await newShop.save();
    res.status(201).json(newShop);
  } catch (error) {
    console.error("❌ Shop Creation Error:", error);
    // THE FIX: We are now sending the EXACT database error back to your frontend popup!
    res.status(500).json({ message: `Database Error: ${error.message}` });
  }
};

// 2. Get the logged-in owner's shop
exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    if (!shop) return res.status(404).json({ message: "No shop found for this owner." });
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// 3. Get all shops (for the customer view)
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// 4. Update existing shop profile
exports.updateShop = async (req, res) => {
  try {
    const { name, address, bannerImage } = req.body;
    
    const updatedShop = await Shop.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { name, address, bannerImage },
      { new: true }
    );
    
    if (!updatedShop) return res.status(404).json({ message: "Shop not found or unauthorized." });
    
    res.json(updatedShop);
  } catch (error) {
    res.status(500).json({ message: `Update Error: ${error.message}` });
  }
};
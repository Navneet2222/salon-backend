require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Importing your models
const User = require('./models/User');
const Shop = require('./models/Shop');
const Service = require('./models/Service');

const seedDatabase = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!');

    console.log('🧹 Clearing old dummy data...');
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Service.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);

    // --- 1. CREATE 10 CUSTOMERS ---
    console.log('🧑‍🤝‍🧑 Creating 10 Customers...');
    const customers = [];
    for (let i = 1; i <= 10; i++) {
      customers.push({
        name: `Customer ${i}`,
        email: `customer${i}@placeholder.com`,
        phone: `999999990${i}`,
        password: passwordHash,
        role: 'customer'
      });
    }
    await User.insertMany(customers);

    // --- 2. CREATE 10 SHOP OWNERS ---
    console.log('💈 Creating 10 Shop Owners...');
    const owners = [];
    for (let i = 1; i <= 10; i++) {
      owners.push({
        name: `Owner ${i}`,
        email: `owner${i}@shop.com`,
        phone: `888888880${i}`,
        password: passwordHash,
        role: 'shop_owner'
      });
    }
    const createdOwners = await User.insertMany(owners);

    // --- 3. CREATE 10 SHOPS & SERVICES ---
    console.log('🏪 Building Shops and Menus...');
    const shopNames = [
      "The Fade Room", "Urban Grooming", "Style Lounge", "Classic Cuts", 
      "Scissors & Razors", "The Gentleman's Chair", "VIP Barbers", 
      "Fresh Fades", "Elite Studio", "The Local Barber"
    ];
    
    const locations = [
      "Indiranagar", "Koramangala", "Whitefield", "HSR Layout", 
      "Jayanagar", "JP Nagar", "Malleshwaram", "BTM Layout", 
      "Marathahalli", "Electronic City"
    ];

    for (let i = 0; i < 10; i++) {
      const shop = await Shop.create({
        name: shopNames[i],
        address: `Shop No. ${i + 1}, Main Road, ${locations[i]}, Bangalore`,
        ownerId: createdOwners[i]._id
      });

      await Service.insertMany([
        { name: "Premium Haircut", price: 250, durationMinutes: 30, shopId: shop._id },
        { name: "Beard Trim & Shape", price: 150, durationMinutes: 15, shopId: shop._id }
      ]);
    }

    console.log('🎉 Database successfully seeded! 10 Customers, 10 Owners, and 10 Shops created.');
    process.exit();

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
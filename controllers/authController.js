const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user (Customer or Shop Owner)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 2. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer', // Default to customer if no role is provided
      phone
    });

    await user.save();

    // 4. Generate the JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // 5. Send success response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Build the search query: check for phone FIRST, then email
    let searchQuery = {};
    if (phone) {
      searchQuery.phone = phone;
    } else if (email) {
      searchQuery.email = email;
    } else {
      return res.status(400).json({ message: "Please provide an email or phone number." });
    }

    // 1. Find the user in MongoDB
    const user = await User.findOne(searchQuery);
    if (!user) return res.status(400).json({ message: "Account not found. Please sign up!" });

    // 2. Check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password!" });

    // 3. Generate the keycard (Token)
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
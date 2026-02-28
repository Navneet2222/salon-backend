const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // 1. Prevent duplicates: Check if user already exists by email OR phone
    let userExists = null;
    if (email) userExists = await User.findOne({ email });
    if (!userExists && phone) userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: "An account with this email or phone number already exists. Please log in." });
    }

    // 2. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'customer' // Defaults to customer if not specified
    });

    await newUser.save();

    // 4. Generate the login token so they are instantly logged in after registering
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token, role: newUser.role, name: newUser.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Build the search query: check for phone OR email
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

    // 3. Generate the token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
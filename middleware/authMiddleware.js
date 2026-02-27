const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get token from the header (Format: "Bearer <token>")
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  // Extract the actual token string
  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the decoded user data (userId and role) to the request object
    req.user = decoded;
    
    // Move to the next function/controller
    next(); 
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

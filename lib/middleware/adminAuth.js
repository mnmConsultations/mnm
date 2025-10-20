const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to verify if the request is from an admin user
 * @param {Request} req - The request object
 * @returns {Object} - Returns user object if admin, throws error otherwise
 */
async function verifyAdminAuth(req) {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies.get('auth_token')?.value;
    
    // If not in cookie, check Authorization header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded._id).select('-password -salt');
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }

    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = { verifyAdminAuth };
// Also support ES6 default export for compatibility
module.exports.default = verifyAdminAuth;

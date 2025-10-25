const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Admin Authentication Middleware
 * 
 * Verifies that incoming requests are from authenticated admin users
 * Supports two authentication methods:
 * 1. HTTP-only cookies (auth_token)
 * 2. Bearer token in Authorization header
 * 
 * @param {Request} req - Next.js request object with cookies and headers
 * @returns {Promise<Object>} Authenticated admin user object (excluding password/salt)
 * @throws {Error} If token is missing, invalid, user not found, or user is not admin
 */
async function verifyAdminAuth(req) {
  try {
    let token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded._id).select('-password -salt');
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }

    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = { verifyAdminAuth };
module.exports.default = verifyAdminAuth;

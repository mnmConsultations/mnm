const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * User Authentication Middleware
 * 
 * Verifies that incoming requests are from authenticated users (any role)
 * Supports two authentication methods:
 * 1. HTTP-only cookies (auth_token)
 * 2. Bearer token in Authorization header
 * 
 * @param {Request} req - Next.js request object with cookies and headers
 * @returns {Promise<Object>} Authenticated user object (excluding password/salt)
 * @throws {Error} If token is missing, invalid, or user not found
 */
async function verifyUserAuth(req) {
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

    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Paywall Helper Function
 * 
 * Determines if a user has an active paid subscription plan
 * Used to restrict access to premium features (tasks, categories, etc.)
 * 
 * @param {Object} user - User object containing package and packageExpiresAt fields
 * @returns {boolean} True if user has active paid plan, false otherwise
 */
function hasActivePaidPlan(user) {
  if (user.package === 'free') {
    return false;
  }
  
  if (user.packageExpiresAt && new Date(user.packageExpiresAt) > new Date()) {
    return true;
  }
  
  return false;
}

module.exports = { verifyUserAuth, hasActivePaidPlan };
module.exports.default = { verifyUserAuth, hasActivePaidPlan };

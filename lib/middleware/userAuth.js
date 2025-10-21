const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to verify user authentication
 * @param {Request} req - The request object
 * @returns {Object} - Returns user object if authenticated, throws error otherwise
 */
async function verifyUserAuth(req) {
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

    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Check if user has an active paid plan
 * @param {Object} user - The user object
 * @returns {boolean} - Returns true if user has active paid plan
 */
function hasActivePaidPlan(user) {
  // If user is on free plan, return false
  if (user.package === 'free') {
    return false;
  }
  
  // If user has a paid plan, check if it's still active
  if (user.packageExpiresAt && new Date(user.packageExpiresAt) > new Date()) {
    return true;
  }
  
  return false;
}

module.exports = { verifyUserAuth, hasActivePaidPlan };
// Also support ES6 default export for compatibility
module.exports.default = { verifyUserAuth, hasActivePaidPlan };

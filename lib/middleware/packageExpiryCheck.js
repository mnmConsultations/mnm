const User = require('../models/user.model');

/**
 * Package Expiry Check Middleware for User Role
 * 
 * Automatically checks and updates user's package status based on expiration date
 * This middleware only acts on individual user requests - does NOT scan entire database
 * 
 * Flow:
 * 1. Verifies user is authenticated and has USER role (not admin)
 * 2. Checks if user has a paid package (basic or plus)
 * 3. Compares packageExpiresAt with current date
 * 4. If expired, downgrades to free plan and clears expiry dates
 * 5. Returns updated user object
 * 
 * Use Cases:
 * - User accessing tasks
 * - User making edits to progress
 * - Any user dashboard interaction requiring paid features
 * 
 * @param {Object} user - Authenticated user object from verifyUserAuth
 * @returns {Promise<Object>} Updated user object (with package downgraded if expired)
 * 
 * Example Usage:
 * ```javascript
 * const user = await verifyUserAuth(request);
 * const updatedUser = await checkAndUpdatePackageExpiry(user);
 * 
 * if (!hasActivePaidPlan(updatedUser)) {
 *   return NextResponse.json({ error: 'Paid plan required' }, { status: 403 });
 * }
 * ```
 */
async function checkAndUpdatePackageExpiry(user) {
  try {
    // Only check for users with USER role (skip admins)
    if (user.role !== 'user') {
      return user;
    }

    // Only process if user has a paid package
    if (user.package === 'free') {
      return user;
    }

    // Check if package has an expiry date
    if (!user.packageExpiresAt) {
      // If no expiry date but has paid package, let it through
      // This handles edge cases of packages without expiry
      return user;
    }

    const currentDate = new Date();
    const expiryDate = new Date(user.packageExpiresAt);

    // Check if package has expired
    if (currentDate > expiryDate) {
      console.log(`Package expired for user ${user.email}. Downgrading to free plan.`);
      
      // Update user's package to free
      user.package = 'free';
      user.packageActivatedAt = null;
      user.packageExpiresAt = null;
      
      // Save the updated user to database
      await user.save();
      
      console.log(`User ${user.email} downgraded to free plan successfully.`);
      
      // Return the updated user object
      return user;
    }

    // Package is still active, return user as-is
    return user;

  } catch (error) {
    console.error('Error in checkAndUpdatePackageExpiry:', error);
    // On error, return original user to prevent blocking legitimate requests
    // Log the error for monitoring
    return user;
  }
}

/**
 * Combined middleware: Verify auth and check package expiry
 * 
 * This is a convenience function that combines authentication verification
 * with package expiry checking in a single call
 * 
 * @param {Request} req - Next.js request object
 * @param {Function} verifyUserAuth - Auth verification function
 * @returns {Promise<Object>} Authenticated and package-validated user object
 * 
 * Example Usage:
 * ```javascript
 * const user = await verifyAuthAndCheckExpiry(request, verifyUserAuth);
 * ```
 */
async function verifyAuthAndCheckExpiry(req, verifyUserAuth) {
  // First verify authentication
  const user = await verifyUserAuth(req);
  
  // Then check and update package expiry if needed
  const updatedUser = await checkAndUpdatePackageExpiry(user);
  
  return updatedUser;
}

module.exports = { 
  checkAndUpdatePackageExpiry,
  verifyAuthAndCheckExpiry
};

module.exports.default = { 
  checkAndUpdatePackageExpiry,
  verifyAuthAndCheckExpiry
};

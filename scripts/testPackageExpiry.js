/**
 * Package Expiry Middleware Test Suite
 * 
 * This script tests the package expiry middleware functionality
 * Run this after setting up test users with different package states
 * 
 * Usage: node scripts/testPackageExpiry.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../lib/models/user.model');
const { checkAndUpdatePackageExpiry } = require('../lib/middleware/packageExpiryCheck');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Test Case 1: User with expired package
 */
async function testExpiredPackage() {
  console.log('\n--- Test 1: Expired Package Downgrade ---');
  
  try {
    // Create a test user with expired package
    const testUser = new User({
      firstName: 'Expired',
      lastName: 'User',
      email: 'expired.test@example.com',
      phoneNumber: '9876543210',
      salt: 'testsalt',
      password: 'testpassword',
      role: 'user',
      package: 'basic',
      packageActivatedAt: new Date('2025-09-01'),
      packageExpiresAt: new Date('2025-10-01') // Expired
    });

    await testUser.save();
    console.log('✓ Created test user with expired package');
    console.log(`  Package: ${testUser.package}`);
    console.log(`  Expires: ${testUser.packageExpiresAt}`);

    // Run middleware
    const updatedUser = await checkAndUpdatePackageExpiry(testUser);
    
    // Verify downgrade
    if (updatedUser.package === 'free' && !updatedUser.packageExpiresAt) {
      console.log('✓ Middleware correctly downgraded expired package to free');
    } else {
      console.log('✗ Middleware did not downgrade package correctly');
      console.log(`  Current package: ${updatedUser.package}`);
    }

    // Clean up
    await User.deleteOne({ email: 'expired.test@example.com' });
    console.log('✓ Cleaned up test user');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

/**
 * Test Case 2: User with active package
 */
async function testActivePackage() {
  console.log('\n--- Test 2: Active Package (No Change) ---');
  
  try {
    // Create a test user with active package
    const testUser = new User({
      firstName: 'Active',
      lastName: 'User',
      email: 'active.test@example.com',
      phoneNumber: '9876543211',
      salt: 'testsalt',
      password: 'testpassword',
      role: 'user',
      package: 'plus',
      packageActivatedAt: new Date('2025-10-01'),
      packageExpiresAt: new Date('2025-11-30') // Active
    });

    await testUser.save();
    console.log('✓ Created test user with active package');
    console.log(`  Package: ${testUser.package}`);
    console.log(`  Expires: ${testUser.packageExpiresAt}`);

    // Run middleware
    const updatedUser = await checkAndUpdatePackageExpiry(testUser);
    
    // Verify no change
    if (updatedUser.package === 'plus' && updatedUser.packageExpiresAt) {
      console.log('✓ Middleware correctly kept active package unchanged');
    } else {
      console.log('✗ Middleware incorrectly modified active package');
      console.log(`  Current package: ${updatedUser.package}`);
    }

    // Clean up
    await User.deleteOne({ email: 'active.test@example.com' });
    console.log('✓ Cleaned up test user');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

/**
 * Test Case 3: Admin user (should skip check)
 */
async function testAdminUser() {
  console.log('\n--- Test 3: Admin User (Skip Check) ---');
  
  try {
    // Create a test admin with expired package
    const testAdmin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin.test@example.com',
      phoneNumber: '9876543212',
      salt: 'testsalt',
      password: 'testpassword',
      role: 'admin',
      package: 'basic',
      packageActivatedAt: new Date('2025-09-01'),
      packageExpiresAt: new Date('2025-10-01') // Expired but admin
    });

    await testAdmin.save();
    console.log('✓ Created test admin with expired package');
    console.log(`  Role: ${testAdmin.role}`);
    console.log(`  Package: ${testAdmin.package}`);

    // Run middleware
    const updatedAdmin = await checkAndUpdatePackageExpiry(testAdmin);
    
    // Verify admin was skipped (package unchanged)
    if (updatedAdmin.package === 'basic' && updatedAdmin.role === 'admin') {
      console.log('✓ Middleware correctly skipped admin user');
    } else {
      console.log('✗ Middleware incorrectly modified admin user');
      console.log(`  Current package: ${updatedAdmin.package}`);
    }

    // Clean up
    await User.deleteOne({ email: 'admin.test@example.com' });
    console.log('✓ Cleaned up test admin');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

/**
 * Test Case 4: Free user (should skip check)
 */
async function testFreeUser() {
  console.log('\n--- Test 4: Free User (Skip Check) ---');
  
  try {
    // Create a test user with free package
    const testUser = new User({
      firstName: 'Free',
      lastName: 'User',
      email: 'free.test@example.com',
      phoneNumber: '9876543213',
      salt: 'testsalt',
      password: 'testpassword',
      role: 'user',
      package: 'free'
    });

    await testUser.save();
    console.log('✓ Created test user with free package');
    console.log(`  Package: ${testUser.package}`);

    // Run middleware
    const updatedUser = await checkAndUpdatePackageExpiry(testUser);
    
    // Verify free user was skipped
    if (updatedUser.package === 'free') {
      console.log('✓ Middleware correctly skipped free user');
    } else {
      console.log('✗ Middleware incorrectly modified free user');
      console.log(`  Current package: ${updatedUser.package}`);
    }

    // Clean up
    await User.deleteOne({ email: 'free.test@example.com' });
    console.log('✓ Cleaned up test user');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

/**
 * Test Case 5: Package expiring today (edge case)
 */
async function testExpiringToday() {
  console.log('\n--- Test 5: Package Expiring Today (Edge Case) ---');
  
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Create a test user with package expiring today
    const testUser = new User({
      firstName: 'Expiring',
      lastName: 'Today',
      email: 'expiring.test@example.com',
      phoneNumber: '9876543214',
      salt: 'testsalt',
      password: 'testpassword',
      role: 'user',
      package: 'basic',
      packageActivatedAt: new Date('2025-09-25'),
      packageExpiresAt: today
    });

    await testUser.save();
    console.log('✓ Created test user with package expiring today');
    console.log(`  Package: ${testUser.package}`);
    console.log(`  Expires: ${testUser.packageExpiresAt}`);

    // Run middleware
    const updatedUser = await checkAndUpdatePackageExpiry(testUser);
    
    // Check result (should still be active if expiry is later today)
    console.log(`  Result: Package is "${updatedUser.package}"`);
    if (new Date() < today) {
      console.log('  Note: Package expires later today, should still be active');
    }

    // Clean up
    await User.deleteOne({ email: 'expiring.test@example.com' });
    console.log('✓ Cleaned up test user');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('========================================');
  console.log('Package Expiry Middleware Test Suite');
  console.log('========================================');
  
  try {
    await connectDB();
    
    await testExpiredPackage();
    await testActivePackage();
    await testAdminUser();
    await testFreeUser();
    await testExpiringToday();
    
    console.log('\n========================================');
    console.log('All tests completed!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run tests
runAllTests();

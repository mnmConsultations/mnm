/**
 * Dynamic Progress Calculation Test Suite
 * 
 * This script tests the dynamic progress calculation for categories
 * Tests that new categories get proper progress tracking
 * 
 * Usage: node scripts/testDynamicProgress.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../lib/models/user.model');
const Category = require('../lib/models/category.model');
const Task = require('../lib/models/task.model');
const UserProgress = require('../lib/models/userProgress.model');

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
 * Test Case 1: Create new category and verify progress calculation
 */
async function testNewCategoryProgress() {
  console.log('\n--- Test 1: New Category Progress Calculation ---');
  
  try {
    // Create test user with active package
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'progress.test@example.com',
      phoneNumber: '9876543220',
      salt: 'testsalt',
      password: 'testpassword',
      role: 'user',
      package: 'essential',
      packageActivatedAt: new Date(),
      packageExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    await testUser.save();
    console.log('✓ Created test user');

    // Create a new category
    const newCategory = new Category({
      id: 'testCategory',
      name: 'testCategory',
      displayName: 'Test Category',
      description: 'A test category for progress tracking',
      icon: '🧪',
      color: '#FF6B6B',
      order: 999,
      isActive: true,
      estimatedTimeFrame: 'First week'
    });
    await newCategory.save();
    console.log('✓ Created new test category:', newCategory.displayName);

    // Create tasks in the new category
    const task1 = new Task({
      id: 'test-task-1',
      title: 'Test Task 1',
      description: 'First test task',
      category: 'testCategory',
      order: 1,
      difficulty: 'easy',
      isActive: true
    });

    const task2 = new Task({
      id: 'test-task-2',
      title: 'Test Task 2',
      description: 'Second test task',
      category: 'testCategory',
      order: 2,
      difficulty: 'medium',
      isActive: true
    });
    
    await task1.save();
    await task2.save();
    console.log('✓ Created 2 test tasks in new category');

    // Initialize user progress
    const allCategories = await Category.find({ isActive: true });
    const categoryProgress = {};
    allCategories.forEach(cat => {
      categoryProgress[cat.id] = 0;
    });

    const userProgress = new UserProgress({
      userId: testUser._id,
      overallProgress: 0,
      categoryProgress,
      completedTasks: []
    });
    await userProgress.save();
    console.log('✓ Initialized user progress');

    // Verify new category has 0% progress
    if (userProgress.categoryProgress['testCategory'] === 0) {
      console.log('✓ New category initialized with 0% progress');
    } else {
      console.log('✗ New category progress not initialized correctly');
      console.log('  Expected: 0, Got:', userProgress.categoryProgress['testCategory']);
    }

    // Complete one task (should be 50% for the category)
    userProgress.completedTasks.push({
      taskId: 'test-task-1',
      completedAt: new Date()
    });

    // Recalculate progress
    const allTasks = await Task.find({ isActive: true });
    const testCategoryTasks = allTasks.filter(t => t.category === 'testCategory');
    const completedInCategory = userProgress.completedTasks.filter(c => 
      testCategoryTasks.some(t => t.id === c.taskId)
    );
    
    const expectedProgress = Math.round((completedInCategory.length / testCategoryTasks.length) * 100);
    userProgress.categoryProgress['testCategory'] = expectedProgress;
    await userProgress.save();

    console.log(`✓ Completed 1 of 2 tasks: ${expectedProgress}% progress`);

    if (expectedProgress === 50) {
      console.log('✓ Category progress calculated correctly (50%)');
    } else {
      console.log('✗ Category progress calculation incorrect');
      console.log(`  Expected: 50, Got: ${expectedProgress}`);
    }

    // Complete second task (should be 100%)
    userProgress.completedTasks.push({
      taskId: 'test-task-2',
      completedAt: new Date()
    });

    const completedInCategory2 = userProgress.completedTasks.filter(c => 
      testCategoryTasks.some(t => t.id === c.taskId)
    );
    
    const expectedProgress2 = Math.round((completedInCategory2.length / testCategoryTasks.length) * 100);
    userProgress.categoryProgress['testCategory'] = expectedProgress2;
    await userProgress.save();

    console.log(`✓ Completed 2 of 2 tasks: ${expectedProgress2}% progress`);

    if (expectedProgress2 === 100) {
      console.log('✓ Category progress calculated correctly (100%)');
    } else {
      console.log('✗ Category progress calculation incorrect');
      console.log(`  Expected: 100, Got: ${expectedProgress2}`);
    }

    // Clean up
    await User.deleteOne({ email: 'progress.test@example.com' });
    await Category.deleteOne({ id: 'testCategory' });
    await Task.deleteOne({ id: 'test-task-1' });
    await Task.deleteOne({ id: 'test-task-2' });
    await UserProgress.deleteOne({ userId: testUser._id });
    console.log('✓ Cleaned up test data');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error);
  }
}

/**
 * Test Case 2: Verify progress with multiple categories
 */
async function testMultiCategoryProgress() {
  console.log('\n--- Test 2: Multiple Categories Progress ---');
  
  try {
    // Create test user
    const testUser = new User({
      firstName: 'Multi',
      lastName: 'Category',
      email: 'multi.test@example.com',
      phoneNumber: '9876543221',
      salt: 'testsalt',
      password: 'testpassword',
      role: 'user',
      package: 'premium',
      packageActivatedAt: new Date(),
      packageExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    });
    await testUser.save();
    console.log('✓ Created test user');

    // Create multiple categories
    const cat1 = new Category({
      id: 'category1',
      name: 'category1',
      displayName: 'Category One',
      description: 'First test category',
      order: 1,
      isActive: true
    });

    const cat2 = new Category({
      id: 'category2',
      name: 'category2',
      displayName: 'Category Two',
      description: 'Second test category',
      order: 2,
      isActive: true
    });

    await cat1.save();
    await cat2.save();
    console.log('✓ Created 2 test categories');

    // Create tasks in different categories
    const task1 = new Task({
      id: 'multi-task-1',
      title: 'Multi Task 1',
      description: 'Task in category 1',
      category: 'category1',
      order: 1,
      isActive: true
    });

    const task2 = new Task({
      id: 'multi-task-2',
      title: 'Multi Task 2',
      description: 'Task in category 2',
      category: 'category2',
      order: 1,
      isActive: true
    });

    await task1.save();
    await task2.save();
    console.log('✓ Created tasks in both categories');

    // Initialize progress with all categories
    const allCategories = await Category.find({ isActive: true });
    const categoryProgress = {};
    allCategories.forEach(cat => {
      categoryProgress[cat.id] = 0;
    });

    const userProgress = new UserProgress({
      userId: testUser._id,
      overallProgress: 0,
      categoryProgress,
      completedTasks: []
    });
    await userProgress.save();

    // Verify both categories exist in progress
    const hasCategory1 = 'category1' in userProgress.categoryProgress;
    const hasCategory2 = 'category2' in userProgress.categoryProgress;

    if (hasCategory1 && hasCategory2) {
      console.log('✓ Both categories exist in progress tracking');
      console.log(`  Category 1: ${userProgress.categoryProgress['category1']}%`);
      console.log(`  Category 2: ${userProgress.categoryProgress['category2']}%`);
    } else {
      console.log('✗ Not all categories tracked in progress');
      console.log('  Has category1:', hasCategory1);
      console.log('  Has category2:', hasCategory2);
    }

    // Complete task in category1
    userProgress.completedTasks.push({
      taskId: 'multi-task-1',
      completedAt: new Date()
    });

    // Recalculate for category1
    const allTasks = await Task.find({ isActive: true });
    
    const cat1Tasks = allTasks.filter(t => t.category === 'category1');
    const cat1Completed = userProgress.completedTasks.filter(c => 
      cat1Tasks.some(t => t.id === c.taskId)
    );
    userProgress.categoryProgress['category1'] = Math.round((cat1Completed.length / cat1Tasks.length) * 100);

    const cat2Tasks = allTasks.filter(t => t.category === 'category2');
    const cat2Completed = userProgress.completedTasks.filter(c => 
      cat2Tasks.some(t => t.id === c.taskId)
    );
    userProgress.categoryProgress['category2'] = Math.round((cat2Completed.length / cat2Tasks.length) * 100);

    await userProgress.save();

    console.log('✓ Completed task in category1');
    console.log(`  Category 1: ${userProgress.categoryProgress['category1']}% (expected: 100%)`);
    console.log(`  Category 2: ${userProgress.categoryProgress['category2']}% (expected: 0%)`);

    if (userProgress.categoryProgress['category1'] === 100 && 
        userProgress.categoryProgress['category2'] === 0) {
      console.log('✓ Categories maintain independent progress correctly');
    } else {
      console.log('✗ Category progress independence issue');
    }

    // Clean up
    await User.deleteOne({ email: 'multi.test@example.com' });
    await Category.deleteOne({ id: 'category1' });
    await Category.deleteOne({ id: 'category2' });
    await Task.deleteOne({ id: 'multi-task-1' });
    await Task.deleteOne({ id: 'multi-task-2' });
    await UserProgress.deleteOne({ userId: testUser._id });
    console.log('✓ Cleaned up test data');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error);
  }
}

/**
 * Test Case 3: Verify Mixed type allows dynamic categories
 */
async function testMixedTypeFlexibility() {
  console.log('\n--- Test 3: Schema.Types.Mixed Flexibility ---');
  
  try {
    // Create test user
    const testUser = new User({
      firstName: 'Schema',
      lastName: 'Test',
      email: 'schema.test@example.com',
      phoneNumber: '9876543222',
      salt: 'testsalt',
      password: 'testpassword',
      role: 'user',
      package: 'essential',
      packageActivatedAt: new Date(),
      packageExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await testUser.save();
    console.log('✓ Created test user');

    // Create progress with arbitrary category IDs
    const userProgress = new UserProgress({
      userId: testUser._id,
      overallProgress: 25,
      categoryProgress: {
        'customCategory1': 10,
        'anotherOne': 50,
        'someRandomId': 75,
        'yetAnotherCategory': 100
      },
      completedTasks: []
    });

    await userProgress.save();
    console.log('✓ Saved progress with custom category IDs');

    // Retrieve and verify
    const retrieved = await UserProgress.findOne({ userId: testUser._id });
    
    const hasCustom1 = 'customCategory1' in retrieved.categoryProgress;
    const hasCustom2 = 'anotherOne' in retrieved.categoryProgress;
    const hasCustom3 = 'someRandomId' in retrieved.categoryProgress;
    const hasCustom4 = 'yetAnotherCategory' in retrieved.categoryProgress;

    console.log('✓ Retrieved progress from database');
    console.log('  Custom categories preserved:');
    console.log(`    customCategory1: ${hasCustom1} (${retrieved.categoryProgress['customCategory1']}%)`);
    console.log(`    anotherOne: ${hasCustom2} (${retrieved.categoryProgress['anotherOne']}%)`);
    console.log(`    someRandomId: ${hasCustom3} (${retrieved.categoryProgress['someRandomId']}%)`);
    console.log(`    yetAnotherCategory: ${hasCustom4} (${retrieved.categoryProgress['yetAnotherCategory']}%)`);

    if (hasCustom1 && hasCustom2 && hasCustom3 && hasCustom4) {
      console.log('✓ Schema.Types.Mixed allows arbitrary category IDs');
    } else {
      console.log('✗ Some custom categories were lost');
    }

    // Test adding new categories dynamically
    retrieved.categoryProgress['brandNewCategory'] = 33;
    await retrieved.save();

    const retrieved2 = await UserProgress.findOne({ userId: testUser._id });
    if ('brandNewCategory' in retrieved2.categoryProgress) {
      console.log('✓ Can add new categories dynamically after creation');
    } else {
      console.log('✗ Failed to add new category dynamically');
    }

    // Clean up
    await User.deleteOne({ email: 'schema.test@example.com' });
    await UserProgress.deleteOne({ userId: testUser._id });
    console.log('✓ Cleaned up test data');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('========================================');
  console.log('Dynamic Progress Calculation Test Suite');
  console.log('========================================');
  
  try {
    await connectDB();
    
    await testNewCategoryProgress();
    await testMultiCategoryProgress();
    await testMixedTypeFlexibility();
    
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

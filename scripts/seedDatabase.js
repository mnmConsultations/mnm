/**
 * Database Seeding Script
 * 
 * Populates database with initial categories and tasks
 * Used for development setup and testing
 * 
 * Features:
 * - Loads environment variables from .env file
 * - Connects to MongoDB
 * - Clears existing data
 * - Seeds categories and tasks
 * - Provides detailed console output
 * 
 * Seed Data Source:
 * - Categories and tasks from lib/data/seedData.js
 * - Includes all relocation journey phases
 * - Pre-configured task content
 * 
 * Execution Flow:
 * 1. Load .env variables manually (for script context)
 * 2. Connect to database using connectDB utility
 * 3. Clear existing categories and tasks (deleteMany)
 * 4. Insert seed categories
 * 5. Insert seed tasks
 * 6. Display summary grouped by category
 * 7. Exit process
 * 
 * Console Output:
 * - Progress indicators (🌱 ✓ 📁 📋 ✅ ❌)
 * - Detailed list of created items
 * - Summary statistics
 * - Error messages on failure
 * 
 * Usage:
 * node scripts/seedDatabase.js
 * 
 * Environment:
 * - Requires MONGODB_URI in .env file
 * - Exits with code 0 on success
 * - Exits with code 1 on error
 * 
 * Warning:
 * - DESTRUCTIVE: Clears all existing categories and tasks
 * - Only use in development/staging environments
 * - DO NOT run on production database
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  });
}

// Import models and seed data
const connectDB = require('../lib/utils/db');
const Category = require('../lib/models/category.model');
const Task = require('../lib/models/task.model');
const seedData = require('../lib/data/seedData');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();
    console.log('✓ Connected to database\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    console.log('  ✓ Cleared categories');
    await Task.deleteMany({});
    console.log('  ✓ Cleared tasks\n');

    // Seed categories and create a mapping from old string IDs to MongoDB _ids
    console.log('📁 Seeding categories...');
    const categoryIdMap = {};
    const createdCategories = [];
    
    for (const categoryData of seedData.categories) {
      const { id, ...categoryFields } = categoryData; // Remove custom 'id' field
      const category = await Category.create(categoryFields);
      categoryIdMap[id] = category._id; // Map old ID to new MongoDB _id
      createdCategories.push(category);
      console.log(`  ✓ Created: ${category.displayName} (${id} → ${category._id})`);
    }
    console.log('');

    // Seed tasks, replacing category string IDs with MongoDB ObjectIds
    console.log('📋 Seeding tasks...');
    const createdTasks = [];
    
    for (const taskData of seedData.tasks) {
      const { id, category, ...taskFields } = taskData; // Remove custom 'id', extract category
      const taskWithObjectId = {
        ...taskFields,
        category: categoryIdMap[category] // Replace category string ID with ObjectId
      };
      const task = await Task.create(taskWithObjectId);
      createdTasks.push(task);
    }
    
    console.log(`  ✓ Created ${createdTasks.length} tasks`);
    
    // Group tasks by category for display
    const tasksByCategory = {};
    for (const task of createdTasks) {
      await task.populate('category', 'displayName');
      const categoryName = task.category.displayName;
      if (!tasksByCategory[categoryName]) {
        tasksByCategory[categoryName] = [];
      }
      tasksByCategory[categoryName].push(task.title);
    }

    Object.keys(tasksByCategory).forEach(categoryName => {
      console.log(`\n  ${categoryName}:`);
      tasksByCategory[categoryName].forEach(title => {
        console.log(`    - ${title}`);
      });
    });

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  • Categories: ${createdCategories.length}`);
    console.log(`  • Tasks: ${createdTasks.length}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

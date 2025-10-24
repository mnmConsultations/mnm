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

    // Seed categories
    console.log('📁 Seeding categories...');
    const categories = await Category.insertMany(seedData.categories);
    console.log(`  ✓ Created ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`    - ${cat.displayName} (${cat.id})`);
    });
    console.log('');

    // Seed tasks
    console.log('📋 Seeding tasks...');
    const tasks = await Task.insertMany(seedData.tasks);
    console.log(`  ✓ Created ${tasks.length} tasks:`);
    
    // Group tasks by category for display
    const tasksByCategory = tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task.title);
      return acc;
    }, {});

    Object.keys(tasksByCategory).forEach(category => {
      console.log(`\n  ${category}:`);
      tasksByCategory[category].forEach(title => {
        console.log(`    - ${title}`);
      });
    });

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  • Categories: ${categories.length}`);
    console.log(`  • Tasks: ${tasks.length}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

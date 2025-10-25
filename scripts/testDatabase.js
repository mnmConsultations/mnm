const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
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

const connectDB = require('../lib/utils/db');
const Category = require('../lib/models/category.model');
const Task = require('../lib/models/task.model');

async function testDatabase() {
  try {
    console.log('🔍 Testing database structure...\n');
    
    await connectDB();
    console.log('✓ Connected to database\n');
    
    // Check categories
    const categories = await Category.find().limit(2);
    console.log('📁 Sample Categories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.displayName}:`);
      console.log(`    _id: ${cat._id}`);
      console.log(`    name: ${cat.name}`);
      console.log(`    id field: ${cat.id || 'NOT PRESENT ✓'}\n`);
    });
    
    // Check tasks
    const tasks = await Task.find().limit(2).populate('category');
    console.log('📋 Sample Tasks:');
    tasks.forEach(task => {
      console.log(`  - ${task.title}:`);
      console.log(`    _id: ${task._id}`);
      console.log(`    id field: ${task.id || 'NOT PRESENT ✓'}`);
      console.log(`    category (ObjectId): ${task.category._id}`);
      console.log(`    category (populated): ${task.category.displayName}\n`);
    });
    
    // Check task grouping by category
    const allTasks = await Task.find().populate('category');
    const grouped = allTasks.reduce((acc, task) => {
      const catId = task.category._id.toString();
      if (!acc[catId]) acc[catId] = [];
      acc[catId].push(task.title);
      return acc;
    }, {});
    
    console.log('📊 Tasks grouped by category _id:');
    Object.entries(grouped).forEach(([catId, taskTitles]) => {
      const cat = categories.find(c => c._id.toString() === catId);
      console.log(`  ${catId} (${cat ? cat.displayName : 'unknown'}):`);
      console.log(`    Count: ${taskTitles.length}`);
      console.log(`    Tasks: ${taskTitles.slice(0, 3).join(', ')}${taskTitles.length > 3 ? '...' : ''}\n`);
    });
    
    console.log('✅ Database structure test complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDatabase();

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
const UserProgress = require('../lib/models/userProgress.model');

async function cleanUserProgress() {
  try {
    console.log('🧹 Cleaning user progress data...\n');
    
    await connectDB();
    console.log('✓ Connected to database\n');
    
    // Clear all user progress records (they'll be recreated on next login)
    const result = await UserProgress.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} user progress records\n`);
    
    console.log('✅ User progress cleanup completed!\n');
    console.log('Note: User progress will be automatically recreated when users next access their dashboard.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning user progress:', error);
    process.exit(1);
  }
}

cleanUserProgress();

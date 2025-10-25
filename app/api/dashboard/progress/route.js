import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import UserProgress from '@/lib/models/userProgress.model';
import User from '@/lib/models/user.model';
import Task from '@/lib/models/task.model';
import Category from '@/lib/models/category.model';
import jwt from 'jsonwebtoken';
import { checkAndUpdatePackageExpiry } from '@/lib/middleware/packageExpiryCheck';
import { hasActivePaidPlan } from '@/lib/middleware/userAuth';

/**
 * User Progress API Endpoints
 * 
 * Manages user task completion tracking and progress calculations
 * Tracks overall progress and per-category progress
 * 
 * GET: Fetches user's current progress (creates default if none exists)
 * PUT: Updates task completion status and recalculates all progress percentages
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

/**
 * Extract and Verify User from JWT Token
 * 
 * Checks Authorization header first (Bearer token), falls back to cookies
 * Verifies JWT signature and fetches user from database
 * 
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} User object or null if invalid/missing token
 */
async function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = request.cookies.get('token')?.value;
    }
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded._id);
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

/**
 * Get User Progress
 * GET /api/dashboard/progress
 * 
 * Returns user's task completion progress including:
 * - Overall progress percentage
 * - Per-category progress (uses category _id as string keys)
 * - List of completed tasks with timestamps
 * - Package details
 * 
 * Auto-creates progress record if user doesn't have one yet
 */
export async function GET(request) {
  try {
    let user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check and update package expiry (only for users, not admins)
    user = await checkAndUpdatePackageExpiry(user);

    await connectDB();
    
    let userProgress = await UserProgress.findOne({ userId: user._id });
    
    if (!userProgress) {
      // Get all active categories to initialize progress
      const categories = await Category.find({ isActive: true });
      const categoryProgress = {};
      categories.forEach(cat => {
        categoryProgress[cat._id.toString()] = 0;
      });
      
      userProgress = new UserProgress({
        userId: user._id,
        overallProgress: 0,
        categoryProgress,
        completedTasks: [],
        packageType: 'basic',
        packageDetails: {
          name: 'Basic Package',
          description: 'Essential relocation services',
          features: ['Airport pickup', 'Basic orientation', 'Document assistance'],
          price: 299
        }
      });
      await userProgress.save();
    } else {
      // Recalculate progress to ensure it's up-to-date with current tasks and categories
      const allTasks = await Task.find({ isActive: true });
      const categories = await Category.find({ isActive: true });
      
      // Calculate overall progress
      const totalTasks = allTasks.length;
      const completedCount = userProgress.completedTasks.length;
      userProgress.overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
      
      // Calculate progress for each category using _id
      const categoryProgress = {};
      categories.forEach(category => {
        const categoryTasks = allTasks.filter(task => 
          task.category.toString() === category._id.toString()
        );
        const completedCategoryTasks = userProgress.completedTasks.filter(completed => {
          // Safely convert taskId to string (handles both ObjectId and string)
          const completedTaskIdStr = completed.taskId?.toString ? completed.taskId.toString() : String(completed.taskId);
          return categoryTasks.some(task => task._id.toString() === completedTaskIdStr);
        });
        
        categoryProgress[category._id.toString()] = categoryTasks.length > 0 ? 
          Math.round((completedCategoryTasks.length / categoryTasks.length) * 100) : 0;
      });
      
      userProgress.categoryProgress = categoryProgress;
      await userProgress.save();
    }

    return NextResponse.json({
      success: true,
      data: userProgress
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update Task Completion Status
 * PUT /api/dashboard/progress
 * 
 * Marks a task as completed or uncompleted
 * Automatically recalculates all progress percentages after update
 * 
 * Request body: { taskId: string, completed: boolean }
 * 
 * Progress Calculation:
 * - Overall: (completed tasks / total tasks) * 100
 * - Per-category: (completed tasks in category / total tasks in category) * 100
 * 
 * Returns updated progress object with new percentages
 */
export async function PUT(request) {
  try {
    let user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check and update package expiry (only for users, not admins)
    user = await checkAndUpdatePackageExpiry(user);
    
    // Check if user still has active paid plan after expiry check
    if (!hasActivePaidPlan(user)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access denied. Your plan has expired. Please upgrade to continue.',
          requiresPaidPlan: true 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { taskId, completed } = body;

    if (!taskId || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Task ID and completion status are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // SECURITY FIX: Verify taskId exists and is active before allowing update
    const task = await Task.findById(taskId);
    
    if (!task || !task.isActive) {
      return NextResponse.json(
        { error: 'Invalid task ID or task is not active' },
        { status: 400 }
      );
    }
    
    let userProgress = await UserProgress.findOne({ userId: user._id });
    
    if (!userProgress) {
      return NextResponse.json(
        { error: 'User progress not found' },
        { status: 404 }
      );
    }
    
    if (completed) {
      const existingTask = userProgress.completedTasks.find(task => {
        const taskIdStr = task.taskId?.toString ? task.taskId.toString() : String(task.taskId);
        return taskIdStr === taskId.toString();
      });
      if (!existingTask) {
        userProgress.completedTasks.push({
          taskId: task._id,
          completedAt: new Date()
        });
      }
    } else {
      userProgress.completedTasks = userProgress.completedTasks.filter(task => {
        const taskIdStr = task.taskId?.toString ? task.taskId.toString() : String(task.taskId);
        return taskIdStr !== taskId.toString();
      });
    }

    // Recalculate overall progress
    const allTasks = await Task.find({ isActive: true });
    const totalTasks = allTasks.length;
    const completedCount = userProgress.completedTasks.length;
    userProgress.overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Dynamically calculate progress for all active categories using _id
    const categories = await Category.find({ isActive: true });
    const categoryProgress = {};
    
    for (const category of categories) {
      const categoryTasks = allTasks.filter(task => 
        task.category.toString() === category._id.toString()
      );
      const completedCategoryTasks = userProgress.completedTasks.filter(completed => {
        const completedTaskIdStr = completed.taskId?.toString ? completed.taskId.toString() : String(completed.taskId);
        return categoryTasks.some(task => task._id.toString() === completedTaskIdStr);
      });
      
      categoryProgress[category._id.toString()] = categoryTasks.length > 0 ? 
        Math.round((completedCategoryTasks.length / categoryTasks.length) * 100) : 0;
    }
    
    userProgress.categoryProgress = categoryProgress;
    await userProgress.save();

    return NextResponse.json({
      success: true,
      data: userProgress
    });

  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
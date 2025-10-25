import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import UserProgress from '@/lib/models/userProgress.model';
import User from '@/lib/models/user.model';
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
 * - Per-category progress (beforeArrival, uponArrival, firstWeeks, ongoing)
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
      userProgress = new UserProgress({
        userId: user._id,
        overallProgress: 0,
        categoryProgress: {
          beforeArrival: 0,
          uponArrival: 0,
          firstWeeks: 0,
          ongoing: 0
        },
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
    
    let userProgress = await UserProgress.findOne({ userId: user._id });
    
    if (!userProgress) {
      return NextResponse.json(
        { error: 'User progress not found' },
        { status: 404 }
      );
    }

    const Task = require('@/lib/models/task.model');
    
    if (completed) {
      const existingTask = userProgress.completedTasks.find(task => task.taskId === taskId);
      if (!existingTask) {
        userProgress.completedTasks.push({
          taskId,
          completedAt: new Date()
        });
      }
    } else {
      userProgress.completedTasks = userProgress.completedTasks.filter(
        task => task.taskId !== taskId
      );
    }

    const allTasks = await Task.find({ isActive: true });
    const totalTasks = allTasks.length;
    const completedCount = userProgress.completedTasks.length;
    userProgress.overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    const categories = ['beforeArrival', 'uponArrival', 'firstWeeks', 'ongoing'];
    
    for (const category of categories) {
      const categoryTasks = allTasks.filter(task => task.category === category);
      const completedCategoryTasks = userProgress.completedTasks.filter(completed => 
        categoryTasks.some(task => task.id === completed.taskId)
      );
      
      const categoryProgress = categoryTasks.length > 0 ? 
        Math.round((completedCategoryTasks.length / categoryTasks.length) * 100) : 0;
      
      userProgress.categoryProgress[category] = categoryProgress;
    }

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
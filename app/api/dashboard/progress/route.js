import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import UserProgress from '@/lib/models/userProgress.model';
import User from '@/lib/models/user.model';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

async function getUserFromToken(request) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Fallback to cookie
      token = request.cookies.get('token')?.value;
    }
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    // The token payload uses _id, not userId
    const user = await User.findById(decoded._id);
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let userProgress = await UserProgress.findOne({ userId: user._id });
    
    // Create default progress if doesn't exist
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

export async function PUT(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Import Task model to get actual task data
    const Task = require('@/lib/models/task.model');
    
    // Update completed tasks
    if (completed) {
      // Add task if not already completed
      const existingTask = userProgress.completedTasks.find(task => task.taskId === taskId);
      if (!existingTask) {
        userProgress.completedTasks.push({
          taskId,
          completedAt: new Date()
        });
      }
    } else {
      // Remove task from completed
      userProgress.completedTasks = userProgress.completedTasks.filter(
        task => task.taskId !== taskId
      );
    }

    // Recalculate progress based on actual tasks
    const allTasks = await Task.find({ isActive: true });
    const totalTasks = allTasks.length;
    const completedCount = userProgress.completedTasks.length;
    userProgress.overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Calculate category-specific progress
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
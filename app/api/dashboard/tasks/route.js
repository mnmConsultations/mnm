import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Task from '@/lib/models/task.model';
import seedData from '@/lib/data/seedData';
import { verifyUserAuth, hasActivePaidPlan } from '@/lib/middleware/userAuth';
import { checkAndUpdatePackageExpiry } from '@/lib/middleware/packageExpiryCheck';

/**
 * Get Tasks API Endpoint (User Dashboard)
 * GET /api/dashboard/tasks
 * 
 * Returns all active tasks grouped by category for authenticated users
 * 
 * Paywall Protection:
 * - Requires user to have active paid plan (essential or premium)
 * - Free users receive 403 with requiresPaidPlan flag
 * 
 * Auto-seeding:
 * - If no tasks exist in database, seeds from predefined data
 * 
 * Response Format:
 * {
 *   success: true,
 *   data: {
 *     [categoryId]: [...tasks],  // Grouped by category _id
 *   }
 * }
 */
export async function GET(request) {
  try {
    let user = await verifyUserAuth(request);
    
    // Check and update package expiry (only for users, not admins)
    user = await checkAndUpdatePackageExpiry(user);
    
    if (!hasActivePaidPlan(user)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access denied. Please upgrade to a paid plan to access tasks.',
          requiresPaidPlan: true 
        },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const taskCount = await Task.countDocuments();
    
    if (taskCount === 0) {
      await Task.insertMany(seedData.tasks);
    }
    
    const tasks = await Task.find({ isActive: true })
      .populate('category', 'displayName name color icon')
      .sort({ category: 1, order: 1 });
    
    // Group tasks by category _id (converted to string)
    const groupedTasks = tasks.reduce((acc, task) => {
      const categoryId = task.category._id.toString();
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(task);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: groupedTasks
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('token') ? 401 : 500 }
    );
  }
}

/**
 * Create Task API Endpoint
 * POST /api/dashboard/tasks
 * 
 * Creates a new task in the system
 * ID is auto-generated from title (slugified)
 * 
 * ADMIN ONLY - Regular users cannot create tasks
 * 
 * Required fields: title, description, category
 * Optional: order, estimatedDuration, difficulty, externalLinks, tips, requirements
 */
export async function POST(request) {
  try {
    // SECURITY FIX: Add authentication check
    const user = await verifyUserAuth(request);
    
    // Only admins can create tasks
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required to create tasks.' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { title, description, category, order, estimatedDuration, difficulty, externalLinks, tips, requirements } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    const newTask = new Task({
      id,
      title,
      description,
      category,
      order: order || 999,
      estimatedDuration,
      difficulty: difficulty || 'medium',
      externalLinks: externalLinks || [],
      tips: tips || [],
      requirements: requirements || []
    });

    await newTask.save();

    return NextResponse.json({
      success: true,
      data: newTask
    });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
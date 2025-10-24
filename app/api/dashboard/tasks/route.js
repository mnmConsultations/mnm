import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Task from '@/lib/models/task.model';
import seedData from '@/lib/data/seedData';
import { verifyUserAuth, hasActivePaidPlan } from '@/lib/middleware/userAuth';

/**
 * Get Tasks API Endpoint (User Dashboard)
 * GET /api/dashboard/tasks
 * 
 * Returns all active tasks grouped by category for authenticated users
 * 
 * Paywall Protection:
 * - Requires user to have active paid plan (basic or plus)
 * - Free users receive 403 with requiresPaidPlan flag
 * 
 * Auto-seeding:
 * - If no tasks exist in database, seeds from predefined data
 * 
 * Response Format:
 * {
 *   success: true,
 *   data: {
 *     beforeArrival: [...tasks],
 *     uponArrival: [...tasks],
 *     firstWeeks: [...tasks],
 *     ongoing: [...tasks]
 *   }
 * }
 */
export async function GET(request) {
  try {
    const user = await verifyUserAuth(request);
    
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
    
    const tasks = await Task.find({ isActive: true }).sort({ category: 1, order: 1 });
    
    const groupedTasks = tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
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
 * Required fields: title, description, category
 * Optional: order, estimatedDuration, difficulty, externalLinks, tips, requirements
 */
export async function POST(request) {
  try {
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
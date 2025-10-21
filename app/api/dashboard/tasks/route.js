import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Task from '@/lib/models/task.model';
import seedData from '@/lib/data/seedData';
import { verifyUserAuth, hasActivePaidPlan } from '@/lib/middleware/userAuth';

export async function GET(request) {
  try {
    // Verify user authentication and check for paid plan
    const user = await verifyUserAuth(request);
    
    // Check if user has an active paid plan
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
    
    // Check if tasks exist, if not seed them
    const taskCount = await Task.countDocuments();
    
    if (taskCount === 0) {
      // Seed tasks from our predefined data
      await Task.insertMany(seedData.tasks);
    }
    
    // Get all active tasks grouped by category
    const tasks = await Task.find({ isActive: true }).sort({ category: 1, order: 1 });
    
    // Group tasks by category
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
    
    // Generate unique ID
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
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../lib/middleware/adminAuth';
import Task from '../../../../lib/models/task.model';
import Category from '../../../../lib/models/category.model';

// GET - Get all tasks or tasks by category
export async function GET(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    
    const query = category ? { category } : {};
    const tasks = await Task.find(query).sort({ category: 1, order: 1 });
    
    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

// POST - Create a new task
export async function POST(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const body = await req.json();
    const { 
      title, 
      description, 
      category, 
      estimatedDuration, 
      difficulty,
      externalLinks,
      tips,
      requirements,
    } = body;
    
    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }
    
    // Validate title length
    if (title.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Title must be 50 characters or less' },
        { status: 400 }
      );
    }
    
    // Validate description length
    if (description.length > 800) {
      return NextResponse.json(
        { success: false, error: 'Description must be 800 characters or less' },
        { status: 400 }
      );
    }
    
    // Validate category exists
    const categoryExists = await Category.findOne({ id: category });
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Category does not exist' },
        { status: 400 }
      );
    }
    
    // Check task count per category (max 12)
    const taskCount = await Task.countDocuments({ category });
    if (taskCount >= 12) {
      return NextResponse.json(
        { success: false, error: 'Maximum of 12 tasks per category allowed' },
        { status: 400 }
      );
    }
    
    // Generate unique ID from title (kebab-case)
    const baseId = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    // Ensure unique ID
    let id = baseId;
    let counter = 1;
    while (await Task.findOne({ id })) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    // Get the next order number for this category
    const maxOrderTask = await Task.findOne({ category }).sort({ order: -1 });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 1;
    
    // Create task
    const task = await Task.create({
      id,
      title,
      description,
      category,
      order,
      estimatedDuration: estimatedDuration || '',
      difficulty: difficulty || 'medium',
      externalLinks: externalLinks || [],
      tips: tips || [],
      requirements: requirements || [],
    });
    
    return NextResponse.json({
      success: true,
      task,
    }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

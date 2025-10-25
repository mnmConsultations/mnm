/**
 * Admin Task Management API
 * /api/admin/tasks
 * 
 * Admin-only endpoints for managing relocation tasks
 * Tasks are the core content units displayed to users in their dashboards
 * 
 * Features:
 * - Retrieve all tasks or filter by category
 * - Create new tasks with validation
 * - Auto-generate unique IDs from titles
 * - Enforce 12 task limit per category
 * - Auto-assign order within categories
 * 
 * Security: Requires admin authentication via verifyAdminAuth middleware
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../lib/middleware/adminAuth';
import Task from '../../../../lib/models/task.model';
import Category from '../../../../lib/models/category.model';
import { notifyEntityChange } from '../../../../lib/services/notification.service';

/**
 * Get All Tasks or Tasks by Category
 * GET /api/admin/tasks?category=beforeArrival
 * 
 * Query params:
 * - category (optional): Filter tasks by category ID
 * 
 * Returns tasks sorted by category and order
 */
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

/**
 * Create New Task
 * POST /api/admin/tasks
 * 
 * Request body: { title, description, category, estimatedDuration?, difficulty?, externalLinks?, tips?, requirements? }
 * 
 * Validation:
 * - Title: Required, max 50 chars
 * - Description: Required, max 800 chars
 * - Category: Must exist in database
 * - Limit: Max 12 tasks per category
 * 
 * ID Generation:
 * - Converts title to kebab-case
 * - Appends counter if duplicate exists
 * Example: "Register Address" → "register-address"
 * 
 * Order Assignment:
 * - Automatically assigns next order number in category
 * - Ensures new tasks appear at bottom
 */
export async function POST(req) {
  try {
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
      helpfulLinks,
      tips,
      requirements,
    } = body;
    
    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }
    
    if (title.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Title must be 50 characters or less' },
        { status: 400 }
      );
    }
    
    if (description.length > 800) {
      return NextResponse.json(
        { success: false, error: 'Description must be 800 characters or less' },
        { status: 400 }
      );
    }
    
    // Validate estimatedDuration enum if provided
    const validDurations = [
      '15-30 minutes',
      '30-60 minutes',
      '1-2 hours',
      '2-4 hours',
      'Half day',
      'Full day',
      '2-3 days',
      '1 week',
      '2-4 weeks',
      '1-2 months'
    ];
    if (estimatedDuration && !validDurations.includes(estimatedDuration)) {
      return NextResponse.json(
        { success: false, error: 'Invalid estimated duration' },
        { status: 400 }
      );
    }
    
    // Validate helpfulLinks format if provided
    if (helpfulLinks && Array.isArray(helpfulLinks)) {
      for (const link of helpfulLinks) {
        if (!link.title || !link.url) {
          return NextResponse.json(
            { success: false, error: 'Each helpful link must have a title and URL' },
            { status: 400 }
          );
        }
        if (link.title.length > 100) {
          return NextResponse.json(
            { success: false, error: 'Link title must be 100 characters or less' },
            { status: 400 }
          );
        }
        if (link.url.length > 500) {
          return NextResponse.json(
            { success: false, error: 'Link URL must be 500 characters or less' },
            { status: 400 }
          );
        }
        if (link.description && link.description.length > 200) {
          return NextResponse.json(
            { success: false, error: 'Link description must be 200 characters or less' },
            { status: 400 }
          );
        }
      }
    }
    
    const categoryExists = await Category.findOne({ id: category });
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Category does not exist' },
        { status: 400 }
      );
    }
    
    const taskCount = await Task.countDocuments({ category });
    if (taskCount >= 12) {
      return NextResponse.json(
        { success: false, error: 'Maximum of 12 tasks per category allowed' },
        { status: 400 }
      );
    }
    
    const baseId = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    let id = baseId;
    let counter = 1;
    while (await Task.findOne({ id })) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    const maxOrderTask = await Task.findOne({ category }).sort({ order: -1 });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 1;
    
    const task = await Task.create({
      id,
      title,
      description,
      category,
      order,
      estimatedDuration: estimatedDuration || '',
      difficulty: difficulty || 'medium',
      externalLinks: externalLinks || [],
      helpfulLinks: helpfulLinks || [],
      tips: tips || [],
      requirements: requirements || [],
    });
    
    // Notify users about new task
    await notifyEntityChange({
      entityType: 'task',
      entityId: task.id,
      action: 'created',
      entityName: task.title,
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

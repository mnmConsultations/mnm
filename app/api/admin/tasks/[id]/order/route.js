import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../../lib/middleware/adminAuth';
import Task from '../../../../../../lib/models/task.model';

// PATCH - Update task order within category
export async function PATCH(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const taskId = params.id;
    const body = await req.json();
    const { newOrder } = body;
    
    if (typeof newOrder !== 'number' || newOrder < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid order value' },
        { status: 400 }
      );
    }
    
    // Find the task
    const task = await Task.findOne({ id: taskId });
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    const oldOrder = task.order;
    const category = task.category;
    
    if (oldOrder === newOrder) {
      return NextResponse.json({
        success: true,
        task,
        message: 'No change in order',
      });
    }
    
    // Update orders of affected tasks in the same category
    if (newOrder < oldOrder) {
      // Moving up - increment orders of tasks between newOrder and oldOrder
      await Task.updateMany(
        { 
          category,
          order: { $gte: newOrder, $lt: oldOrder } 
        },
        { $inc: { order: 1 } }
      );
    } else {
      // Moving down - decrement orders of tasks between oldOrder and newOrder
      await Task.updateMany(
        { 
          category,
          order: { $gt: oldOrder, $lte: newOrder } 
        },
        { $inc: { order: -1 } }
      );
    }
    
    // Update the task's order
    task.order = newOrder;
    await task.save();
    
    // Get all tasks in the category in new order
    const tasks = await Task.find({ category }).sort({ order: 1 });
    
    return NextResponse.json({
      success: true,
      task,
      tasks,
    });
  } catch (error) {
    console.error('Update task order error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

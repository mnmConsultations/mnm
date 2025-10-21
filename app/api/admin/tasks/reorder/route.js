import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/db';
import Task from '@/lib/models/task.model';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

export async function PATCH(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);

    await dbConnect();

    const { tasks, category } = await req.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { success: false, message: 'Invalid tasks array' },
        { status: 400 }
      );
    }

    // Batch update all tasks in a single operation
    const bulkOps = tasks.map(task => ({
      updateOne: {
        filter: { id: task.id, category: category },
        update: { $set: { order: task.order } }
      }
    }));

    await Task.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: 'Tasks reordered successfully'
    });

  } catch (error) {
    console.error('Error reordering tasks:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reorder tasks' },
      { status: 500 }
    );
  }
}

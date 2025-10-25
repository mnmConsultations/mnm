/**
 * Batch Task Reorder API Endpoint
 * PATCH /api/admin/tasks/reorder
 * 
 * Purpose:
 * - Updates the display order of multiple tasks in a single database operation
 * - Used when admin drag-and-drops tasks to reorder them within a category
 * - Reduces database requests by batching updates using MongoDB bulkWrite
 * 
 * Authentication:
 * - Requires admin authentication (verifyAdminAuth)
 * - Only admin users can reorder tasks
 * 
 * Request Body:
 * {
 *   tasks: [{id: string, order: number}, ...],  // Array of tasks with new order
 *   category: string                             // Category ID these tasks belong to
 * }
 * 
 * Response:
 * Success (200): { success: true, message: 'Tasks reordered successfully' }
 * Error (400): { success: false, message: 'Invalid tasks array' }
 * Error (500): { success: false, message: error message }
 * 
 * Database Operation:
 * - Uses bulkWrite for efficient batch updates
 * - Updates only the 'order' field for each task
 * - Filters by both task id and category to ensure data integrity
 * 
 * Performance:
 * - Single database roundtrip regardless of number of tasks
 * - Atomic operation ensures consistency
 * 
 * Usage:
 * - Called from AdminContentTab.jsx when admin reorders tasks via drag-and-drop
 * - Maintains sort order for task display in user dashboards
 */
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
        filter: { _id: task.id, category: category },
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

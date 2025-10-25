/**
 * Admin Single Task Management API
 * /api/admin/tasks/[id]
 * 
 * Admin-only CRUD operations for individual tasks
 * 
 * Features:
 * - Retrieve task by MongoDB _id
 * - Update task with validation
 * - Delete task with category minimum enforcement
 * 
 * Security: Requires admin authentication
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../lib/middleware/adminAuth';
import Task from '../../../../../lib/models/task.model';
import Category from '../../../../../lib/models/category.model';
import { notifyEntityChange } from '../../../../../lib/services/notification.service';

/**
 * Get Single Task
 * GET /api/admin/tasks/[id]
 * 
 * Returns task details by MongoDB _id with populated category
 */
export async function GET(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const { id: taskId } = await params;
    const task = await Task.findById(taskId).populate('category', 'displayName name color icon');
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

/**
 * Update Task
 * PATCH /api/admin/tasks/[id]
 * 
 * Updates task with partial fields
 * 
 * Validation:
 * - Title: Max 50 chars
 * - Description: Max 800 chars
 * - Category change: Verify exists (ObjectId) and under 12 task limit
 * 
 * Note: MongoDB _id never changes, simplifying updates
 */
export async function PATCH(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const { id: taskId } = await params;
    const body = await req.json();
    const { 
      title, 
      description, 
      category,
      order,
      estimatedDuration, 
      difficulty,
      externalLinks,
      helpfulLinks,
      tips,
      requirements,
    } = body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Track changes for notification
    const changes = [];
    if (title !== undefined && title !== task.title) changes.push('title');
    if (description !== undefined && description !== task.description) changes.push('description');
    if (category !== undefined && category.toString() !== task.category.toString()) changes.push('category');
    if (estimatedDuration !== undefined && estimatedDuration !== task.estimatedDuration) changes.push('duration');
    if (difficulty !== undefined && difficulty !== task.difficulty) changes.push('difficulty');
    if (externalLinks !== undefined) changes.push('links');
    if (helpfulLinks !== undefined) changes.push('helpful links');
    if (tips !== undefined) changes.push('tips');
    if (requirements !== undefined) changes.push('requirements');
    
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
    if (estimatedDuration !== undefined && estimatedDuration && !validDurations.includes(estimatedDuration)) {
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
    
    if (title !== undefined) {
      if (!title || title.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Title is required and must be 50 characters or less' },
          { status: 400 }
        );
      }
    }
    
    if (description !== undefined) {
      if (description.length > 800) {
        return NextResponse.json(
          { success: false, error: 'Description must be 800 characters or less' },
          { status: 400 }
        );
      }
    }
    
    if (category !== undefined && category.toString() !== task.category.toString()) {
      const categoryExists = await Category.findById(category);
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
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = order;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (externalLinks !== undefined) updateData.externalLinks = externalLinks;
    if (helpfulLinks !== undefined) updateData.helpfulLinks = helpfulLinks;
    if (tips !== undefined) updateData.tips = tips;
    if (requirements !== undefined) updateData.requirements = requirements;
    
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true }
    ).populate('category', 'displayName name color icon');
    
    // Notify users about task update
    if (changes.length > 0) {
      await notifyEntityChange({
        entityType: 'task',
        entityId: taskId,
        action: 'updated',
        entityName: updatedTask.title,
        changes,
      });
    }
    
    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

/**
 * Delete Task
 * DELETE /api/admin/tasks/[id]
 * 
 * Removes task from database
 * 
 * Note: Categories can exist without tasks
 */
export async function DELETE(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const { id: taskId } = await params;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Store task title before deletion for notification
    const taskTitle = task.title;
    
    await Task.findByIdAndDelete(taskId);
    
    // Notify users about task deletion
    await notifyEntityChange({
      entityType: 'task',
      entityId: taskId,
      action: 'deleted',
      entityName: taskTitle,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

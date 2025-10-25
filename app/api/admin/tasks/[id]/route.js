/**
 * Admin Single Task Management API
 * /api/admin/tasks/[id]
 * 
 * Admin-only CRUD operations for individual tasks
 * 
 * Features:
 * - Retrieve task by ID
 * - Update task with validation
 * - Delete task with category minimum enforcement
 * - Special handling: ID regeneration when title changes
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
 * Returns task details by ID
 */
export async function GET(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const taskId = params.id;
    const task = await Task.findOne({ id: taskId });
    
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
 * Special Behavior - ID Regeneration:
 * When title changes:
 * 1. Generate new kebab-case ID from title
 * 2. Delete old task record
 * 3. Create new task with new ID
 * 4. Return { idChanged: true, oldId, newId }
 * 
 * This ensures IDs always match titles for consistency
 * Frontend must handle ID changes in URLs and references
 * 
 * Validation:
 * - Title: Max 50 chars
 * - Description: Max 800 chars
 * - Category change: Verify exists and under 12 task limit
 */
export async function PATCH(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const taskId = params.id;
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
    
    const task = await Task.findOne({ id: taskId });
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
    if (category !== undefined && category !== task.category) changes.push('category');
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
      
      const baseId = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      let newId = baseId;
      let counter = 1;
      while (newId !== taskId && await Task.findOne({ id: newId })) {
        newId = `${baseId}-${counter}`;
        counter++;
      }
      
      if (newId !== taskId) {
        await Task.deleteOne({ id: taskId });
        
        const updatedTask = await Task.create({
          id: newId,
          title,
          description: description !== undefined ? description : task.description,
          category: category !== undefined ? category : task.category,
          order: order !== undefined ? order : task.order,
          estimatedDuration: estimatedDuration !== undefined ? estimatedDuration : task.estimatedDuration,
          difficulty: difficulty !== undefined ? difficulty : task.difficulty,
          externalLinks: externalLinks !== undefined ? externalLinks : task.externalLinks,
          helpfulLinks: helpfulLinks !== undefined ? helpfulLinks : task.helpfulLinks,
          tips: tips !== undefined ? tips : task.tips,
          requirements: requirements !== undefined ? requirements : task.requirements,
          isRequired: task.isRequired,
          isActive: task.isActive,
        });
        
        // Notify users about task update (with ID change)
        if (changes.length > 0) {
          await notifyEntityChange({
            entityType: 'task',
            entityId: newId,
            action: 'updated',
            entityName: title,
            changes,
          });
        }
        
        return NextResponse.json({
          success: true,
          task: updatedTask,
          idChanged: true,
          oldId: taskId,
          newId: newId,
        });
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
    
    if (category !== undefined && category !== task.category) {
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
    
    const updatedTask = await Task.findOneAndUpdate(
      { id: taskId },
      updateData,
      { new: true }
    );
    
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
 * Business Rule: Minimum 1 Task Per Category
 * - Prevents deletion if task is the last in its category
 * - Ensures each category always has at least one task
 * - Maintains data integrity for user dashboards
 */
export async function DELETE(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const taskId = params.id;
    
    const task = await Task.findOne({ id: taskId });
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    const taskCount = await Task.countDocuments({ category: task.category });
    if (taskCount <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last task in a category. Minimum 1 task per category required.' },
        { status: 400 }
      );
    }
    
    // Store task title before deletion for notification
    const taskTitle = task.title;
    
    await Task.deleteOne({ id: taskId });
    
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

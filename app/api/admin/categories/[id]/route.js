/**
 * Admin Single Category Management API
 * /api/admin/categories/[id]
 * 
 * Admin-only CRUD operations for individual categories
 * 
 * Features:
 * - Retrieve category by ID
 * - Update category with validation
 * - Delete category (only if no tasks)
 * - Cascading updates: When category ID changes, all related tasks are updated
 * 
 * Security: Requires admin authentication
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../lib/middleware/adminAuth';
import Category from '../../../../../lib/models/category.model';
import Task from '../../../../../lib/models/task.model';

/**
 * Get Single Category
 * GET /api/admin/categories/[id]
 * 
 * Returns category details by ID
 */
export async function GET(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const categoryId = params.id;
    const category = await Category.findOne({ id: categoryId });
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

/**
 * Update Category
 * PATCH /api/admin/categories/[id]
 * 
 * Updates category with partial fields
 * 
 * Special Behavior - Cascading ID Update:
 * When display name changes:
 * 1. Generate new camelCase ID
 * 2. Update all related tasks with new category ID
 * 3. Delete old category record
 * 4. Create new category with new ID
 * 5. Return { idChanged: true, oldId, newId }
 * 
 * This maintains referential integrity across all tasks
 * Frontend must handle ID changes in navigation and state
 * 
 * Validation:
 * - Display name: Max 50 chars
 * - Uniqueness: New name must not conflict with existing
 */
export async function PATCH(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const categoryId = params.id;
    const body = await req.json();
    const { displayName, description, icon, color, order, estimatedTimeFrame } = body;
    
    const category = await Category.findOne({ id: categoryId });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    if (displayName !== undefined) {
      if (!displayName || displayName.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Display name is required and must be 50 characters or less' },
          { status: 400 }
        );
      }
      
      const newId = displayName
        .trim()
        .replace(/\s+(.)/g, (match, char) => char.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^(.)/, (match, char) => char.toLowerCase());
      
      if (newId !== categoryId) {
        const existingCategory = await Category.findOne({ id: newId });
        if (existingCategory) {
          return NextResponse.json(
            { success: false, error: 'A category with this name already exists' },
            { status: 400 }
          );
        }
        
        await Task.updateMany(
          { category: categoryId },
          { category: newId }
        );
        
        await Category.deleteOne({ id: categoryId });
        
        const updatedCategory = await Category.create({
          id: newId,
          name: newId,
          displayName,
          description: description !== undefined ? description : category.description,
          icon: icon !== undefined ? icon : category.icon,
          color: color !== undefined ? color : category.color,
          order: order !== undefined ? order : category.order,
          estimatedTimeFrame: estimatedTimeFrame !== undefined ? estimatedTimeFrame : category.estimatedTimeFrame,
        });
        
        return NextResponse.json({
          success: true,
          category: updatedCategory,
          idChanged: true,
          oldId: categoryId,
          newId: newId,
        });
      }
    }
    
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;
    if (estimatedTimeFrame !== undefined) updateData.estimatedTimeFrame = estimatedTimeFrame;
    
    const updatedCategory = await Category.findOneAndUpdate(
      { id: categoryId },
      updateData,
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

/**
 * Delete Category
 * DELETE /api/admin/categories/[id]
 * 
 * Removes category from database
 * 
 * Business Rules:
 * 1. Minimum 1 category required - prevents deletion of last category
 * 2. No orphan tasks - prevents deletion if category has tasks
 * 
 * Error Messages:
 * - Shows task count if tasks exist
 * - Instructs admin to delete tasks first
 * 
 * This maintains data integrity and prevents broken task relationships
 */
export async function DELETE(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const categoryId = params.id;
    
    const category = await Category.findOne({ id: categoryId });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    const categoryCount = await Category.countDocuments();
    if (categoryCount <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last category. Minimum 1 category required.' },
        { status: 400 }
      );
    }
    
    const taskCount = await Task.countDocuments({ category: categoryId });
    if (taskCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete category with ${taskCount} task(s). Delete tasks first.` },
        { status: 400 }
      );
    }
    
    await Category.deleteOne({ id: categoryId });
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

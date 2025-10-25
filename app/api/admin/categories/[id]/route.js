/**
 * Admin Single Category Management API
 * /api/admin/categories/[id]
 * 
 * Admin-only CRUD operations for individual categories
 * 
 * Features:
 * - Retrieve category by MongoDB _id
 * - Update category with validation
 * - Delete category (only if no tasks)
 * 
 * Security: Requires admin authentication
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../lib/middleware/adminAuth';
import Category from '../../../../../lib/models/category.model';
import Task from '../../../../../lib/models/task.model';
import { notifyEntityChange } from '../../../../../lib/services/notification.service';

/**
 * Get Single Category
 * GET /api/admin/categories/[id]
 * 
 * Returns category details by MongoDB _id
 */
export async function GET(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const { id: categoryId } = await params;
    const category = await Category.findById(categoryId);
    
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
 * Validation:
 * - Display name: Max 50 chars, must be unique
 * - Estimated time frame: Must be valid enum value
 * 
 * Note: MongoDB _id never changes, ensuring referential integrity
 */
export async function PATCH(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const { id: categoryId } = await params;
    const body = await req.json();
    const { displayName, description, icon, color, order, estimatedTimeFrame } = body;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Track changes for notification
    const changes = [];
    if (displayName !== undefined && displayName !== category.displayName) changes.push('name');
    if (description !== undefined && description !== category.description) changes.push('description');
    if (icon !== undefined && icon !== category.icon) changes.push('icon');
    if (color !== undefined && color !== category.color) changes.push('color');
    if (estimatedTimeFrame !== undefined && estimatedTimeFrame !== category.estimatedTimeFrame) changes.push('timeframe');
    
    // Validate estimatedTimeFrame enum if provided
    const validTimeFrames = [
      'Before departure',
      'First week',
      'First month',
      '1-3 months',
      '3-6 months',
      '6+ months',
      'Ongoing'
    ];
    if (estimatedTimeFrame !== undefined && estimatedTimeFrame && !validTimeFrames.includes(estimatedTimeFrame)) {
      return NextResponse.json(
        { success: false, error: 'Invalid estimated time frame' },
        { status: 400 }
      );
    }
    
    if (displayName !== undefined) {
      if (!displayName || displayName.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Display name is required and must be 50 characters or less' },
          { status: 400 }
        );
      }
      
      // Check for duplicate display names (excluding current category)
      const existingCategory = await Category.findOne({ 
        displayName: { $regex: new RegExp(`^${displayName}$`, 'i') },
        _id: { $ne: categoryId }
      });
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'A category with this name already exists' },
          { status: 400 }
        );
      }
    }
    
    const updateData = {};
    if (displayName !== undefined) {
      updateData.displayName = displayName;
      updateData.name = displayName; // Keep name in sync
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;
    if (estimatedTimeFrame !== undefined) updateData.estimatedTimeFrame = estimatedTimeFrame;
    
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true }
    );
    
    // Notify users about category update
    if (changes.length > 0) {
      await notifyEntityChange({
        entityType: 'category',
        entityId: categoryId,
        action: 'updated',
        entityName: updatedCategory.displayName,
        changes,
      });
    }
    
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
 * 2. Cascade delete - automatically deletes all tasks in the category
 * 
 * This maintains data integrity by cleaning up orphaned tasks
 */
export async function DELETE(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const { id: categoryId } = await params;
    
    const category = await Category.findById(categoryId);
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
    
    // Delete all tasks in this category (cascade delete)
    const taskCount = await Task.countDocuments({ category: categoryId });
    if (taskCount > 0) {
      await Task.deleteMany({ category: categoryId });
      console.log(`Deleted ${taskCount} task(s) associated with category: ${category.displayName}`);
    }
    
    // Store category name before deletion for notification
    const categoryName = category.displayName;
    
    await Category.findByIdAndDelete(categoryId);
    
    // Notify users about category deletion
    await notifyEntityChange({
      entityType: 'category',
      entityId: categoryId,
      action: 'deleted',
      entityName: categoryName,
    });
    
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

import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../lib/middleware/adminAuth';
import Category from '../../../../../lib/models/category.model';
import Task from '../../../../../lib/models/task.model';

// GET - Get single category
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

// PATCH - Update category
export async function PATCH(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const categoryId = params.id;
    const body = await req.json();
    const { displayName, description, icon, color, order, estimatedTimeFrame } = body;
    
    // Find existing category
    const category = await Category.findOne({ id: categoryId });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Validate displayName if provided
    if (displayName !== undefined) {
      if (!displayName || displayName.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Display name is required and must be 50 characters or less' },
          { status: 400 }
        );
      }
      
      // Generate new ID from displayName
      const newId = displayName
        .trim()
        .replace(/\s+(.)/g, (match, char) => char.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^(.)/, (match, char) => char.toLowerCase());
      
      // Check if new ID conflicts with existing category (other than current)
      if (newId !== categoryId) {
        const existingCategory = await Category.findOne({ id: newId });
        if (existingCategory) {
          return NextResponse.json(
            { success: false, error: 'A category with this name already exists' },
            { status: 400 }
          );
        }
        
        // Update tasks with new category ID
        await Task.updateMany(
          { category: categoryId },
          { category: newId }
        );
        
        // Delete old category and create new one with updated ID
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
    
    // Regular update without ID change
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

// DELETE - Delete category (only if it has no tasks)
export async function DELETE(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const categoryId = params.id;
    
    // Check if category exists
    const category = await Category.findOne({ id: categoryId });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check minimum category count
    const categoryCount = await Category.countDocuments();
    if (categoryCount <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last category. Minimum 1 category required.' },
        { status: 400 }
      );
    }
    
    // Check if category has tasks
    const taskCount = await Task.countDocuments({ category: categoryId });
    if (taskCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete category with ${taskCount} task(s). Delete tasks first.` },
        { status: 400 }
      );
    }
    
    // Delete category
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

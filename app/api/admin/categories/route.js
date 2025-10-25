/**
 * Admin Category Management API
 * /api/admin/categories
 * 
 * Admin-only endpoints for managing task categories
 * Categories organize tasks into relocation journey phases
 * 
 * Features:
 * - List all categories sorted by order
 * - Create new categories with validation
 * - Auto-generate camelCase IDs from display names
 * - Enforce 6 category maximum
 * - Auto-assign order for new categories
 * 
 * Security: Requires admin authentication
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../lib/middleware/adminAuth';
import Category from '../../../../lib/models/category.model';
import { notifyEntityChange } from '../../../../lib/services/notification.service';

/**
 * Get All Categories
 * GET /api/admin/categories
 * 
 * Returns categories sorted by order field
 */
export async function GET(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const categories = await Category.find().sort({ order: 1 });
    
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

/**
 * Create New Category
 * POST /api/admin/categories
 * 
 * Request body: { displayName, description?, icon?, color?, estimatedTimeFrame? }
 * 
 * Validation:
 * - Display name: Required, max 50 chars
 * - Limit: Max 6 categories total
 * - Uniqueness: Name must be unique
 * 
 * ID Generation:
 * Converts display name to camelCase
 * Example: "Before Arrival" → "beforeArrival"
 * 
 * Defaults:
 * - icon: 'circle'
 * - color: '#3B82F6' (blue)
 * - order: Auto-assigned to end of list
 */
export async function POST(req) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const body = await req.json();
    const { displayName, description, icon, color, estimatedTimeFrame } = body;
    
    if (!displayName || displayName.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Display name is required and must be 50 characters or less' },
        { status: 400 }
      );
    }
    
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
    if (estimatedTimeFrame && !validTimeFrames.includes(estimatedTimeFrame)) {
      return NextResponse.json(
        { success: false, error: 'Invalid estimated time frame' },
        { status: 400 }
      );
    }
    
    const categoryCount = await Category.countDocuments();
    if (categoryCount >= 6) {
      return NextResponse.json(
        { success: false, error: 'Maximum of 6 categories allowed' },
        { status: 400 }
      );
    }
    
    const id = displayName
      .trim()
      .replace(/\s+(.)/g, (match, char) => char.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/^(.)/, (match, char) => char.toLowerCase());
    
    const existingCategory = await Category.findOne({ id });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 400 }
      );
    }
    
    const maxOrderCategory = await Category.findOne().sort({ order: -1 });
    const order = maxOrderCategory ? maxOrderCategory.order + 1 : 1;
    
    const category = await Category.create({
      id,
      name: id,
      displayName,
      description: description || '',
      icon: icon || 'circle',
      color: color || '#3B82F6',
      order,
      estimatedTimeFrame: estimatedTimeFrame || '',
    });
    
    // Notify users about new category
    await notifyEntityChange({
      entityType: 'category',
      entityId: category.id,
      action: 'created',
      entityName: category.displayName,
    });
    
    return NextResponse.json({
      success: true,
      category,
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../lib/middleware/adminAuth';
import Category from '../../../../lib/models/category.model';

// GET - Get all categories
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

// POST - Create a new category
export async function POST(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const body = await req.json();
    const { displayName, description, icon, color, estimatedTimeFrame } = body;
    
    // Validate displayName length
    if (!displayName || displayName.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Display name is required and must be 50 characters or less' },
        { status: 400 }
      );
    }
    
    // Check category count (max 6)
    const categoryCount = await Category.countDocuments();
    if (categoryCount >= 6) {
      return NextResponse.json(
        { success: false, error: 'Maximum of 6 categories allowed' },
        { status: 400 }
      );
    }
    
    // Generate unique ID from displayName (camelCase)
    const id = displayName
      .trim()
      .replace(/\s+(.)/g, (match, char) => char.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/^(.)/, (match, char) => char.toLowerCase());
    
    // Check if ID already exists
    const existingCategory = await Category.findOne({ id });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 400 }
      );
    }
    
    // Get the next order number
    const maxOrderCategory = await Category.findOne().sort({ order: -1 });
    const order = maxOrderCategory ? maxOrderCategory.order + 1 : 1;
    
    // Create category
    const category = await Category.create({
      id,
      name: id, // name same as id
      displayName,
      description: description || '',
      icon: icon || 'circle',
      color: color || '#3B82F6',
      order,
      estimatedTimeFrame: estimatedTimeFrame || '',
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

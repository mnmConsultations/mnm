import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Category from '@/lib/models/category.model';
import seedData from '@/lib/data/seedData';
import { verifyUserAuth, hasActivePaidPlan } from '@/lib/middleware/userAuth';

/**
 * Get Categories API Endpoint (User Dashboard)
 * GET /api/dashboard/categories
 * 
 * Returns all active categories sorted by display order
 * 
 * Paywall Protection:
 * - Requires user to have active paid plan (basic or plus)
 * - Free users receive 403 with requiresPaidPlan flag
 * 
 * Auto-seeding:
 * - If no categories exist in database, seeds from predefined data
 * 
 * Response includes: id, name, displayName, description, icon, color, order, timeFrame
 */
export async function GET(request) {
  try {
    const user = await verifyUserAuth(request);
    
    if (!hasActivePaidPlan(user)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access denied. Please upgrade to a paid plan to access categories.',
          requiresPaidPlan: true 
        },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount === 0) {
      await Category.insertMany(seedData.categories);
    }
    
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('token') ? 401 : 500 }
    );
  }
}

/**
 * Create Category API Endpoint
 * POST /api/dashboard/categories
 * 
 * Creates a new category in the system
 * ID is set to the category name value
 * 
 * Required fields: name, displayName
 * Optional: description, icon, color (defaults to #3B82F6), order (defaults to 999), estimatedTimeFrame
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, displayName, description, icon, color, order, estimatedTimeFrame } = body;

    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Name and display name are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const newCategory = new Category({
      id: name,
      name,
      displayName,
      description,
      icon,
      color: color || '#3B82F6',
      order: order || 999,
      estimatedTimeFrame
    });

    await newCategory.save();

    return NextResponse.json({
      success: true,
      data: newCategory
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Category from '@/lib/models/category.model';
import seedData from '@/lib/data/seedData';
import { verifyUserAuth, hasActivePaidPlan } from '@/lib/middleware/userAuth';

export async function GET(request) {
  try {
    // Verify user authentication and check for paid plan
    const user = await verifyUserAuth(request);
    
    // Check if user has an active paid plan
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
    
    // Check if categories exist, if not seed them
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount === 0) {
      // Seed categories from our predefined data
      await Category.insertMany(seedData.categories);
    }
    
    // Get all active categories
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
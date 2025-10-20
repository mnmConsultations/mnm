import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../../lib/middleware/adminAuth';
import Category from '../../../../../../lib/models/category.model';

// PATCH - Update category order
export async function PATCH(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const categoryId = params.id;
    const body = await req.json();
    const { newOrder } = body;
    
    if (typeof newOrder !== 'number' || newOrder < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid order value' },
        { status: 400 }
      );
    }
    
    // Find the category
    const category = await Category.findOne({ id: categoryId });
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }
    
    const oldOrder = category.order;
    
    if (oldOrder === newOrder) {
      return NextResponse.json({
        success: true,
        category,
        message: 'No change in order',
      });
    }
    
    // Update orders of affected categories
    if (newOrder < oldOrder) {
      // Moving up - increment orders of categories between newOrder and oldOrder
      await Category.updateMany(
        { order: { $gte: newOrder, $lt: oldOrder } },
        { $inc: { order: 1 } }
      );
    } else {
      // Moving down - decrement orders of categories between oldOrder and newOrder
      await Category.updateMany(
        { order: { $gt: oldOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    }
    
    // Update the category's order
    category.order = newOrder;
    await category.save();
    
    // Get all categories in new order
    const categories = await Category.find().sort({ order: 1 });
    
    return NextResponse.json({
      success: true,
      category,
      categories,
    });
  } catch (error) {
    console.error('Update category order error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

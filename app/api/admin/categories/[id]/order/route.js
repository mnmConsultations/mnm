/**
 * Single Category Order Update API Endpoint
 * PATCH /api/admin/categories/[id]/order
 * 
 * Purpose:
 * - Updates the order of a single category in the relocation journey
 * - Automatically adjusts order of other categories to maintain sequence integrity
 * - Used for precise category reordering in admin dashboard
 * 
 * Authentication:
 * - Requires admin authentication (verifyAdminAuth)
 * - Only admin users can modify category order
 * 
 * Route Parameters:
 * - id: Category ID (from URL path)
 * 
 * Request Body:
 * {
 *   newOrder: number  // New order position (must be >= 1)
 * }
 * 
 * Response:
 * Success (200): { success: true, category: Category, categories: Category[], message?: string }
 * Error (400): { success: false, error: 'Invalid order value' }
 * Error (404): { success: false, error: 'Category not found' }
 * Error (403/500): { success: false, error: error message }
 * 
 * Order Update Logic:
 * Moving category UP (newOrder < oldOrder):
 *   - Categories between newOrder and oldOrder get incremented by 1
 *   - Makes space for the moved category at lower position
 *   - Example: Moving category 4 to position 2 → categories 2,3 become 3,4
 * 
 * Moving category DOWN (newOrder > oldOrder):
 *   - Categories between oldOrder and newOrder get decremented by 1
 *   - Fills the gap left by the moved category
 *   - Example: Moving category 2 to position 4 → categories 3,4 become 2,3
 * 
 * No change (newOrder === oldOrder):
 *   - Returns immediately without database updates
 * 
 * Database Operations:
 * 1. Find category by id
 * 2. Update affected categories using updateMany
 * 3. Update target category's order
 * 4. Return all categories sorted by order
 * 
 * Usage:
 * - Called from AdminContentTab.jsx for single category reordering
 * - Alternative to batch reorder endpoint for individual moves
 * - Maintains journey phase sequence (Before Arrival → Upon Arrival → First Weeks → Ongoing)
 */
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

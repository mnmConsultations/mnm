import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/db';
import Category from '@/lib/models/category.model';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

/**
 * Batch Category Reorder API Endpoint
 * PATCH /api/admin/categories/reorder
 * 
 * Updates the display order of multiple categories in a single database operation
 * Reduces database requests when admin reorders categories in the dashboard
 * Uses MongoDB bulkWrite for optimal performance
 * 
 * Request body: { categories: [{id, order}, {id, order}, ...] }
 */
export async function PATCH(req) {
  try {
    await verifyAdminAuth(req);

    await dbConnect();

    const { categories } = await req.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, message: 'Invalid categories array' },
        { status: 400 }
      );
    }

    const bulkOps = categories.map(cat => ({
      updateOne: {
        filter: { id: cat.id },
        update: { $set: { order: cat.order } }
      }
    }));

    await Category.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: 'Categories reordered successfully'
    });

  } catch (error) {
    console.error('Error reordering categories:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reorder categories' },
      { status: 500 }
    );
  }
}

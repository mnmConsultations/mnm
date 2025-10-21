import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/db';
import Category from '@/lib/models/category.model';
import { verifyAdminAuth } from '@/lib/middleware/adminAuth';

export async function PATCH(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);

    await dbConnect();

    const { categories } = await req.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, message: 'Invalid categories array' },
        { status: 400 }
      );
    }

    // Batch update all categories in a single operation
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

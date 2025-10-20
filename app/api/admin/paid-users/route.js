import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../lib/middleware/adminAuth';
import Stats from '../../../../lib/models/stats.model';

// GET - Get paid user count
export async function GET(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    // Get or create stats document
    let stats = await Stats.findById('global-stats');
    if (!stats) {
      stats = await Stats.create({ _id: 'global-stats', paidUserCount: 0 });
    }
    
    return NextResponse.json({
      success: true,
      paidUserCount: stats.paidUserCount,
    });
  } catch (error) {
    console.error('Get paid users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

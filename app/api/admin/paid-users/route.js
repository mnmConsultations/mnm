/**
 * Admin Paid Users Statistics API
 * GET /api/admin/paid-users
 * 
 * Returns count of users with active paid plans
 * 
 * Features:
 * - Retrieves cached count from Stats model
 * - Auto-creates stats document if missing
 * - Used for admin dashboard KPI display
 * 
 * Performance:
 * - Single document query (O(1))
 * - No user collection scanning
 * - Count maintained by package update operations
 * 
 * Security: Admin only
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../lib/middleware/adminAuth';
import Stats from '../../../../lib/models/stats.model';

export async function GET(req) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
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

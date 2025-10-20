import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../lib/middleware/adminAuth';
import User from '../../../../../lib/models/user.model';

// GET - Search user by email
export async function GET(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({
        success: true,
        users: [],
      });
    }
    
    // Search for users by email (case-insensitive partial match)
    const users = await User.find({
      email: { $regex: email, $options: 'i' }
    }).select('-password -salt').limit(20);
    
    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Search user error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

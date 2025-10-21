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
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    if (!email) {
      return NextResponse.json({
        success: true,
        users: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
      });
    }
    
    // Search for users by email only (case-insensitive partial match)
    // Strictly filter by role "user" only
    const query = {
      email: { $regex: email, $options: 'i' },
      role: 'user'
    };
    
    // Get total count for pagination
    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
    // Get paginated users
    const users = await User.find(query)
      .select('-password -salt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      users,
      totalCount,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    console.error('Search user error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

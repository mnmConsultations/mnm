/**
 * Admin User Search API
 * GET /api/admin/users/search?email=<search>&page=<page>
 * 
 * Search users by email with pagination
 * 
 * Query Parameters:
 * - email (required): Case-insensitive partial match
 * - page (optional): Page number, default 1
 * 
 * Pagination:
 * - 10 users per page
 * - Returns total count, page info, and navigation flags
 * 
 * Security:
 * - Admin only
 * - Excludes password/salt fields
 * - Only searches users with role='user' (excludes admins)
 * 
 * Use Case: Admin dashboard user lookup for package management
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../lib/middleware/adminAuth';
import User from '../../../../../lib/models/user.model';

export async function GET(req) {
  try {
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
    
    const query = {
      email: { $regex: email, $options: 'i' },
      role: 'user'
    };
    
    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
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

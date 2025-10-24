import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import AuthService from '../../../../lib/services/auth.services';

/**
 * Get Current User API Endpoint
 * GET /api/auth/me
 * 
 * Returns the authenticated user's profile information
 * Requires Bearer token in Authorization header
 * Used by frontend to verify authentication state and fetch user data
 * Includes package subscription details for paywall logic
 */
export async function GET(request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No token provided',
          isLoggedIn: false 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    const user = await AuthService.getCurrentUser(token);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token',
          isLoggedIn: false 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      isLoggedIn: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          package: user.package,
          packageActivatedAt: user.packageActivatedAt,
          packageExpiresAt: user.packageExpiresAt
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get current user error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        isLoggedIn: false 
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import AuthService from '../../../../lib/services/auth.services';
import User from '../../../../lib/models/user.model';

/**
 * Update User Profile API Endpoint
 * PUT /api/auth/profile
 * 
 * Allows authenticated users to update their profile information
 * Users can update: firstName, lastName, phoneNumber
 * Email is NOT editable for security reasons
 * Requires Bearer token in Authorization header
 */
export async function PUT(request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No token provided' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Get current user from token
    const currentUser = await AuthService.getCurrentUser(token);
    
    if (!currentUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { firstName, lastName, phoneNumber } = body;

    // Validation
    const errors = {};

    if (!firstName || firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (phoneNumber && !/^[6-9]\d{9}$/.test(phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format (must be 10 digits starting with 6-9)';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors 
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : '',
    };

    // Only add phoneNumber if provided
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber.trim();
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -salt');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          role: updatedUser.role,
          package: updatedUser.package,
          packageActivatedAt: updatedUser.packageActivatedAt,
          packageExpiresAt: updatedUser.packageExpiresAt
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}

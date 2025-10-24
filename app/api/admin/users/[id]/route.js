/**
 * Admin User Management API
 * /api/admin/users/[id]
 * 
 * Admin-only operations for managing individual users
 * 
 * Features:
 * - Delete users (with active plan protection)
 * - Update user packages (with auto-expiry calculation)
 * - Auto-update paid user statistics
 * 
 * Security: Requires admin authentication
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../lib/middleware/adminAuth';
import User from '../../../../../lib/models/user.model';
import Stats from '../../../../../lib/models/stats.model';

/**
 * Delete User
 * DELETE /api/admin/users/[id]
 * 
 * Removes user from database
 * 
 * Business Rule: Active Plan Protection
 * - Prevents deletion of users with active paid plans
 * - Only allows deletion of free users or expired paid users
 * - Ensures paying customers aren't accidentally removed
 */
export async function DELETE(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const userId = params.id;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user has an active plan
    if (user.package !== 'free') {
      // Check if package is still active
      if (user.packageExpiresAt && new Date(user.packageExpiresAt) > new Date()) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete user with active plan' },
          { status: 400 }
        );
      }
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

/**
 * Update User Package
 * PATCH /api/admin/users/[id]
 * 
 * Request body: { package: 'free' | 'basic' | 'plus' }
 * 
 * Automatic Date Management:
 * - Paid packages: Sets activation date + 1 year expiry
 * - Free package: Clears activation and expiry dates
 * 
 * Statistics Sync:
 * - Auto-increments paidUserCount on upgrade to paid
 * - Auto-decrements paidUserCount on downgrade to free
 * - Creates global-stats record if missing
 * 
 * Used by admins for manual package assignment
 * Returns updated user and current paid user count
 */
export async function PATCH(req, { params }) {
  try {
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const userId = params.id;
    const body = await req.json();
    const { package: newPackage } = body;
    
    if (!['free', 'basic', 'plus'].includes(newPackage)) {
      return NextResponse.json(
        { success: false, error: 'Invalid package type' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const oldPackage = user.package;
    
    const updateData = {
      package: newPackage,
    };
    
    if (newPackage !== 'free') {
      updateData.packageActivatedAt = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      updateData.packageExpiresAt = expiryDate;
    } else {
      updateData.packageActivatedAt = null;
      updateData.packageExpiresAt = null;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password -salt' }
    );
    
    let stats = await Stats.findById('global-stats');
    if (!stats) {
      stats = await Stats.create({ _id: 'global-stats', paidUserCount: 0 });
    }
    
    if (oldPackage === 'free' && newPackage !== 'free') {
      stats.paidUserCount += 1;
    } else if (oldPackage !== 'free' && newPackage === 'free') {
      stats.paidUserCount = Math.max(0, stats.paidUserCount - 1);
    }
    
    stats.lastUpdated = new Date();
    await stats.save();
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
      paidUserCount: stats.paidUserCount,
    });
  } catch (error) {
    console.error('Update user package error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

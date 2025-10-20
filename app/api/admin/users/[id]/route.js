import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../../lib/middleware/adminAuth';
import User from '../../../../../lib/models/user.model';
import Stats from '../../../../../lib/models/stats.model';

// DELETE - Delete user (only if they don't have an active plan)
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

// PATCH - Update user package
export async function PATCH(req, { params }) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const userId = params.id;
    const body = await req.json();
    const { package: newPackage } = body;
    
    // Validate package
    if (!['free', 'basic', 'plus'].includes(newPackage)) {
      return NextResponse.json(
        { success: false, error: 'Invalid package type' },
        { status: 400 }
      );
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const oldPackage = user.package;
    
    // Update user package
    const updateData = {
      package: newPackage,
    };
    
    // If changing to a paid package, set activation date and expiry (1 year)
    if (newPackage !== 'free') {
      updateData.packageActivatedAt = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      updateData.packageExpiresAt = expiryDate;
    } else {
      // If changing to free, remove dates
      updateData.packageActivatedAt = null;
      updateData.packageExpiresAt = null;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password -salt' }
    );
    
    // Update paid user count
    let stats = await Stats.findById('global-stats');
    if (!stats) {
      stats = await Stats.create({ _id: 'global-stats', paidUserCount: 0 });
    }
    
    // Adjust paid user count based on package change
    if (oldPackage === 'free' && newPackage !== 'free') {
      // User upgraded to paid
      stats.paidUserCount += 1;
    } else if (oldPackage !== 'free' && newPackage === 'free') {
      // User downgraded to free
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

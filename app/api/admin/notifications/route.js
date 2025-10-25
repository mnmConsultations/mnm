/**
 * Admin Custom Notifications API
 * /api/admin/notifications
 * 
 * Admin-only endpoint for sending custom notifications to users
 * Allows admin to broadcast messages or send targeted notifications
 * 
 * Features:
 * - Send to all users or specific users
 * - Custom title, message, type, and priority
 * - Optional action URL
 * - Respects 7-day TTL
 * 
 * Security: Requires admin authentication
 */
import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import { verifyAdminAuth } from '../../../../lib/middleware/adminAuth';
import Notification from '../../../../lib/models/notification.model';
import User from '../../../../lib/models/user.model';
import { sanitizeUrl, sanitizeString } from '../../../../lib/utils/sanitize';

/**
 * Send Custom Notification
 * POST /api/admin/notifications
 * 
 * Request body:
 * {
 *   title: string (required, max 100 chars)
 *   message: string (required, max 500 chars)
 *   type: 'info' | 'success' | 'warning' | 'error' | 'update' (default: 'info')
 *   priority: 'low' | 'medium' | 'high' (default: 'medium')
 *   actionUrl: string (optional)
 *   targetUserIds: string[] (optional - if not provided, sends to all users)
 * }
 * 
 * Sends notification to:
 * - All regular users (if targetUserIds not provided)
 * - Specific users (if targetUserIds array provided)
 * - Never sends to admins
 */
export async function POST(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const body = await req.json();
    const { 
      title, 
      message, 
      type = 'info',
      priority = 'medium',
      actionUrl,
      targetUserIds
    } = body;
    
    // Validation
    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const sanitizedTitle = sanitizeString(title, 100);
    const sanitizedMessage = sanitizeString(message, 500);
    
    if (sanitizedTitle.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Title must be 100 characters or less' },
        { status: 400 }
      );
    }
    
    if (sanitizedMessage.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Message must be 500 characters or less' },
        { status: 400 }
      );
    }
    
    // SECURITY FIX: Validate actionUrl to prevent open redirects
    let validatedActionUrl = undefined;
    if (actionUrl) {
      // Allow only internal URLs (relative paths) or specific whitelisted domains
      const allowedDomains = [
        process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, ''),
        'localhost',
        '127.0.0.1'
      ].filter(Boolean);
      
      validatedActionUrl = sanitizeUrl(actionUrl, allowedDomains);
      
      if (!validatedActionUrl) {
        return NextResponse.json(
          { success: false, error: 'Invalid or unauthorized action URL' },
          { status: 400 }
        );
      }
    }
    
    const validTypes = ['info', 'success', 'warning', 'error', 'update'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification type' },
        { status: 400 }
      );
    }
    
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority level' },
        { status: 400 }
      );
    }
    
    // Get target users
    let users;
    if (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      // Send to specific users
      users = await User.find({
        _id: { $in: targetUserIds },
        role: 'user' // Ensure we only send to regular users
      });
      
      if (users.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid users found with provided IDs' },
          { status: 404 }
        );
      }
    } else {
      // Send to all regular users
      users = await User.find({ role: 'user' });
      
      if (users.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No users found to notify' },
          { status: 404 }
        );
      }
    }
    
    // Create notifications for all target users
    const notifications = users.map(user => ({
      userId: user._id,
      title: sanitizedTitle,
      message: sanitizedMessage,
      type,
      priority,
      actionUrl: validatedActionUrl,
      metadata: {
        entityType: 'custom',
        action: 'admin_message',
        changes: []
      }
    }));
    
    const createdNotifications = await Notification.insertMany(notifications);
    
    return NextResponse.json({
      success: true,
      message: `Notification sent to ${users.length} user(s)`,
      notificationsSent: createdNotifications.length,
      recipients: users.map(u => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email
      }))
    }, { status: 201 });
    
  } catch (error) {
    console.error('Send custom notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

/**
 * Get All Users (for targeting)
 * GET /api/admin/notifications
 * 
 * Returns list of all regular users for admin to choose recipients
 */
export async function GET(req) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(req);
    
    await connectDB();
    
    const users = await User.find({ role: 'user' })
      .select('_id firstName lastName email package')
      .sort({ firstName: 1, lastName: 1 });
    
    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        package: u.package
      }))
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Admin') ? 403 : 500 }
    );
  }
}

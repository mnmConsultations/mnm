/**
 * Dashboard Notifications API
 * /api/dashboard/notifications
 * 
 * User notification management endpoints
 * Handles fetching, creating, and marking notifications as read
 * 
 * Features:
 * - Fetch user notifications with filters
 * - Create new notifications
 * - Mark notifications as read/unread
 * - Auto-filter expired notifications
 * 
 * Authentication:
 * - getUserFromToken helper supports Bearer token and cookies
 * - User-scoped queries (only see own notifications)
 * 
 * GET /api/dashboard/notifications
 * Query params:
 * - limit (default: 10): Number of notifications to return
 * - unreadOnly (default: false): Filter only unread notifications
 * 
 * Response includes:
 * - notifications: Array of notification objects
 * - unreadCount: Total count of unread notifications
 * 
 * Expiration Filtering:
 * - Automatically excludes expired notifications (expiresAt < now)
 * - Includes notifications with no expiry date
 * 
 * POST /api/dashboard/notifications
 * Request body: { title, message, type?, priority?, actionRequired?, actionUrl?, expiresAt? }
 * Creates new notification for current user
 * 
 * PATCH /api/dashboard/notifications
 * Request body: { notificationId, isRead }
 * Updates notification read status
 * Only updates user's own notifications
 * 
 * Security: User authentication required for all endpoints
 */
import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Notification from '@/lib/models/notification.model';
import User from '@/lib/models/user.model';
import jwt from 'jsonwebtoken';
import { checkAndUpdatePackageExpiry } from '@/lib/middleware/packageExpiryCheck';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

async function getUserFromToken(request) {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Fallback to cookie
      token = request.cookies.get('token')?.value;
    }
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    // The token payload uses _id, not userId
    const user = await User.findById(decoded._id);
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    let user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check and update package expiry (only for users, not admins)
    user = await checkAndUpdatePackageExpiry(user);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 15;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    await connectDB();
    
    const query = { userId: user._id };
    
    // Don't filter by isRead if unreadOnly is false - we want all notifications
    // But we'll mark unread status based on lastNotificationReadAt
    if (unreadOnly) {
      // Only show notifications created after last read time
      if (user.lastNotificationReadAt) {
        query.createdAt = { $gt: user.lastNotificationReadAt };
      } else {
        // If never read, all notifications are unread
        query.isRead = false;
      }
    }

    // Note: TTL index automatically removes documents after 7 days
    // No need to filter by expiresAt since MongoDB handles it
    
    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    // Mark notifications as read based on lastNotificationReadAt
    const now = new Date();
    const lastReadAt = user.lastNotificationReadAt || new Date(0);
    
    const notificationsWithReadStatus = notifications.map(notif => ({
      ...notif.toObject(),
      isRead: notif.createdAt <= lastReadAt,
    }));

    // Count unread notifications (created after lastNotificationReadAt)
    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      createdAt: { $gt: lastReadAt }
    });

    // Update lastNotificationReadAt to current time (mark all as read up to now)
    await User.findByIdAndUpdate(user._id, {
      lastNotificationReadAt: now
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications: notificationsWithReadStatus,
        unreadCount,
        totalCount,
        lastReadAt: now,
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    let user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check and update package expiry (only for users, not admins)
    user = await checkAndUpdatePackageExpiry(user);

    const body = await request.json();
    const { title, message, type, priority, actionRequired, actionUrl, expiresAt } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const notification = new Notification({
      userId: user._id,
      title,
      message,
      type: type || 'info',
      priority: priority || 'medium',
      actionRequired: actionRequired || false,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
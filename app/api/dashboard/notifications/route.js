import { NextResponse } from 'next/server';
import connectDB from '@/lib/utils/db';
import Notification from '@/lib/models/notification.model';
import User from '@/lib/models/user.model';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

async function getUserFromToken(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    await connectDB();
    
    const query = { userId: user._id };
    if (unreadOnly) {
      query.isRead = false;
    }

    // Add expiration filter
    const now = new Date();
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ];
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount
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
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

export async function PATCH(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: user._id },
      { isRead: isRead !== undefined ? isRead : true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
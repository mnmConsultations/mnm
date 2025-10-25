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

export async function POST(request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Create some demo notifications for the user
    const demoNotifications = [
      {
        userId: user._id,
        title: "Welcome to M&M Consultants!",
        message: "Thank you for choosing our relocation services. Your journey to Germany starts here!",
        type: "success",
        priority: "high",
        actionRequired: false
      },
      {
        userId: user._id,
        title: "Document Reminder",
        message: "Don't forget to prepare your essential documents for your Germany relocation. Check your tasks for details.",
        type: "warning",
        priority: "medium",
        actionRequired: true,
        actionUrl: "/dashboard/user"
      },
      {
        userId: user._id,
        title: "New Task Available",
        message: "A new task has been added to your relocation checklist. Complete it to track your progress.",
        type: "info",
        priority: "medium",
        actionRequired: false
      }
    ];

    // Clear existing notifications for demo purposes (optional)
    await Notification.deleteMany({ userId: user._id });

    // Insert demo notifications
    const createdNotifications = await Notification.insertMany(demoNotifications);

    return NextResponse.json({
      success: true,
      message: 'Demo notifications created successfully',
      data: createdNotifications
    });

  } catch (error) {
    console.error('Error creating demo notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
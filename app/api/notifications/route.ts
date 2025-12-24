import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { userId, read: false } })
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, link } = body;

    if (!userId || !title || !message || !type) {
      return NextResponse.json({
        success: false,
        message: 'userId, title, message, and type are required'
      }, { status: 400 });
    }

    // Validate notification type
    const validTypes = ['ORDER', 'SERVICE', 'MESSAGE', 'PAYMENT', 'SYSTEM'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        message: `Invalid notification type. Must be one of: ${validTypes.join(', ')}`
      }, { status: 400 });
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null,
        read: false,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      notification
    }, { status: 201 });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationIds, markAll } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'userId is required'
      }, { status: 400 });
    }

    let result;

    if (markAll) {
      // Mark all notifications as read for this user
      result = await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      result = await db.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
          read: false
        },
        data: { read: true }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Either markAll=true or notificationIds array is required'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
      count: result.count
    });

  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'userId is required'
      }, { status: 400 });
    }

    let result;

    if (deleteAll) {
      // Delete all notifications for this user
      result = await db.notification.deleteMany({
        where: { userId }
      });
    } else if (notificationId) {
      // Delete specific notification
      result = await db.notification.delete({
        where: { id: notificationId, userId }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Either deleteAll=true or notificationId is required'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification(s) deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

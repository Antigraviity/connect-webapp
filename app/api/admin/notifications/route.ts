import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST - Admin send notifications to multiple users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      notificationType,
      recipientType,
      selectedRecipients,
      targetUserTypes,
      priority,
      channels,
    } = body;

    // Validation
    if (!title || !message || !notificationType) {
      return NextResponse.json({
        success: false,
        message: 'Title, message, and notification type are required'
      }, { status: 400 });
    }

    // Map notification type to database enum
    const typeMap: any = {
      'announcement': 'SYSTEM',
      'alert': 'SYSTEM',
      'promotion': 'SYSTEM',
      'reminder': 'SYSTEM',
      'booking': 'ORDER',
      'payment': 'PAYMENT',
      'job': 'SERVICE',
      'system': 'SYSTEM',
    };

    const dbType = typeMap[notificationType] || 'SYSTEM';

    // Get recipient user IDs based on selection
    let recipientUserIds: string[] = [];

    if (recipientType === 'individual') {
      // Selected specific users
      recipientUserIds = selectedRecipients.map((r: any) => r.id);
    } else if (recipientType === 'group') {
      // Get users by type
      const userTypeConditions = targetUserTypes.map((type: string) => ({ userType: type }));
      
      const users = await db.user.findMany({
        where: {
          OR: userTypeConditions
        },
        select: { id: true }
      });
      
      recipientUserIds = users.map(u => u.id);
    } else if (recipientType === 'broadcast') {
      // Get all users
      const users = await db.user.findMany({
        select: { id: true }
      });
      
      recipientUserIds = users.map(u => u.id);
    }

    if (recipientUserIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No recipients found'
      }, { status: 400 });
    }

    // Create notifications for all recipients
    const notifications = await db.notification.createMany({
      data: recipientUserIds.map(userId => ({
        userId,
        title,
        message,
        type: dbType,
        read: false,
      }))
    });

    // Log the send activity
    console.log(`Admin sent ${notifications.count} notifications: ${title}`);

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${notifications.count} recipients`,
      data: {
        count: notifications.count,
        recipientCount: recipientUserIds.length,
        title,
        type: dbType,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin send notification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Admin get all notifications (for monitoring)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type && type !== 'all') {
      where.type = type;
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              userType: true,
            }
          }
        }
      }),
      db.notification.count({ where })
    ]);

    // Calculate stats
    const stats = {
      total: total,
      read: await db.notification.count({ where: { ...where, read: true } }),
      unread: await db.notification.count({ where: { ...where, read: false } }),
    };

    return NextResponse.json({
      success: true,
      notifications,
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin get notifications error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Admin delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');

    if (!notificationId) {
      return NextResponse.json({
        success: false,
        message: 'notificationId is required'
      }, { status: 400 });
    }

    await db.notification.delete({
      where: { id: notificationId }
    });

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete notification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

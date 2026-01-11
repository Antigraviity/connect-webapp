import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const adminToken = request.cookies.get('adminToken')?.value;

        if (!adminToken) {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized'
            }, { status: 401 });
        }

        // Verify the token
        const decoded = jwt.verify(adminToken, JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
            isAdmin: boolean;
        };

        if (!decoded.isAdmin || decoded.role !== 'ADMIN') {
            return NextResponse.json({
                success: false,
                message: 'Invalid authorization'
            }, { status: 401 });
        }

        // Get unread notifications for this admin
        const notifications = await db.notification.findMany({
            where: {
                userId: decoded.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20, // Only show latest 20 in the dropdown
        });

        const unreadCount = await db.notification.count({
            where: {
                userId: decoded.userId,
                read: false,
            },
        });

        return NextResponse.json({
            success: true,
            notifications,
            unreadCount,
        });

    } catch (error) {
        console.error('Admin unread notifications error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
    try {
        const adminToken = request.cookies.get('adminToken')?.value;

        if (!adminToken) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(adminToken, JWT_SECRET) as {
            userId: string;
            isAdmin: boolean;
            role: string;
        };

        if (!decoded.isAdmin || decoded.role !== 'ADMIN') {
            return NextResponse.json({ success: false, message: 'Invalid authorization' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId, all } = body;

        if (all) {
            await db.notification.updateMany({
                where: {
                    userId: decoded.userId,
                    read: false,
                },
                data: {
                    read: true,
                },
            });
        } else if (notificationId) {
            await db.notification.update({
                where: {
                    id: notificationId,
                    userId: decoded.userId,
                },
                data: {
                    read: true,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Notifications updated successfully',
        });

    } catch (error) {
        console.error('Admin mark notifications error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update notifications',
        }, { status: 500 });
    }
}

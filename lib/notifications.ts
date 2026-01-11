import db from './db';
import { NotificationType } from '@prisma/client';

/**
 * Creates a notification for a specific user
 */
export async function createUserNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'SYSTEM',
    link: string | null = null
) {
    try {
        const notification = await db.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
                read: false,
            },
        });
        return notification;
    } catch (error) {
        console.error('Error creating user notification:', error);
        return null;
    }
}

/**
 * Creates a notification for all users with the ADMIN role
 */
export async function createAdminNotification(
    title: string,
    message: string,
    type: NotificationType = 'SYSTEM',
    link: string | null = null
) {
    try {
        // Find all admin users
        const admins = await db.user.findMany({
            where: {
                role: 'ADMIN',
            },
            select: {
                id: true,
            },
        });

        if (admins.length === 0) {
            console.warn('No admin users found to notify');
            return [];
        }

        // Create notifications for all admins
        const notifications = await Promise.all(
            admins.map((admin) =>
                db.notification.create({
                    data: {
                        userId: admin.id,
                        title,
                        message,
                        type,
                        link,
                        read: false,
                    },
                })
            )
        );

        return notifications;
    } catch (error) {
        console.error('Error creating admin notifications:', error);
        return [];
    }
}

/**
 * Marks all notifications as read for a specific user
 */
export async function markAllNotificationsAsRead(userId: string) {
    try {
        return await db.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return null;
    }
}

/**
 * Marks a specific notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
    try {
        return await db.notification.update({
            where: {
                id: notificationId,
                userId, // Security check
            },
            data: {
                read: true,
            },
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return null;
    }
}

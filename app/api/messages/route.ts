import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Helper function to create notification
async function createMessageNotification(
  receiverId: string,
  senderName: string,
  messageContent: string,
  messageType: string
) {
  try {
    // Truncate message content for notification
    const truncatedContent = messageContent.length > 50 
      ? messageContent.substring(0, 50) + '...' 
      : messageContent;

    // Determine the link based on message type
    let link = '/vendor/messages';
    let title = 'New Message';
    
    if (messageType === 'PRODUCT') {
      link = '/vendor/messages/products';
      title = 'New Product Message';
    } else if (messageType === 'SERVICE') {
      link = '/vendor/messages/services';
      title = 'New Service Message';
    } else if (messageType === 'JOB') {
      link = '/employer/messages';
      title = 'New Job Message';
    }

    await db.notification.create({
      data: {
        userId: receiverId,
        title: title,
        message: `${senderName}: ${truncatedContent}`,
        type: 'MESSAGE',
        link: link,
        read: false,
      }
    });
  } catch (error) {
    console.error('Failed to create message notification:', error);
    // Don't throw - notification failure shouldn't break message sending
  }
}

// GET - Fetch messages/conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const otherUserId = searchParams.get('otherUserId');
    const conversationList = searchParams.get('conversationList');
    const messageType = searchParams.get('type'); // SERVICE, PRODUCT, or JOB

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Build type filter
    const typeFilter = messageType ? { type: messageType } : {};

    // If requesting conversation list
    if (conversationList === 'true') {
      // Get all unique conversations for this user, filtered by type if specified
      const sentMessages = await db.message.findMany({
        where: { senderId: userId, ...typeFilter },
        select: { receiverId: true, type: true },
        distinct: ['receiverId']
      });

      const receivedMessages = await db.message.findMany({
        where: { receiverId: userId, ...typeFilter },
        select: { senderId: true, type: true },
        distinct: ['senderId']
      });

      // Get unique user IDs
      const userIds = new Set<string>();
      sentMessages.forEach(m => userIds.add(m.receiverId));
      receivedMessages.forEach(m => userIds.add(m.senderId));

      // Get conversation details for each user
      const conversations = await Promise.all(
        Array.from(userIds).map(async (otherUserId) => {
          // Get the other user's details
          const otherUser = await db.user.findUnique({
            where: { id: otherUserId },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              userType: true,
              role: true,
            }
          });

          // Get the last message (filtered by type if specified)
          const lastMessage = await db.message.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: otherUserId, ...typeFilter },
                { senderId: otherUserId, receiverId: userId, ...typeFilter }
              ]
            },
            orderBy: { createdAt: 'desc' }
          });

          // Get unread count (filtered by type if specified)
          const unreadCount = await db.message.count({
            where: {
              senderId: otherUserId,
              receiverId: userId,
              read: false,
              ...typeFilter
            }
          });

          // Get any booking/order between these users
          const relatedBooking = await db.order.findFirst({
            where: {
              OR: [
                { buyerId: userId, sellerId: otherUserId },
                { buyerId: otherUserId, sellerId: userId }
              ]
            },
            include: {
              service: {
                select: { id: true, title: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          });

          return {
            id: otherUserId,
            user: otherUser,
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              attachment: lastMessage.attachment,
              createdAt: lastMessage.createdAt,
              isFromMe: lastMessage.senderId === userId
            } : null,
            unreadCount,
            relatedBooking: relatedBooking ? {
              id: relatedBooking.id,
              orderNumber: relatedBooking.orderNumber,
              serviceName: relatedBooking.service?.title
            } : null
          };
        })
      );

      // Sort by last message date
      conversations.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
      });

      return NextResponse.json({
        success: true,
        conversations
      });
    }

    // If requesting messages between two users
    if (otherUserId) {
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId, ...typeFilter },
            { senderId: otherUserId, receiverId: userId, ...typeFilter }
          ]
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: { id: true, name: true, image: true }
          },
          receiver: {
            select: { id: true, name: true, image: true }
          }
        }
      });

      // Mark messages as read (filtered by type if specified)
      await db.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          read: false,
          ...typeFilter
        },
        data: { read: true }
      });

      // Get other user details
      const otherUser = await db.user.findUnique({
        where: { id: otherUserId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          userType: true,
          role: true,
        }
      });

      return NextResponse.json({
        success: true,
        messages,
        otherUser
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Please provide otherUserId or set conversationList=true'
    }, { status: 400 });

  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch messages',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content, attachment, type, orderId } = body;

    if (!senderId || !receiverId) {
      return NextResponse.json({
        success: false,
        message: 'senderId and receiverId are required'
      }, { status: 400 });
    }

    if (!content && !attachment) {
      return NextResponse.json({
        success: false,
        message: 'Either content or attachment is required'
      }, { status: 400 });
    }

    // Validate message type
    const validTypes = ['SERVICE', 'PRODUCT', 'JOB'];
    const messageType = type && validTypes.includes(type) ? type : 'SERVICE';

    // Get sender's name for notification
    const sender = await db.user.findUnique({
      where: { id: senderId },
      select: { name: true }
    });

    // Create the message
    const message = await db.message.create({
      data: {
        senderId,
        receiverId,
        content: content || '',
        attachment: attachment ? JSON.stringify(attachment) : null,
        type: messageType,
        orderId: orderId || null,
        read: false
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        },
        receiver: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    // Create notification for the receiver
    await createMessageNotification(
      receiverId,
      sender?.name || 'Someone',
      content || 'Sent an attachment',
      messageType
    );

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: message
    }, { status: 201 });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, otherUserId } = body;

    if (!userId || !otherUserId) {
      return NextResponse.json({
        success: false,
        message: 'userId and otherUserId are required'
      }, { status: 400 });
    }

    // Mark all messages from otherUser as read
    const result = await db.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        read: false
      },
      data: { read: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
      count: result.count
    });

  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

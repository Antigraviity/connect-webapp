import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch conversations or messages for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationWith = searchParams.get('conversationWith');
    const otherUserId = searchParams.get('otherUserId'); // Alternative param name
    const conversationList = searchParams.get('conversationList');
    const type = searchParams.get('type') || 'SERVICE';

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    const otherUser = conversationWith || otherUserId;

    // If otherUser is provided, get messages between two users
    if (otherUser) {
      const messages = await db.message.findMany({
        where: {
          type,
          deleted: false,
          OR: [
            { senderId: userId, receiverId: otherUser },
            { senderId: otherUser, receiverId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Mark messages as read
      await db.message.updateMany({
        where: {
          senderId: otherUser,
          receiverId: userId,
          read: false
        },
        data: {
          read: true
        }
      });

      return NextResponse.json({
        success: true,
        messages: (messages as any[]).map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          receiver: msg.receiver,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          read: msg.read,
          createdAt: msg.createdAt,
          timestamp: formatTime(msg.createdAt),
          isMine: msg.senderId === userId,
          orderId: msg.orderId,
          attachment: msg.attachment,
          replyTo: msg.replyTo,
          reactions: msg.reactions ? (typeof msg.reactions === 'string' ? JSON.parse(msg.reactions) : msg.reactions) : [],
        }))
      });
    }

    // Get all conversations (grouped by other user)
    const sentMessages = await db.message.findMany({
      where: {
        senderId: userId,
        type,
        deleted: false
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            userType: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const receivedMessages = await db.message.findMany({
      where: {
        receiverId: userId,
        type,
        deleted: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            userType: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Build conversations list - use Map to group by other user
    const conversationsMap = new Map();

    // Process sent messages
    sentMessages.forEach(msg => {
      const otherUserId = msg.receiverId;
      const existing = conversationsMap.get(otherUserId);

      if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
        conversationsMap.set(otherUserId, {
          id: otherUserId,
          otherUser: msg.receiver,
          user: msg.receiver, // Alias for buyer page compatibility
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          lastMessageObj: {
            content: msg.content,
            attachment: msg.attachment,
            createdAt: msg.createdAt,
            isFromMe: true,
          },
          unreadCount: existing?.unreadCount || 0,
          orderId: msg.orderId,
        });
      }
    });

    // Process received messages
    receivedMessages.forEach(msg => {
      const otherUserId = msg.senderId;
      const existing = conversationsMap.get(otherUserId);

      if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
        conversationsMap.set(otherUserId, {
          id: otherUserId,
          otherUser: msg.sender,
          user: msg.sender, // Alias for buyer page compatibility
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          lastMessageObj: {
            content: msg.content,
            attachment: msg.attachment,
            createdAt: msg.createdAt,
            isFromMe: false,
          },
          unreadCount: (existing?.unreadCount || 0) + (msg.read ? 0 : 1),
          orderId: msg.orderId,
        });
      } else if (!msg.read) {
        existing.unreadCount = (existing.unreadCount || 0) + 1;
      }
    });

    // Get service/order info for each conversation
    const conversations = await Promise.all(
      Array.from(conversationsMap.values()).map(async (conv) => {
        let serviceInfo = null;
        let orderInfo = null;
        let jobInfo = null;

        if (conv.orderId) {
          if (type === 'JOB') {
            const job = await db.job.findUnique({
              where: { id: conv.orderId }
            });
            if (job) {
              jobInfo = {
                id: job.id,
                title: job.title,
                slug: job.slug
              };
            }
          } else {
            const order = await db.order.findUnique({
              where: { id: conv.orderId },
              include: {
                service: {
                  select: {
                    id: true,
                    title: true,
                  }
                }
              }
            });
            if (order) {
              orderInfo = {
                id: order.id,
                orderNumber: order.orderNumber,
                serviceName: order.service?.title,
              };
              serviceInfo = order.service;
            }
          }
        }

        return {
          ...conv,
          service: serviceInfo,
          order: orderInfo,
          job: jobInfo,
          relatedBooking: orderInfo, // Alias for buyer page compatibility
          relatedJob: jobInfo, // Alias for job page compatibility
          time: formatRelativeTime(conv.lastMessageTime),
          lastMessage: conv.lastMessageObj, // For buyer page format
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );

    return NextResponse.json({
      success: true,
      conversations
    });

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
    const { senderId, receiverId, content, type = 'SERVICE', orderId, attachment } = body;

    if (!senderId || !receiverId) {
      return NextResponse.json({
        success: false,
        message: 'Sender ID and Receiver ID are required'
      }, { status: 400 });
    }

    if (!content && !attachment) {
      return NextResponse.json({
        success: false,
        message: 'Message content or attachment is required'
      }, { status: 400 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        senderId,
        receiverId,
        content: content || '',
        type,
        orderId: orderId || null,
        attachment: attachment ? (typeof attachment === 'string' ? attachment : JSON.stringify(attachment)) : null,
        replyToId: body.replyToId || null,
        read: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    // Create notification for receiver
    try {
      // Fetch receiver's user information to determine their role
      const receiver = await db.user.findUnique({
        where: { id: receiverId },
        select: { role: true, userType: true }
      });

      // Generate the correct notification link based on receiver's role and message type
      let notificationLink = '/messages'; // Default fallback

      const userType = receiver?.userType;
      const userRole = receiver?.role;

      // Determine destination based on user type or role
      let destination = 'BUYER'; // Default
      if (userType === 'SELLER' || userRole === 'SELLER') {
        destination = 'SELLER';
      } else if (userType === 'EMPLOYER') {
        destination = 'EMPLOYER';
      } else if (userRole === 'ADMIN') {
        destination = 'ADMIN';
      } else if (userType === 'BUYER' || userRole === 'USER') {
        destination = 'BUYER';
      }

      switch (destination) {
        case 'BUYER':
          // Buyer dashboard links
          if (type === 'SERVICE') {
            notificationLink = `/buyer/messages/services?conversationWith=${senderId}&chat=${senderId}&messageId=${message.id}`;
          } else if (type === 'PRODUCT') {
            notificationLink = `/buyer/messages/products?customerId=${senderId}&chat=${senderId}&messageId=${message.id}`;
          } else if (type === 'JOB') {
            notificationLink = `/buyer/messages/jobs?chat=${senderId}&messageId=${message.id}`;
          } else {
            notificationLink = `/buyer/messages/services?conversationWith=${senderId}&chat=${senderId}&messageId=${message.id}`;
          }
          break;

        case 'SELLER':
          // Vendor/Seller dashboard links
          if (type === 'SERVICE') {
            notificationLink = `/vendor/messages/services?conversationWith=${senderId}&chat=${senderId}&messageId=${message.id}`;
          } else if (type === 'PRODUCT') {
            notificationLink = `/vendor/messages/products?customerId=${senderId}&chat=${senderId}&messageId=${message.id}`;
          } else {
            notificationLink = `/vendor/messages/services?conversationWith=${senderId}&chat=${senderId}&messageId=${message.id}`;
          }
          break;

        case 'EMPLOYER':
          notificationLink = `/company/messages?chat=${senderId}&messageId=${message.id}`;
          break;

        case 'ADMIN':
          notificationLink = `/admin/messages?chat=${senderId}&messageId=${message.id}`;
          break;

        default:
          if (type === 'JOB') {
            notificationLink = `/company/messages?chat=${senderId}&messageId=${message.id}`;
          } else {
            notificationLink = `/messages?chat=${senderId}&messageId=${message.id}`;
          }
      }

      await db.notification.create({
        data: {
          userId: receiverId,
          title: 'New Message',
          message: `${message.sender.name}: ${(content || 'Sent an attachment').substring(0, 50)}${(content || '').length > 50 ? '...' : ''}`,
          type: 'MESSAGE',
          link: notificationLink
        }
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    const responseMessage = {
      id: message.id,
      content: message.content,
      sender: (message as any).sender,
      receiver: (message as any).receiver,
      senderId: message.senderId,
      receiverId: message.receiverId,
      read: message.read,
      createdAt: message.createdAt,
      timestamp: formatTime(message.createdAt),
      isMine: true,
      orderId: message.orderId,
      attachment: message.attachment,
      replyTo: (message as any).replyTo,
      reactions: [],
    };

    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: responseMessage, // Alias for buyer page compatibility
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH - Update message (add reaction)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, emoji } = body;

    if (!messageId || !emoji) {
      return NextResponse.json({ success: false, message: 'Message ID and emoji are required' }, { status: 400 });
    }

    const message = await db.message.findUnique({
      where: { id: messageId },
      select: { reactions: true }
    });

    if (!message) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }

    let reactions: string[] = [];
    if (message.reactions) {
      try {
        reactions = JSON.parse(message.reactions);
      } catch (e) {
        reactions = [];
      }
    }

    // Add emoji if not already present (or allow duplicates for multiple users - let's allow duplicates for now)
    reactions.push(emoji);

    const updatedMessage = await db.message.update({
      where: { id: messageId },
      data: {
        reactions: JSON.stringify(reactions)
      }
    });

    return NextResponse.json({
      success: true,
      reactions
    });

  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add reaction'
    }, { status: 500 });
  }
}

// DELETE - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({
        success: false,
        message: 'Message ID is required'
      }, { status: 400 });
    }

    await db.message.update({
      where: { id: messageId },
      data: {
        deleted: true,
        deletedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete message',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to format time
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

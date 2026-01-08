import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch product-related conversations for a vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const customerId = searchParams.get('customerId');

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Seller ID is required'
      }, { status: 400 });
    }

    // If customerId is provided, get messages for that specific conversation
    if (customerId) {
      const messages = await db.message.findMany({
        where: {
          type: 'PRODUCT',
          deleted: false,
          OR: [
            { senderId: sellerId, receiverId: customerId },
            { senderId: customerId, receiverId: sellerId }
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
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Mark messages as read
      await db.message.updateMany({
        where: {
          senderId: customerId,
          receiverId: sellerId,
          type: 'PRODUCT',
          read: false
        },
        data: {
          read: true
        }
      });

      // Get order info if available (using Order model instead of ProductOrder)
      let orderInfo = null;
      const firstMsgWithOrder = messages.find(m => m.orderId);
      if (firstMsgWithOrder?.orderId) {
        try {
          const order = await db.order.findUnique({
            where: { id: firstMsgWithOrder.orderId },
            include: {
              service: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                }
              }
            }
          });

          if (order) {
            orderInfo = {
              id: order.id,
              orderNumber: order.orderNumber,
              products: [{
                name: order.service?.title || 'Product',
                image: order.service?.images ? JSON.parse(order.service.images)[0] : null,
              }]
            };
          }
        } catch (e) {
          console.log('Could not fetch order info');
        }
      }

      return NextResponse.json({
        success: true,
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          sender: msg.senderId === sellerId ? 'me' : 'customer',
          timestamp: formatTime(msg.createdAt),
          createdAt: msg.createdAt,
          read: msg.read,
          attachment: msg.attachment ? JSON.parse(msg.attachment as string) : null,
        })),
        orderInfo
      });
    }

    // Get all product-related messages for this vendor
    const sentMessages = await db.message.findMany({
      where: {
        senderId: sellerId,
        type: 'PRODUCT',
        deleted: false
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const receivedMessages = await db.message.findMany({
      where: {
        receiverId: sellerId,
        type: 'PRODUCT',
        deleted: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group messages by customer
    const conversationsMap = new Map<string, any>();

    // Process sent messages
    sentMessages.forEach(msg => {
      const recipientId = msg.receiverId;
      const existing = conversationsMap.get(recipientId);

      if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
        conversationsMap.set(recipientId, {
          id: recipientId,
          customer: {
            id: msg.receiver.id,
            name: msg.receiver.name || 'Customer',
            avatar: getInitials(msg.receiver.name || 'C'),
            image: msg.receiver.image,
          },
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unread: existing?.unread || 0,
          orderId: msg.orderId,
          online: false,
        });
      }
    });

    // Process received messages
    receivedMessages.forEach(msg => {
      const senderId = msg.senderId;
      const existing = conversationsMap.get(senderId);

      if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
        conversationsMap.set(senderId, {
          id: senderId,
          customer: {
            id: msg.sender.id,
            name: msg.sender.name || 'Customer',
            avatar: getInitials(msg.sender.name || 'C'),
            image: msg.sender.image,
          },
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unread: (existing?.unread || 0) + (msg.read ? 0 : 1),
          orderId: msg.orderId,
          online: false,
        });
      } else if (!msg.read) {
        existing.unread = (existing.unread || 0) + 1;
      }
    });

    // Get order info for each conversation
    const conversations = await Promise.all(
      Array.from(conversationsMap.values()).map(async (conv) => {
        let productInfo = null;
        let orderInfo = null;

        if (conv.orderId) {
          try {
            const order = await db.order.findUnique({
              where: { id: conv.orderId },
              include: {
                service: {
                  select: {
                    id: true,
                    title: true,
                    images: true,
                  }
                }
              }
            });

            if (order) {
              productInfo = {
                name: order.service?.title || 'Product',
                image: order.service?.images ? JSON.parse(order.service.images)[0] : null,
              };
              orderInfo = {
                id: order.id,
                orderNumber: order.orderNumber,
              };
            }
          } catch (e) {
            console.log('Could not fetch order for conversation');
          }
        }

        return {
          ...conv,
          product: productInfo?.name || 'Product Inquiry',
          productImage: productInfo?.image || null,
          orderId: orderInfo?.orderNumber || null,
          orderDbId: orderInfo?.id || conv.orderId,
          time: formatRelativeTime(conv.lastMessageTime),
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
    console.error('Fetch product messages error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch messages',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Send a new product message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content, orderId, attachment } = body;

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
        type: 'PRODUCT',
        orderId: orderId || null,
        attachment: attachment ? JSON.stringify(attachment) : null,
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
        }
      }
    });

    // Create notification for receiver
    try {
      await db.notification.create({
        data: {
          userId: receiverId,
          title: 'New Product Message',
          message: `${message.sender.name}: ${(content || 'Sent an attachment').substring(0, 50)}${(content || '').length > 50 ? '...' : ''}`,
          type: 'MESSAGE',
          link: `/buyer/messages/products?customerId=${senderId}&chat=${senderId}&messageId=${message.id}`
        }
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        receiverId: message.receiverId,
        sender: 'me',
        timestamp: formatTime(message.createdAt),
        createdAt: message.createdAt,
        read: message.read,
        attachment: attachment || null,
      }
    });

  } catch (error) {
    console.error('Send product message error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


// DELETE - Delete a product message
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
    console.error('Delete product message error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete message',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to get initials
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
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

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// GET - Fetch messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch messages
    const messages = await prisma.jobMessage.findMany({
      where: {
        conversationId,
        deleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
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
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read if the fetching user is NOT the sender
    await prisma.jobMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
        deleted: false,
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      messages: (messages as any[]).map(msg => {
        let attachment = null;
        if (msg.attachments) {
          try {
            const parsed = JSON.parse(msg.attachments);
            if (Array.isArray(parsed) && parsed.length > 0) {
              attachment = parsed[0];
            } else if (typeof parsed === 'object' && parsed !== null) {
              attachment = parsed;
            }
          } catch (e) {
            console.error('Error parsing attachments', e);
          }
        }

        return {
          ...msg,
          attachment,
          reactions: msg.reactions ? (typeof msg.reactions === 'string' ? JSON.parse(msg.reactions) : msg.reactions) : []
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const body = await request.json();
    const { userId, content, attachments, attachment, replyToId } = body;

    if (!userId || (!content && !attachments && !attachment)) {
      return NextResponse.json(
        { success: false, message: 'User ID and content/attachments are required' },
        { status: 400 }
      );
    }

    // Handle both singular 'attachment' and plural 'attachments'
    let finalAttachments = null;
    if (attachments) {
      finalAttachments = typeof attachments === 'string' ? attachments : JSON.stringify(attachments);
    } else if (attachment) {
      finalAttachments = JSON.stringify([attachment]);
    }

    // Create message
    const message = await prisma.jobMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content: content || '',
        attachments: finalAttachments,
        replyToId: replyToId || null,
        delivered: true,
        deliveredAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
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
    });

    // Update conversation
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessage: content || '📎 Attachment',
      },
    });

    // Create Notification
    try {
      const receiverId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;

      if (receiverId) {
        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
          select: { userType: true }
        });

        let link = '/buyer/messages/jobs'; // Default to buyer
        if (receiver?.userType === 'EMPLOYER') {
          link = `/company/messages?chat=${conversationId}&messageId=${message.id}`;
        } else {
          link = `/buyer/messages/jobs?chat=${conversationId}&messageId=${message.id}`;
        }

        await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'MESSAGE',
            title: 'New Job Message',
            message: (content || 'Sent an attachment').substring(0, 100),
            link,
            read: false,
          }
        });
      }
    } catch (notifError) {
      console.error('Failed to create notification', notifError);
    }

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        reactions: []
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message', error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Update message (add reaction or mark as read)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const body = await request.json();
    const { userId, action, isTyping, messageId, emoji } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (action === 'reaction') {
      if (!messageId || !emoji) {
        return NextResponse.json({ success: false, message: 'Message ID and emoji are required' }, { status: 400 });
      }

      const message = await prisma.jobMessage.findUnique({
        where: { id: messageId },
        select: { reactions: true }
      }) as any;

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
      reactions.push(emoji);

      const updatedMessage = await prisma.jobMessage.update({
        where: { id: messageId },
        data: { reactions: JSON.stringify(reactions) }
      });

      return NextResponse.json({ success: true, reactions });
    }

    // ... (typing indicator logic)

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (action === 'markAsRead') {
      await prisma.jobMessage.updateMany({
        where: {
          conversationId,
          senderId: { not: userId }, // Messages sent by others
          read: false
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'typing') {
      const isUser1 = conversation.participant1Id === userId;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: isUser1
          ? { user1Typing: isTyping }
          : { user2Typing: isTyping },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update conversation', error: String(error) },
      { status: 500 }
    );
  }
}

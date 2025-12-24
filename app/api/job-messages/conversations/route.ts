import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch conversations where user is either participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
        status: { not: 'BLOCKED' },
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            userType: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            userType: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
            read: true,
            senderId: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                NOT: { senderId: userId },
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Format conversations with the other participant's info
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participant1Id === userId 
        ? conv.participant2 
        : conv.participant1;
      
      const isUser1 = conv.participant1Id === userId;
      
      return {
        id: conv.id,
        otherUser: otherParticipant,
        lastMessage: conv.messages[0] || null,
        unreadCount: conv._count.messages,
        isTyping: isUser1 ? conv.user2Typing : conv.user1Typing,
        lastSeen: isUser1 ? conv.user2LastSeen : conv.user1LastSeen,
        jobId: conv.jobId,
        applicationId: conv.applicationId,
        createdAt: conv.createdAt,
        lastMessageAt: conv.lastMessageAt,
      };
    });

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch conversations', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, otherUserId, jobId, applicationId, initialMessage } = body;

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { success: false, message: 'Both user IDs are required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: userId,
            participant2Id: otherUserId,
            jobId: jobId || null,
          },
          {
            participant1Id: otherUserId,
            participant2Id: userId,
            jobId: jobId || null,
          },
        ],
      },
    });

    if (existingConversation) {
      // If initial message provided, send it
      if (initialMessage) {
        await prisma.jobMessage.create({
          data: {
            conversationId: existingConversation.id,
            senderId: userId,
            content: initialMessage,
          },
        });

        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: {
            lastMessageAt: new Date(),
            lastMessage: initialMessage,
          },
        });
      }

      return NextResponse.json({
        success: true,
        conversation: existingConversation,
        existed: true,
      });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: userId,
        participant2Id: otherUserId,
        jobId: jobId || null,
        applicationId: applicationId || null,
        lastMessage: initialMessage || null,
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Send initial message if provided
    if (initialMessage) {
      await prisma.jobMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: initialMessage,
        },
      });
    }

    return NextResponse.json({
      success: true,
      conversation,
      existed: false,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create conversation', error: String(error) },
      { status: 500 }
    );
  }
}

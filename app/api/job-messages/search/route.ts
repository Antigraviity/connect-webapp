import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Search messages and conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');

    if (!userId || !query) {
      return NextResponse.json(
        { success: false, message: 'User ID and search query are required' },
        { status: 400 }
      );
    }

    // Find conversations where user is a participant
    const userConversationIds = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      select: { id: true },
    });

    const conversationIds = userConversationIds.map(c => c.id);

    // Search messages in user's conversations
    const messages = await prisma.jobMessage.findMany({
      where: {
        conversationId: { in: conversationIds },
        content: {
          contains: query,
        },
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
        conversation: {
          include: {
            participant1: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            participant2: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit results
    });

    // Format results with conversation context
    const results = messages.map(msg => {
      const otherParticipant = msg.conversation.participant1Id === userId
        ? msg.conversation.participant2
        : msg.conversation.participant1;

      return {
        messageId: msg.id,
        conversationId: msg.conversationId,
        content: msg.content,
        createdAt: msg.createdAt,
        sender: msg.sender,
        otherParticipant,
      };
    });

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to search messages', error: String(error) },
      { status: 500 }
    );
  }
}

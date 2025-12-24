import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.jobMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Update last seen
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (conversation) {
      const isUser1 = conversation.participant1Id === userId;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: isUser1
          ? { user1LastSeen: new Date() }
          : { user2LastSeen: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      messages,
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
    const { userId, content, attachments } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, message: 'User ID and content are required' },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.jobMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        attachments: attachments ? JSON.stringify(attachments) : null,
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
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessage: content,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message', error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Update typing status or mark as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const body = await request.json();
    const { userId, action, isTyping } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
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

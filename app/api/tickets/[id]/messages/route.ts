import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST new message to a ticket
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: ticketId } = await params;
        const body = await request.json();
        const { message, isAdmin } = body;

        if (!message) {
            return NextResponse.json({
                success: false,
                message: 'Message content is required'
            }, { status: 400 });
        }

        // Verify ticket exists
        const ticket = await db.ticket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) {
            return NextResponse.json({
                success: false,
                message: 'Ticket not found'
            }, { status: 404 });
        }

        // Create ticket message
        const ticketMessage = await db.ticketMessage.create({
            data: {
                message,
                isAdmin: isAdmin || false,
                ticketId
            }
        });

        // Update ticket's updatedAt timestamp
        await db.ticket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
            ticketMessage
        }, { status: 201 });

    } catch (error) {
        console.error('Create ticket message error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to send message',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

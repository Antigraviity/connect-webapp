import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET single ticket with messages
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const ticket = await db.ticket.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({
                success: false,
                message: 'Ticket not found'
            }, { status: 404 });
        }

        // Transform ticket for frontend (consistent with list view)
        const transformedTicket = {
            id: ticket.id,
            ticketId: ticket.id.slice(0, 8).toUpperCase(),
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            customer: ticket.user.name || 'N/A',
            email: ticket.user.email,
            phone: ticket.user.phone || 'N/A',
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            closedAt: ticket.closedAt,
            messages: ticket.messages,
        };

        return NextResponse.json({
            success: true,
            ticket: transformedTicket
        }, { status: 200 });

    } catch (error) {
        console.error('Fetch ticket error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch ticket',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// PATCH update ticket status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { status } = await request.json();

        const updatedTicket = await db.ticket.update({
            where: { id },
            data: {
                status,
                ...(status === 'RESOLVED' || status === 'CLOSED' ? { closedAt: new Date() } : {})
            }
        });

        return NextResponse.json({
            success: true,
            message: `Ticket status updated to ${status}`,
            ticket: updatedTicket
        }, { status: 200 });

    } catch (error) {
        console.error('Update ticket error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update ticket status',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

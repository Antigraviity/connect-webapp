import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all tickets
export async function GET(request: NextRequest) {
  try {
    const tickets = await db.ticket.findMany({
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
          select: {
            id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data for frontend
    const transformedTickets = tickets.map(ticket => ({
      id: ticket.id,
      ticketId: ticket.id.slice(0, 8).toUpperCase(),
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      customer: ticket.user.name || 'N/A',
      email: ticket.user.email,
      phone: ticket.user.phone || 'N/A',
      messages: ticket.messages.length,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      closedAt: ticket.closedAt,
    }));

    // Calculate stats
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'OPEN').length;
    const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolvedToday = tickets.filter(t => {
      if (t.status === 'RESOLVED' && t.closedAt) {
        const today = new Date();
        const closedDate = new Date(t.closedAt);
        return closedDate.toDateString() === today.toDateString();
      }
      return false;
    }).length;

    return NextResponse.json({
      success: true,
      tickets: transformedTickets,
      stats: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolvedToday,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { createAdminNotification } from '@/lib/notifications';

// POST create new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, description, priority, userId } = body;

    // Validation
    if (!subject || !description || !userId) {
      return NextResponse.json({
        success: false,
        message: 'Subject, description, and userId are required'
      }, { status: 400 });
    }

    // Create ticket
    const ticket = await db.ticket.create({
      data: {
        subject,
        description,
        priority: priority || 'medium',
        status: 'OPEN',
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Notify admins of new support ticket
    try {
      await createAdminNotification(
        'New Support Ticket',
        `New ${ticket.priority} priority ticket: "${subject}" from ${ticket.user.name}`,
        'SYSTEM',
        `/admin/support`
      );
    } catch (notifyError) {
      console.error('Failed to send admin notification:', notifyError);
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket created successfully',
      ticket: {
        id: ticket.id,
        ticketId: ticket.id.slice(0, 8).toUpperCase(),
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create ticket',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

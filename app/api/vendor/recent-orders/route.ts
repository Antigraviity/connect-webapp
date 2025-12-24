import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get sellerId from query params
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    // Get limit from query params (default 10)
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch recent orders
    const orders = await prisma.order.findMany({
      where: { sellerId },
      include: {
        buyer: {
          select: {
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            title: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Format orders for frontend
    const formattedOrders = orders.map(order => {
      const initials = order.buyer.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      return {
        id: order.orderNumber,
        customer: order.buyer.name,
        service: order.service.title,
        date: new Date(order.bookingDate).toLocaleDateString('en-GB', { 
          month: 'short', 
          day: 'numeric' 
        }),
        time: order.bookingTime,
        amount: `₹${order.totalAmount.toLocaleString('en-IN')}`,
        status: order.status === 'PENDING' ? 'Pending' :
                order.status === 'CONFIRMED' ? 'Confirmed' :
                order.status === 'IN_PROGRESS' ? 'In Progress' :
                order.status === 'COMPLETED' ? 'Completed' :
                order.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
        avatar: initials,
      };
    });

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      service: {
        type: 'PRODUCT' // Only get product orders
      }
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      where.status = status;
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { service: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch orders and total count
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
              price: true,
              type: true,
            }
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              city: true,
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.order.count({ where })
    ]);

    // Calculate statistics
    const stats = await db.order.groupBy({
      by: ['status'],
      where: {
        service: {
          type: 'PRODUCT'
        }
      },
      _count: true,
    });

    // Format stats for easier consumption
    const formattedStats = {
      total: stats.reduce((acc, curr) => acc + curr._count, 0),
      delivered: stats.find(s => s.status === 'COMPLETED')?._count || 0,
      inProgress: stats.filter(s => ['CONFIRMED', 'IN_PROGRESS'].includes(s.status))
        .reduce((acc, curr) => acc + curr._count, 0),
      cancelled: stats.find(s => s.status === 'CANCELLED')?._count || 0,
    };

    return NextResponse.json({
      success: true,
      orders,
      stats: formattedStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch product orders error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch product orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

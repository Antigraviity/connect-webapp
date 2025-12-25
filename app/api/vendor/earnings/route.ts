import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch earnings data for a vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const type = searchParams.get('type'); // PRODUCT or SERVICE

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Seller ID is required'
      }, { status: 400 });
    }

    // Calculate date ranges
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Build where clause based on type
    const baseWhere: any = {
      sellerId,
      status: {
        in: ['COMPLETED', 'CONFIRMED', 'IN_PROGRESS'] // Completed/paid orders
      }
    };

    // Filter by product type if specified
    if (type) {
      baseWhere.service = {
        type: type
      };
    }

    // Get all-time stats
    const allTimeOrders = await db.order.findMany({
      where: baseWhere,
      select: {
        totalAmount: true,
        createdAt: true,
      }
    });

    const totalRevenue = allTimeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = allTimeOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // This month stats
    const thisMonthOrders = await db.order.findMany({
      where: {
        ...baseWhere,
        createdAt: {
          gte: startOfThisMonth
        }
      },
      select: {
        totalAmount: true,
      }
    });

    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const thisMonthOrderCount = thisMonthOrders.length;

    // Last month stats
    const lastMonthOrders = await db.order.findMany({
      where: {
        ...baseWhere,
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      },
      select: {
        totalAmount: true,
      }
    });

    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate revenue change percentage
    let revenueChange = 0;
    if (lastMonthRevenue > 0) {
      revenueChange = Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 * 10) / 10;
    } else if (thisMonthRevenue > 0) {
      revenueChange = 100;
    }

    // Pending payout (last 7 days)
    const pendingOrders = await db.order.findMany({
      where: {
        ...baseWhere,
        createdAt: {
          gte: sevenDaysAgo
        },
        paymentStatus: 'PAID'
      },
      select: {
        totalAmount: true,
      }
    });

    const pendingPayout = pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Chart data - last 12 months
    const chartData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = await db.order.findMany({
        where: {
          ...baseWhere,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        select: {
          totalAmount: true,
        }
      });

      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      chartData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue
      });
    }

    // Recent orders
    const recentOrdersData = await db.order.findMany({
      where: {
        sellerId,
        ...(type && {
          service: {
            type: type
          }
        })
      },
      include: {
        service: {
          select: {
            title: true,
            images: true,
          }
        },
        buyer: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Map status to display status
    const statusMap: Record<string, string> = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Processing',
      'IN_PROGRESS': 'Shipped',
      'COMPLETED': 'Delivered',
      'CANCELLED': 'Cancelled',
      'REFUNDED': 'Refunded',
    };

    const recentOrders = recentOrdersData.map(order => {
      let productImage = null;
      try {
        const images = order.service.images ? JSON.parse(order.service.images) : [];
        productImage = images[0] || null;
      } catch (e) {
        productImage = null;
      }

      return {
        id: order.orderNumber,
        product: order.service.title,
        productImage,
        customer: order.customerName || order.buyer?.name || 'Customer',
        amount: order.totalAmount,
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        status: statusMap[order.status] || order.status,
      };
    });

    return NextResponse.json({
      success: true,
      earnings: {
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueChange,
        avgOrderValue,
        pendingPayout,
        totalOrders,
        thisMonthOrders: thisMonthOrderCount,
      },
      chartData,
      recentOrders,
    });

  } catch (error) {
    console.error('Fetch earnings error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

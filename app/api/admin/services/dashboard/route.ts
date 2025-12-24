import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all services count
    const totalServices = await db.service.count();

    // Get active vendors count (sellers with at least one service)
    const activeVendors = await db.user.count({
      where: {
        userType: 'SELLER',
        services: {
          some: {}
        }
      }
    });

    // Get today's bookings (using Order model)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysBookings = await db.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get average rating (from all services)
    const servicesWithRatings = await db.service.findMany({
      select: { rating: true }
    });
    const avgRating = servicesWithRatings.length > 0
      ? (servicesWithRatings.reduce((sum, s) => sum + (s.rating || 0), 0) / servicesWithRatings.length).toFixed(1)
      : '0.0';

    // Get order status counts
    const [completed, inProgress, confirmed, pending, cancelled] = await Promise.all([
      db.order.count({ where: { status: 'COMPLETED' } }),
      db.order.count({ where: { status: 'IN_PROGRESS' } }),
      db.order.count({ where: { status: 'CONFIRMED' } }),
      db.order.count({ where: { status: 'PENDING' } }),
      db.order.count({ where: { status: 'CANCELLED' } }),
    ]);

    // Calculate revenue (sum of completed orders)
    const revenueData = await db.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true }
    });
    const revenue = revenueData._sum.totalAmount || 0;

    // Get top vendors (sellers)
    const topVendors = await db.user.findMany({
      where: {
        userType: 'SELLER',
        services: {
          some: {}
        }
      },
      include: {
        _count: {
          select: {
            services: true
          }
        },
        services: {
          select: {
            rating: true,
            category: {
              select: {
                name: true
              }
            },
            _count: {
              select: {
                orders: true
              }
            },
            orders: {
              where: { status: 'COMPLETED' },
              select: { totalAmount: true }
            }
          }
        }
      },
      take: 4
    });

    const topVendorsFormatted = topVendors.map(vendor => {
      const totalBookings = vendor.services.reduce((sum, service) => 
        sum + service._count.orders, 0);
      const avgRating = vendor.services.length > 0
        ? vendor.services.reduce((sum, s) => sum + (s.rating || 0), 0) / vendor.services.length
        : 0;
      const totalRevenue = vendor.services.reduce((sum, service) => 
        sum + service.orders.reduce((s, b) => s + (b.totalAmount || 0), 0), 0);

      return {
        name: vendor.name || vendor.email,
        category: vendor.services[0]?.category?.name || 'General',
        bookings: totalBookings,
        rating: avgRating.toFixed(1),
        revenue: totalRevenue
      };
    }).sort((a, b) => b.bookings - a.bookings);

    // Get recent orders
    const recentBookings = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: {
            title: true,
            seller: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        buyer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const recentBookingsFormatted = recentBookings.map(booking => ({
      id: booking.id.substring(0, 8).toUpperCase(),
      service: booking.service.title,
      customer: booking.buyer.name || booking.buyer.email,
      vendor: booking.service.seller.name || booking.service.seller.email,
      amount: booking.totalAmount || 0,
      status: booking.status,
      time: formatTimeAgo(booking.createdAt)
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalServices,
        activeVendors,
        todaysBookings,
        avgRating
      },
      bookingStats: {
        completed,
        inProgress,
        confirmed,
        pending,
        cancelled,
        revenue
      },
      topVendors: topVendorsFormatted,
      recentBookings: recentBookingsFormatted
    });

  } catch (error) {
    console.error('Services dashboard error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch services dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

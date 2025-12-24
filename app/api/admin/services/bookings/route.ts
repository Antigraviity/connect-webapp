import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all service orders (bookings)
    const bookings = await db.order.findMany({
      where: {
        service: {
          type: 'SERVICE' // Only service bookings, not product orders
        }
      },
      include: {
        buyer: {
          select: {
            name: true,
            email: true,
            phone: true,
          }
        },
        service: {
          select: {
            title: true,
            duration: true,
            seller: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const bookingsFormatted = bookings.map(booking => {
      // Format schedule date
      const scheduleDate = booking.bookingDate 
        ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
        : 'Not scheduled';

      // bookingTime is already a string in the database
      const scheduleTime = booking.bookingTime || '';

      // Format duration
      const scheduleDuration = booking.duration 
        ? `${booking.duration} minutes` 
        : '3 hours';

      return {
        id: `SB${booking.id.substring(0, 6).toUpperCase()}`,
        fullId: booking.id,
        bookingId: `SB${booking.id.substring(0, 6).toUpperCase()}`,
        serviceName: booking.service.title || 'Unknown Service',
        serviceDescription: booking.service.title || '',
        customerName: booking.buyer?.name || booking.customerName || 'Unknown Customer',
        customerEmail: booking.buyer?.email || booking.customerEmail || 'N/A',
        customerPhone: booking.buyer?.phone || booking.customerPhone || 'N/A',
        providerName: booking.service.seller?.name || 'Unknown Provider',
        scheduleDate: scheduleDate,
        scheduleTime: scheduleTime,
        scheduleDuration: scheduleDuration,
        location: booking.customerAddress || 'N/A',
        payment: `₹${booking.totalAmount?.toLocaleString('en-IN') || 0}`,
        paymentAmount: booking.totalAmount || 0,
        paymentStatus: booking.paymentStatus || 'PENDING',
        status: booking.status || 'PENDING',
        createdAt: new Date(booking.createdAt).toISOString(),
      };
    });

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.createdAt);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    }).length;

    const yesterdayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.createdAt);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === yesterday.getTime();
    }).length;

    const completedServices = bookings.filter(b => b.status === 'COMPLETED').length;

    const todayRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.createdAt);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const yesterdayRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.createdAt);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === yesterday.getTime();
      })
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const stats = {
      totalBookings: bookings.length,
      todayBookings: todayBookings,
      completedServices: completedServices,
      revenueToday: todayRevenue,
      yesterdayBookings: yesterdayBookings,
      yesterdayRevenue: yesterdayRevenue,
    };

    return NextResponse.json({
      success: true,
      bookings: bookingsFormatted,
      stats: stats
    });

  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

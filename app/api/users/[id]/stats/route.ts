import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch user statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Get total bookings (orders)
    const totalBookings = await db.order.count({
      where: { buyerId: userId }
    });

    // Get active bookings (PENDING, CONFIRMED, IN_PROGRESS)
    const activeBookings = await db.order.count({
      where: {
        buyerId: userId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    // Get completed bookings
    const completedBookings = await db.order.count({
      where: {
        buyerId: userId,
        status: 'COMPLETED'
      }
    });

    // Get total favorites
    const totalFavorites = await db.favorite.count({
      where: { userId: userId }
    });

    // Get total reviews given by user
    const totalReviews = await db.review.count({
      where: { userId: userId }
    });

    // Get total spent
    const ordersWithAmount = await db.order.aggregate({
      where: {
        buyerId: userId,
        paymentStatus: 'PAID'
      },
      _sum: {
        totalAmount: true
      }
    });
    const totalSpent = ordersWithAmount._sum.totalAmount || 0;

    // Get total messages sent
    const totalMessages = await db.message.count({
      where: { senderId: userId }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalBookings,
        activeBookings,
        completedBookings,
        totalFavorites,
        totalReviews,
        totalSpent,
        totalMessages,
      }
    });

  } catch (error) {
    console.error('Fetch user stats error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

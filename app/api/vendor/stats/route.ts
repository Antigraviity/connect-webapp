import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get sellerId from query params (same pattern as buyer dashboard)
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get previous month for comparison
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // 1. Total Earnings (this month)
    const currentMonthOrders = await prisma.order.aggregate({
      where: {
        sellerId,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] },
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const previousMonthOrders = await prisma.order.aggregate({
      where: {
        sellerId,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] },
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const currentEarnings = currentMonthOrders._sum.totalAmount || 0;
    const previousEarnings = previousMonthOrders._sum.totalAmount || 0;
    const earningsChangeNum = previousEarnings > 0 
      ? ((currentEarnings - previousEarnings) / previousEarnings) * 100
      : 0;
    const earningsChange = earningsChangeNum.toFixed(1);

    // 2. Total Bookings/Orders
    const totalBookings = await prisma.order.count({
      where: { sellerId },
    });

    const activeBookings = await prisma.order.count({
      where: {
        sellerId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    // 3. Average Rating
    const services = await prisma.service.findMany({
      where: { sellerId },
      select: {
        rating: true,
        totalReviews: true,
      },
    });

    let totalRating = 0;
    let totalReviews = 0;
    services.forEach(service => {
      totalRating += service.rating * service.totalReviews;
      totalReviews += service.totalReviews;
    });

    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';

    // 4. Active Services
    const activeServices = await prisma.service.count({
      where: {
        sellerId,
        status: 'APPROVED',
      },
    });

    const pendingServices = await prisma.service.count({
      where: {
        sellerId,
        status: 'PENDING',
      },
    });

    // Return stats
    const stats = [
      {
        label: 'Total Earnings',
        value: `₹${currentEarnings.toLocaleString('en-IN')}`,
        change: `${earningsChangeNum > 0 ? '+' : ''}${earningsChange}%`,
        icon: 'FiDollarSign',
        color: 'bg-green-500',
      },
      {
        label: 'Total Bookings',
        value: totalBookings.toString(),
        change: `${activeBookings} active`,
        icon: 'FiShoppingBag',
        color: 'bg-blue-500',
      },
      {
        label: 'Average Rating',
        value: averageRating,
        change: `${totalReviews} reviews`,
        icon: 'FiStar',
        color: 'bg-yellow-500',
      },
      {
        label: 'Active Services',
        value: activeServices.toString(),
        change: `${pendingServices} pending`,
        icon: 'FiPackage',
        color: 'bg-purple-500',
      },
    ];

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

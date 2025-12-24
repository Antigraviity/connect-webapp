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

    // Get counts for each status
    const [completed, active, pending, cancelled] = await Promise.all([
      prisma.order.count({
        where: { sellerId, status: 'COMPLETED' },
      }),
      prisma.order.count({
        where: { sellerId, status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
      }),
      prisma.order.count({
        where: { sellerId, status: 'PENDING' },
      }),
      prisma.order.count({
        where: { sellerId, status: 'CANCELLED' },
      }),
    ]);

    const statusData = [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Active', value: active, color: '#3b82f6' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Cancelled', value: cancelled, color: '#ef4444' },
    ];

    return NextResponse.json(statusData);

  } catch (error) {
    console.error('Error fetching booking status data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

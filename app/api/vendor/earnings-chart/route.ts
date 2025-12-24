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

    // Get last 6 months
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: monthNames[date.getMonth()],
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
      });
    }

    // Fetch earnings for each month
    const earningsData = await Promise.all(
      months.map(async (month) => {
        const result = await prisma.order.aggregate({
          where: {
            sellerId,
            status: { in: ['COMPLETED', 'IN_PROGRESS'] },
            createdAt: {
              gte: month.startDate,
              lte: month.endDate,
            },
          },
          _sum: {
            totalAmount: true,
          },
        });

        return {
          month: month.name,
          earnings: result._sum.totalAmount || 0,
        };
      })
    );

    return NextResponse.json(earningsData);

  } catch (error) {
    console.error('Error fetching earnings chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

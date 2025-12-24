import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Debug endpoint to check database
export async function GET(request: NextRequest) {
  try {
    // Get all services (without filters)
    const allServices = await db.service.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all categories
    const allCategories = await db.category.findMany();

    // Get count by status
    const statusCounts = await db.service.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      debug: {
        totalServices: allServices.length,
        services: allServices.map(s => ({
          id: s.id,
          title: s.title,
          status: s.status,
          categoryName: s.category?.name,
          sellerName: s.seller?.name,
          createdAt: s.createdAt,
        })),
        statusCounts,
        totalCategories: allCategories.length,
        categories: allCategories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      message: 'Debug failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// API to fix product/service status - updates all PENDING items to APPROVED
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'approve-all') {
      // Update all PENDING products and services to APPROVED
      const updated = await db.service.updateMany({
        where: {
          status: 'PENDING'
        },
        data: {
          status: 'APPROVED'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${updated.count} items from PENDING to APPROVED`,
        count: updated.count
      }, { status: 200 });
    }

    if (action === 'approve-products') {
      // Update only PENDING products to APPROVED
      const updated = await db.service.updateMany({
        where: {
          status: 'PENDING',
          type: 'PRODUCT'
        },
        data: {
          status: 'APPROVED'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${updated.count} products from PENDING to APPROVED`,
        count: updated.count
      }, { status: 200 });
    }

    if (action === 'approve-services') {
      // Update only PENDING services to APPROVED
      const updated = await db.service.updateMany({
        where: {
          status: 'PENDING',
          type: 'SERVICE'
        },
        data: {
          status: 'APPROVED'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${updated.count} services from PENDING to APPROVED`,
        count: updated.count
      }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use: approve-all, approve-products, or approve-services',
      usage: {
        'approve-all': 'POST /api/fix-status?action=approve-all',
        'approve-products': 'POST /api/fix-status?action=approve-products',
        'approve-services': 'POST /api/fix-status?action=approve-services',
      }
    }, { status: 400 });

  } catch (error) {
    console.error('Fix status error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Show current status counts
export async function GET(request: NextRequest) {
  try {
    // Count by type and status
    const stats = await Promise.all([
      db.service.count({ where: { type: 'PRODUCT', status: 'PENDING' } }),
      db.service.count({ where: { type: 'PRODUCT', status: 'APPROVED' } }),
      db.service.count({ where: { type: 'SERVICE', status: 'PENDING' } }),
      db.service.count({ where: { type: 'SERVICE', status: 'APPROVED' } }),
      db.service.count({ where: { status: 'PENDING' } }),
      db.service.count({ where: { status: 'APPROVED' } }),
      db.service.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        products: {
          pending: stats[0],
          approved: stats[1],
        },
        services: {
          pending: stats[2],
          approved: stats[3],
        },
        total: {
          pending: stats[4],
          approved: stats[5],
          all: stats[6],
        }
      },
      actions: {
        'approve-all': 'POST /api/fix-status?action=approve-all',
        'approve-products': 'POST /api/fix-status?action=approve-products',
        'approve-services': 'POST /api/fix-status?action=approve-services',
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get status error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

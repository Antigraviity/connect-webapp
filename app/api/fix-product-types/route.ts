import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireRole } from '@/lib/auth-middleware';

// POST - Fix services that should be products based on their category type
export const POST = requireRole(['ADMIN'])(async (request: NextRequest) => {
  try {
    // Find all services/products that have a PRODUCT category but are marked as SERVICE
    const mismatchedItems = await db.service.findMany({
      where: {
        type: 'SERVICE',
        category: {
          type: 'PRODUCT'
        }
      },
      include: {
        category: true
      }
    });

    if (mismatchedItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No mismatched items found. All items have correct type.',
        fixed: 0
      });
    }

    // Update each mismatched item to have the correct type
    const updateResults = await Promise.all(
      mismatchedItems.map(async (item) => {
        try {
          await db.service.update({
            where: { id: item.id },
            data: { type: 'PRODUCT' }
          });
          return { id: item.id, title: item.title, status: 'fixed' };
        } catch (error) {
          return { id: item.id, title: item.title, status: 'error', error: (error as Error).message };
        }
      })
    );

    const fixedCount = updateResults.filter(r => r.status === 'fixed').length;

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} items that were incorrectly marked as SERVICE instead of PRODUCT`,
      fixed: fixedCount,
      details: updateResults
    });

  } catch (error) {
    console.error('Fix product types error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fix product types',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

// GET - Check for mismatched types
export const GET = requireRole(['ADMIN'])(async (request: NextRequest) => {
  try {
    // Find all services/products that have mismatched types
    const mismatchedServices = await db.service.findMany({
      where: {
        type: 'SERVICE',
        category: {
          type: 'PRODUCT'
        }
      },
      select: {
        id: true,
        title: true,
        type: true,
        category: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    const mismatchedProducts = await db.service.findMany({
      where: {
        type: 'PRODUCT',
        category: {
          type: 'SERVICE'
        }
      },
      select: {
        id: true,
        title: true,
        type: true,
        category: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      servicesWithProductCategory: mismatchedServices,
      productsWithServiceCategory: mismatchedProducts,
      totalMismatched: mismatchedServices.length + mismatchedProducts.length
    });

  } catch (error) {
    console.error('Check product types error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check product types',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

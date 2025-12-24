import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all product reviews for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status'); // approved, pending, flagged
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;

    let where: any = {
      service: {
        type: 'PRODUCT' // Only product reviews
      }
    };

    // Filter by approval status
    if (status && status !== 'all') {
      if (status.toUpperCase() === 'APPROVED') {
        where.approved = true;
        where.reported = false;
      } else if (status.toUpperCase() === 'PENDING') {
        where.approved = false;
        where.reported = false;
      } else if (status.toUpperCase() === 'FLAGGED') {
        where.reported = true;
      }
    }

    // Filter by rating
    if (rating && rating !== 'all') {
      where.rating = parseInt(rating);
    }

    // Search by product name or customer name
    if (search) {
      where.OR = [
        { service: { title: { contains: search } } },
        { user: { name: { contains: search } } }
      ];
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count({ where })
    ]);

    // Calculate statistics
    const allReviews = await db.review.findMany({
      where: {
        service: { type: 'PRODUCT' }
      },
      select: {
        rating: true,
        approved: true,
        reported: true,
      }
    });

    const stats = {
      total: allReviews.length,
      avgRating: allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : '0.0',
      pending: allReviews.filter(r => !r.approved && !r.reported).length,
      flagged: allReviews.filter(r => r.reported).length,
      approved: allReviews.filter(r => r.approved).length,
    };

    return NextResponse.json({
      success: true,
      reviews,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch product reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update review status (approve/reject/flag)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, action } = body; // action: approve, reject, flag, unflag

    if (!reviewId || !action) {
      return NextResponse.json(
        { success: false, message: 'Review ID and action are required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action.toLowerCase()) {
      case 'approve':
        updateData = { approved: true, reported: false };
        break;
      case 'reject':
        updateData = { approved: false, reported: false };
        break;
      case 'flag':
        updateData = { reported: true, approved: false };
        break;
      case 'unflag':
        updateData = { reported: false };
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    const review = await db.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Review ${action}ed successfully`,
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update review' },
      { status: 500 }
    );
  }
}

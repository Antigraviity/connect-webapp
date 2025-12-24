import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all reviews for services
    const reviews = await db.review.findMany({
      where: {
        service: {
          type: 'SERVICE' // Only service reviews
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        service: {
          select: {
            title: true,
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

    const reviewsFormatted = reviews.map(review => {
      return {
        id: `REV${review.id.substring(0, 3).toUpperCase()}`,
        fullId: review.id,
        reviewId: `REV${review.id.substring(0, 3).toUpperCase()}`,
        customerName: review.user?.name || 'Anonymous',
        customerEmail: review.user?.email || 'N/A',
        serviceName: review.service?.title || 'Unknown Service',
        providerName: review.service?.seller?.name || 'Unknown Provider',
        rating: review.rating || 0,
        comment: review.comment || '',
        helpfulCount: review.helpful || 0,
        status: review.approved ? 'Published' : (review.approved === false ? 'Flagged' : 'Pending'),
        createdAt: new Date(review.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        createdAtISO: new Date(review.createdAt).toISOString(),
      };
    });

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;
    const publishedReviews = reviews.filter(r => r.approved === true).length;
    const flaggedReviews = reviews.filter(r => r.approved === false).length;

    const stats = {
      totalReviews: totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      publishedReviews: publishedReviews,
      flaggedReviews: flaggedReviews,
    };

    return NextResponse.json({
      success: true,
      reviews: reviewsFormatted,
      stats: stats
    });

  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

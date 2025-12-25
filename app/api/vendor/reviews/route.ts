import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

// File-based storage for vendor replies
const REPLIES_FILE = path.join(process.cwd(), 'data', 'vendor-replies.json');

// Helper to read replies from file
function readReplies(): Record<string, { reply: string; replyAt: string }> {
  try {
    if (fs.existsSync(REPLIES_FILE)) {
      const data = fs.readFileSync(REPLIES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading replies file:', error);
  }
  return {};
}

// GET - Fetch vendor's reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const rating = searchParams.get('rating'); // Filter by specific rating

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Seller ID is required'
      }, { status: 400 });
    }

    // Build where clause
    const where: any = {
      service: {
        sellerId: sellerId,
        type: 'SERVICE'
      }
    };

    // Filter by rating if specified
    if (rating) {
      where.rating = parseInt(rating);
    }

    // Get all reviews for this vendor's services
    const reviews = await db.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        service: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate rating statistics
    const allReviews = await db.review.findMany({
      where: {
        service: {
          sellerId: sellerId,
          type: 'SERVICE'
        }
      },
      select: {
        rating: true
      }
    });

    const totalReviews = allReviews.length;
    
    // Calculate average rating
    const avgRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Calculate rating breakdown
    const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
    allReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingCounts[r.rating - 1]++;
      }
    });

    const breakdown = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: ratingCounts[stars - 1],
      percentage: totalReviews > 0 ? Math.round((ratingCounts[stars - 1] / totalReviews) * 100) : 0
    }));

    // Read file-based replies
    const fileReplies = readReplies();

    // Format reviews for response
    const formattedReviews = reviews.map(review => {
      // Check for vendor reply - first in database, then in file
      const dbReply = (review as any).vendorReply;
      const dbReplyAt = (review as any).vendorReplyAt;
      const fileReply = fileReplies[review.id];

      const vendorReply = dbReply || fileReply?.reply || null;
      const vendorReplyAt = dbReplyAt || fileReply?.replyAt || null;

      return {
        id: review.id,
        customer: {
          name: review.user?.name || 'Anonymous',
          avatar: getInitials(review.user?.name || 'A'),
          image: review.user?.image || null,
        },
        service: review.service?.title || 'Service',
        serviceId: review.service?.id,
        rating: review.rating,
        comment: review.comment || '',
        date: new Date(review.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        createdAt: review.createdAt,
        helpful: review.helpful || 0,
        replied: !!vendorReply,
        vendorReply,
        vendorReplyAt: vendorReplyAt ? new Date(vendorReplyAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        stats: {
          average: Math.round(avgRating * 10) / 10,
          total: totalReviews,
          breakdown
        }
      }
    });

  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

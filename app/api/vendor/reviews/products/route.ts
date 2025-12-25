import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

// File-based storage for vendor replies (fallback)
const REPLIES_FILE = path.join(process.cwd(), 'data', 'vendor-product-replies.json');

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

// Helper to write replies to file
function writeReplies(replies: Record<string, { reply: string; replyAt: string }>) {
  try {
    const dir = path.dirname(REPLIES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REPLIES_FILE, JSON.stringify(replies, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing replies file:', error);
    return false;
  }
}

// GET - Fetch vendor's product reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const rating = searchParams.get('rating'); // Filter by specific rating
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Seller ID is required'
      }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    // Build where clause for products only
    const where: any = {
      service: {
        sellerId: sellerId,
        type: 'PRODUCT'
      }
    };

    // Filter by rating if specified
    if (rating && rating !== 'all') {
      where.rating = parseInt(rating);
    }

    // Get all reviews for this vendor's products with pagination
    const [reviews, totalCount] = await Promise.all([
      db.review.findMany({
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
              images: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      db.review.count({ where })
    ]);

    // Calculate rating statistics for all reviews (not paginated)
    const allReviews = await db.review.findMany({
      where: {
        service: {
          sellerId: sellerId,
          type: 'PRODUCT'
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

      // Parse images from service
      let productImage = null;
      try {
        const images = JSON.parse(review.service?.images || '[]');
        productImage = images[0] || null;
      } catch {
        productImage = null;
      }

      return {
        id: review.id,
        customer: {
          id: review.user?.id,
          name: review.user?.name || 'Anonymous',
          avatar: getInitials(review.user?.name || 'A'),
          image: review.user?.image || null,
        },
        product: review.service?.title || 'Product',
        productId: review.service?.id,
        productImage,
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
        },
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        }
      }
    });

  } catch (error) {
    console.error('Fetch product reviews error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch product reviews',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Add vendor reply to a product review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, sellerId, reply } = body;

    if (!reviewId || !sellerId || !reply) {
      return NextResponse.json({
        success: false,
        message: 'Review ID, Seller ID, and reply are required'
      }, { status: 400 });
    }

    // Verify the review belongs to this seller's product
    const review = await db.review.findFirst({
      where: {
        id: reviewId,
        service: {
          sellerId: sellerId,
          type: 'PRODUCT'
        }
      }
    });

    if (!review) {
      return NextResponse.json({
        success: false,
        message: 'Review not found or not authorized'
      }, { status: 404 });
    }

    // Try to update in database first
    try {
      await db.review.update({
        where: { id: reviewId },
        data: {
          vendorReply: reply,
          vendorReplyAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Reply added successfully'
      });
    } catch (dbError) {
      // If database update fails (e.g., column doesn't exist), use file-based storage
      console.log('Database update failed, using file-based storage:', dbError);
      
      const replies = readReplies();
      replies[reviewId] = {
        reply,
        replyAt: new Date().toISOString()
      };
      
      if (writeReplies(replies)) {
        return NextResponse.json({
          success: true,
          message: 'Reply added successfully (file-based)'
        });
      } else {
        throw new Error('Failed to save reply');
      }
    }

  } catch (error) {
    console.error('Add reply error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add reply',
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

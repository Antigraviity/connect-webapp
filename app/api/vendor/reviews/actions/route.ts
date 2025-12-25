import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import fs from 'fs';
import path from 'path';

// File-based storage for vendor replies (until database migration is run)
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

// Helper to write replies to file
function writeReplies(replies: Record<string, { reply: string; replyAt: string }>) {
  try {
    const dir = path.dirname(REPLIES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REPLIES_FILE, JSON.stringify(replies, null, 2));
  } catch (error) {
    console.error('Error writing replies file:', error);
  }
}

// POST - Handle review actions (helpful, reply)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, reviewId, vendorId, replyText } = body;

    if (!reviewId) {
      return NextResponse.json({
        success: false,
        message: 'Review ID is required'
      }, { status: 400 });
    }

    // Get the review
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        service: true,
        user: true
      }
    });

    if (!review) {
      return NextResponse.json({
        success: false,
        message: 'Review not found'
      }, { status: 404 });
    }

    if (action === 'helpful') {
      // Increment helpful count
      const updatedReview = await db.review.update({
        where: { id: reviewId },
        data: {
          helpful: {
            increment: 1
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Marked as helpful',
        data: {
          helpful: updatedReview.helpful
        }
      });
    }

    if (action === 'reply') {
      if (!vendorId || !replyText) {
        return NextResponse.json({
          success: false,
          message: 'Vendor ID and reply text are required'
        }, { status: 400 });
      }

      // Try database first, fall back to file storage
      let vendorReply = replyText;
      let vendorReplyAt = new Date().toISOString();

      try {
        // Try to update in database (if migration has been run)
        await db.review.update({
          where: { id: reviewId },
          data: {
            vendorReply: replyText,
            vendorReplyAt: new Date()
          } as any // Type assertion to handle potential missing fields
        });
      } catch (dbError: any) {
        // If database update fails (field doesn't exist), use file storage
        if (dbError.message?.includes('Unknown argument')) {
          console.log('Using file-based storage for vendor reply');
          const replies = readReplies();
          replies[reviewId] = {
            reply: replyText,
            replyAt: vendorReplyAt
          };
          writeReplies(replies);
        } else {
          throw dbError;
        }
      }

      // Create notification for the customer
      try {
        await db.notification.create({
          data: {
            userId: review.userId,
            title: 'Vendor Replied to Your Review',
            message: `The vendor has replied to your review for "${review.service?.title || 'the service'}"`,
            type: 'SERVICE',
            link: `/buyer/bookings`,
          }
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      return NextResponse.json({
        success: true,
        message: 'Reply posted successfully',
        data: {
          vendorReply,
          vendorReplyAt
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Review action error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process review action',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Get vendor replies (for reviews that don't have DB field yet)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (reviewId) {
      const replies = readReplies();
      const reply = replies[reviewId];
      
      return NextResponse.json({
        success: true,
        data: reply || null
      });
    }

    // Return all replies
    const replies = readReplies();
    return NextResponse.json({
      success: true,
      data: replies
    });

  } catch (error) {
    console.error('Get replies error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get replies'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch reviews for a service or by user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const type = searchParams.get('type'); // Filter by service type: SERVICE or PRODUCT

    let whereClause: any = {};

    if (serviceId) {
      whereClause.serviceId = serviceId;
    }
    if (userId) {
      whereClause.userId = userId;
    }
    if (orderId) {
      whereClause.orderId = orderId;
    }
    
    // Filter by service type if provided
    if (type) {
      whereClause.service = {
        type: type
      };
    }

    const reviews = await db.review.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            images: true,
            type: true,
            seller: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            bookingDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, serviceId, orderId, rating, comment, images } = body;

    // Validate required fields
    if (!userId || !serviceId || !orderId || !rating) {
      return NextResponse.json(
        { success: false, message: 'User ID, Service ID, Order ID, and Rating are required' },
        { status: 400 }
      );
    }

    // Check if rating is valid (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if order exists and belongs to user
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        buyerId: userId,
        serviceId: serviceId,
        status: 'COMPLETED',
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found or not eligible for review. Only completed orders can be reviewed.' },
        { status: 400 }
      );
    }

    // Check if review already exists for this order
    const existingReview = await db.review.findUnique({
      where: { orderId },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this order' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId,
        serviceId,
        orderId,
        rating,
        comment: comment || '',
        images: images ? JSON.stringify(images) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            seller: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Update service rating and review count
    const serviceReviews = await db.review.findMany({
      where: { serviceId },
      select: { rating: true },
    });

    const avgRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;

    await db.service.update({
      where: { id: serviceId },
      data: {
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        totalReviews: serviceReviews.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// PUT - Update a review
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, userId, rating, comment } = body;

    if (!reviewId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Review ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if review exists and belongs to user
    const existingReview = await db.review.findFirst({
      where: {
        id: reviewId,
        userId: userId,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Update the review
    const review = await db.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || existingReview.rating,
        comment: comment !== undefined ? comment : existingReview.comment,
      },
    });

    // Update service rating
    const serviceReviews = await db.review.findMany({
      where: { serviceId: existingReview.serviceId },
      select: { rating: true },
    });

    const avgRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;

    await db.service.update({
      where: { id: existingReview.serviceId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
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

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');
    const userId = searchParams.get('userId');

    if (!reviewId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Review ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if review exists and belongs to user
    const existingReview = await db.review.findFirst({
      where: {
        id: reviewId,
        userId: userId,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, message: 'Review not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the review
    await db.review.delete({
      where: { id: reviewId },
    });

    // Update service rating and review count
    const serviceReviews = await db.review.findMany({
      where: { serviceId: existingReview.serviceId },
      select: { rating: true },
    });

    const avgRating = serviceReviews.length > 0
      ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length
      : 0;

    await db.service.update({
      where: { id: existingReview.serviceId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: serviceReviews.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

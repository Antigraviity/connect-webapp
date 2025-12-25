import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Status display names for notifications
const statusDisplayNames: Record<string, string> = {
  'PENDING': 'Pending',
  'CONFIRMED': 'Confirmed',
  'IN_PROGRESS': 'In Progress',
  'COMPLETED': 'Completed',
  'CANCELLED': 'Cancelled',
};

// Create notification for booking status change
async function createBookingNotification(
  buyerId: string, 
  status: string, 
  serviceName: string, 
  orderNumber: string,
  bookingId: string
) {
  try {
    const statusName = statusDisplayNames[status] || status;
    
    let title = '';
    let message = '';
    
    switch (status) {
      case 'CONFIRMED':
        title = '🎉 Booking Confirmed!';
        message = `Your booking for "${serviceName}" has been confirmed by the service provider. Get ready for your appointment!`;
        break;
      case 'IN_PROGRESS':
        title = '🔧 Service In Progress';
        message = `Your service "${serviceName}" is now in progress. The provider is working on your booking.`;
        break;
      case 'COMPLETED':
        title = '✅ Service Completed';
        message = `Your service "${serviceName}" has been completed. Please leave a review to help other customers!`;
        break;
      case 'CANCELLED':
        title = '❌ Booking Cancelled';
        message = `Your booking for "${serviceName}" has been cancelled. Please contact the provider for more details.`;
        break;
      default:
        title = `Booking Status Updated`;
        message = `Your booking for "${serviceName}" status has been updated to ${statusName}.`;
    }
    
    await db.notification.create({
      data: {
        userId: buyerId,
        title,
        message,
        type: 'ORDER',
        link: `/buyer/bookings?id=${bookingId}`,
        read: false,
      }
    });
    
    console.log(`✅ Notification sent to buyer ${buyerId} for booking ${orderNumber}`);
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notification failure shouldn't break the status update
  }
}

// GET single booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const booking = await db.order.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            duration: true,
            type: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      }
    });
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      booking
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get the current booking to check for status change
    const currentBooking = await db.order.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            title: true,
          }
        },
        buyer: {
          select: {
            id: true,
          }
        }
      }
    });
    
    if (!currentBooking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }
    
    const previousStatus = currentBooking.status;
    
    // Build update object
    const updateData: any = {};
    
    if (body.status !== undefined) {
      updateData.status = body.status;
      
      // If completing the order, set completedAt
      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
      
      // Note: Order model doesn't have cancelledAt field
      // Cancellation is tracked via status change only
    }
    
    if (body.paymentStatus !== undefined) {
      updateData.paymentStatus = body.paymentStatus;
    }
    
    if (body.bookingDate !== undefined) {
      updateData.bookingDate = new Date(body.bookingDate);
    }
    
    if (body.bookingTime !== undefined) {
      updateData.bookingTime = body.bookingTime;
    }
    
    if (body.specialRequests !== undefined) {
      updateData.specialRequests = body.specialRequests;
    }
    
    const booking = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            duration: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      }
    });
    
    // Send notification if status changed
    if (body.status && body.status !== previousStatus && currentBooking.buyerId) {
      await createBookingNotification(
        currentBooking.buyerId,
        body.status,
        currentBooking.service?.title || 'Service',
        currentBooking.orderNumber,
        id
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Cancel/Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if booking exists
    const booking = await db.order.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            title: true,
          }
        }
      }
    });
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }
    
    // Soft delete by updating status to CANCELLED
    await db.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      }
    });
    
    // Send cancellation notification to buyer
    if (booking.buyerId) {
      await createBookingNotification(
        booking.buyerId,
        'CANCELLED',
        booking.service?.title || 'Service',
        booking.orderNumber,
        id
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to cancel booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

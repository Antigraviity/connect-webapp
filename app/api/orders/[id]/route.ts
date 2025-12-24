import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Order ID is required'
      }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            description: true,
            price: true,
            type: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch order',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Order ID is required'
      }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    // Update order
    const updateData: any = {};
    
    if (body.status) {
      updateData.status = body.status;
      // Set completedAt if status is COMPLETED
      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    
    if (body.paymentStatus) {
      updateData.paymentStatus = body.paymentStatus;
    }

    if (body.specialRequests !== undefined) {
      updateData.specialRequests = body.specialRequests;
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            price: true,
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order
    }, { status: 200 });

  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update order',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Order ID is required'
      }, { status: 400 });
    }

    // Check if order exists
    const existingOrder = await db.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    // Only allow cancellation of PENDING or CONFIRMED orders
    if (!['PENDING', 'CONFIRMED'].includes(existingOrder.status)) {
      return NextResponse.json({
        success: false,
        message: 'Only pending or confirmed orders can be cancelled'
      }, { status: 400 });
    }

    // Update order status to CANCELLED
    const order = await db.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    }, { status: 200 });

  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to cancel order',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

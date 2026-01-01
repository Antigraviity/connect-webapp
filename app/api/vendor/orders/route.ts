import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch product orders for a vendor
// This uses the existing Order model but filters by service type = PRODUCT
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Seller ID is required'
      }, { status: 400 });
    }

    // Build where clause - filter by seller and PRODUCT type
    const where: any = {
      sellerId: sellerId,
      service: {
        type: 'PRODUCT' // Only show orders for PRODUCT type services
      }
    };

    // Status filter - map frontend status to database status
    if (status && status !== 'All') {
      const statusMap: Record<string, string> = {
        'Pending': 'PENDING',
        'Processing': 'CONFIRMED',
        'Shipped': 'IN_PROGRESS',
        'Delivered': 'COMPLETED',
        'Cancelled': 'CANCELLED',
      };
      where.status = statusMap[status] || status;
    }

    // Search filter
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    // Get orders with related data
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              title: true,
              images: true,
              type: true,
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where })
    ]);

    // Get status counts for stats (only for PRODUCT type)
    const statusCounts = await db.order.groupBy({
      by: ['status'],
      where: {
        sellerId,
        service: {
          type: 'PRODUCT'
        }
      },
      _count: { status: true }
    });

    // Map status counts
    const stats = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    statusCounts.forEach(item => {
      switch (item.status) {
        case 'PENDING': stats.pending = item._count.status; break;
        case 'CONFIRMED': stats.processing = item._count.status; break;
        case 'IN_PROGRESS': stats.shipped = item._count.status; break;
        case 'COMPLETED': stats.delivered = item._count.status; break;
        case 'CANCELLED': stats.cancelled = item._count.status; break;
      }
    });

    // Format orders for frontend
    const formattedOrders = orders.map(order => {
      // Parse images
      let images: string[] = [];
      try {
        images = order.service.images ? JSON.parse(order.service.images) : [];
      } catch (e) {
        images = [];
      }

      // Map database status to frontend status
      const statusMap: Record<string, string> = {
        'PENDING': 'Pending',
        'CONFIRMED': 'Processing',
        'IN_PROGRESS': 'Shipped',
        'COMPLETED': 'Delivered',
        'CANCELLED': 'Cancelled',
        'REFUNDED': 'Refunded',
      };

      // Map payment status
      const paymentStatusMap: Record<string, string> = {
        'PENDING': 'Pending',
        'PAID': 'Paid',
        'FAILED': 'Failed',
        'REFUNDED': 'Refunded',
      };

      // Map payment method
      const paymentMethodMap: Record<string, string> = {
        'STRIPE': 'Card',
        'RAZORPAY': 'Razorpay',
        'PAYPAL': 'PayPal',
        'CASH_ON_SERVICE': 'COD',
        'BANK_TRANSFER': 'Bank',
        'WALLET': 'Wallet',
      };

      return {
        id: order.orderNumber,
        orderId: order.id,
        customer: {
          name: order.customerName || order.buyer?.name || 'Customer',
          phone: order.customerPhone || order.buyer?.phone || '',
          email: order.customerEmail || order.buyer?.email || '',
          address: order.customerAddress || '',
          avatar: (order.customerName || order.buyer?.name || 'C').substring(0, 2).toUpperCase(),
          image: order.buyer?.image,
          id: order.buyerId || order.buyer?.id,
        },
        items: [{
          name: order.service.title,
          qty: 1,
          price: order.servicePrice,
          image: images[0] || null,
        }],
        total: order.totalAmount,
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        time: new Date(order.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        bookingDate: order.bookingDate,
        bookingTime: order.bookingTime,
        status: statusMap[order.status] || order.status,
        paymentStatus: paymentStatusMap[order.paymentStatus] || order.paymentStatus,
        paymentMethod: paymentMethodMap[order.paymentMethod || ''] || order.paymentMethod || 'N/A',
        specialRequests: order.specialRequests,
        serviceType: order.service.type,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Fetch vendor product orders error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, sellerId } = body;

    if (!orderId || !status) {
      return NextResponse.json({
        success: false,
        message: 'Order ID and status are required'
      }, { status: 400 });
    }

    // Map frontend status to database status
    const statusMap: Record<string, string> = {
      'Pending': 'PENDING',
      'Processing': 'CONFIRMED',
      'Shipped': 'IN_PROGRESS',
      'Delivered': 'COMPLETED',
      'Cancelled': 'CANCELLED',
    };

    const dbStatus = statusMap[status] || status;

    // Check if order belongs to this seller
    const existingOrder = await db.order.findFirst({
      where: {
        id: orderId,
        ...(sellerId && { sellerId })
      }
    });

    if (!existingOrder) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }

    // Update order
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: dbStatus as any,
        ...(dbStatus === 'COMPLETED' && { completedAt: new Date() })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating order
const createOrderSchema = z.object({
  serviceId: z.string().optional(),
  buyerId: z.string(),
  sellerId: z.string().optional(),
  bookingDate: z.string(),
  bookingTime: z.string(),
  duration: z.number().positive().optional().default(60),
  servicePrice: z.number().positive(),
  taxAmount: z.number().optional().default(0),
  discount: z.number().optional().default(0),
  totalAmount: z.number().positive(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  customerAddress: z.string().optional(),
  specialRequests: z.string().optional(),
  paymentMethod: z.enum(['STRIPE', 'RAZORPAY', 'PAYPAL', 'CASHFREE', 'FLUTTERWAVE', 'INSTAMOJO', 'BANK_TRANSFER', 'CASH_ON_SERVICE', 'WALLET']).optional(),
  // Product order fields
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    discountPrice: z.number().optional(),
    quantity: z.number(),
    unit: z.string().optional(),
    sellerId: z.string().optional(),
    sellerName: z.string().optional(),
  })).optional(),
  deliveryFee: z.number().optional().default(0),
  orderType: z.enum(['SERVICE', 'PRODUCT']).optional().default('SERVICE'),
});

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // Filter by order type: SERVICE or PRODUCT
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (buyerId) where.buyerId = buyerId;
    if (sellerId) where.sellerId = sellerId;
    if (status) where.status = status;
    
    // Filter by service type (SERVICE or PRODUCT)
    if (type) {
      where.service = {
        type: type
      };
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
              price: true,
              type: true,
            }
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.order.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createOrderSchema.parse(body);
    
    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    // For product orders, we need to handle the case where there's no service
    // We'll use the first item's info or create a placeholder
    let serviceId = validatedData.serviceId;
    let sellerId = validatedData.sellerId;
    
    // If this is a product order with items but no serviceId
    if (validatedData.orderType === 'PRODUCT' && validatedData.items && validatedData.items.length > 0) {
      // Try to find a service that matches, or use a placeholder approach
      // For now, we'll store item details in specialRequests if no service exists
      const itemsInfo = validatedData.items.map(item => 
        `${item.name} x${item.quantity} @ ₹${item.discountPrice || item.price}`
      ).join('; ');
      
      // If no serviceId provided, we need to find or create one
      if (!serviceId) {
        // Try to find a service by the first item name
        const existingService = await db.service.findFirst({
          where: {
            OR: [
              { title: { contains: validatedData.items[0].name } },
              { id: validatedData.items[0].id }
            ]
          }
        });
        
        if (existingService) {
          serviceId = existingService.id;
          sellerId = existingService.sellerId;
        } else {
          // Find any approved service to use as placeholder (required by schema)
          const placeholderService = await db.service.findFirst({
            where: { status: 'APPROVED' }
          });
          
          if (placeholderService) {
            serviceId = placeholderService.id;
            sellerId = placeholderService.sellerId;
          } else {
            return NextResponse.json({
              success: false,
              message: 'No services available to create order. Please contact support.'
            }, { status: 400 });
          }
        }
      }
      
      // Append items info to special requests
      validatedData.specialRequests = validatedData.specialRequests 
        ? `${validatedData.specialRequests}\n\nOrder Items: ${itemsInfo}`
        : `Order Items: ${itemsInfo}`;
        
      // Add delivery fee info
      if (validatedData.deliveryFee && validatedData.deliveryFee > 0) {
        validatedData.specialRequests += `\nDelivery Fee: ₹${validatedData.deliveryFee}`;
      }
    }
    
    // Ensure we have required fields
    if (!serviceId || !sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Service ID and Seller ID are required'
      }, { status: 400 });
    }
    
    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        serviceId,
        buyerId: validatedData.buyerId,
        sellerId,
        bookingDate: new Date(validatedData.bookingDate),
        bookingTime: validatedData.bookingTime,
        duration: validatedData.duration || 60,
        servicePrice: validatedData.servicePrice,
        taxAmount: validatedData.taxAmount || 0,
        discount: validatedData.discount || 0,
        totalAmount: validatedData.totalAmount,
        status: 'PENDING',
        paymentStatus: validatedData.paymentMethod === 'CASH_ON_SERVICE' ? 'PENDING' : 'PENDING',
        paymentMethod: validatedData.paymentMethod,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone,
        customerAddress: validatedData.customerAddress,
        specialRequests: validatedData.specialRequests,
      },
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
      message: 'Order created successfully',
      order,
      orderNumber: order.orderNumber
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }
    
    console.error('Create order error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating booking
const createBookingSchema = z.object({
  serviceId: z.string(),
  sellerId: z.string(),
  bookingDate: z.string(),
  bookingTime: z.string(),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email'),
  customerPhone: z.string().min(10, 'Invalid phone number'),
  customerAddress: z.string().min(10, 'Address must be at least 10 characters'),
  specialRequests: z.string().optional(),
  servicePrice: z.number().positive(),
  addons: z.array(z.object({
    name: z.string(),
    price: z.number()
  })).optional(),
  totalAmount: z.number().positive(),
});

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SVC-${timestamp}-${random}`;
}

// GET all bookings (for admin/seller)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const buyerId = searchParams.get('buyerId');
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // Filter by service type: SERVICE or PRODUCT
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (sellerId) where.sellerId = sellerId;
    if (buyerId) where.buyerId = buyerId;
    if (status) where.status = status;
    
    // Filter by service type (SERVICE or PRODUCT)
    if (type) {
      where.service = {
        type: type
      };
    }

    const [bookings, total] = await Promise.all([
      db.order.findMany({
        where,
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.order.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createBookingSchema.parse(body);
    
    // Get service details
    const service = await db.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        seller: true
      }
    });

    if (!service) {
      return NextResponse.json({
        success: false,
        message: 'Service not found'
      }, { status: 404 });
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();
    
    // Calculate addons total
    const addonsTotal = validatedData.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
    
    // Create booking - using a guest buyer approach
    // In production, you would get the buyerId from the authenticated session
    let buyerId = body.buyerId;
    
    // If no buyerId provided, create a guest user or find existing by email
    if (!buyerId) {
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.customerEmail }
      });
      
      if (existingUser) {
        buyerId = existingUser.id;
      } else {
        // Create guest user
        const guestUser = await db.user.create({
          data: {
            name: validatedData.customerName,
            email: validatedData.customerEmail,
            phone: validatedData.customerPhone,
            address: validatedData.customerAddress,
            role: 'USER',
            userType: 'BUYER',
          }
        });
        buyerId = guestUser.id;
      }
    }

    // Create the booking/order
    const booking = await db.order.create({
      data: {
        orderNumber,
        serviceId: validatedData.serviceId,
        buyerId: buyerId,
        sellerId: validatedData.sellerId,
        bookingDate: new Date(validatedData.bookingDate),
        bookingTime: validatedData.bookingTime,
        duration: service.duration,
        servicePrice: validatedData.servicePrice,
        taxAmount: 0,
        discount: 0,
        totalAmount: validatedData.totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone,
        customerAddress: validatedData.customerAddress,
        specialRequests: validatedData.addons 
          ? `Add-ons: ${validatedData.addons.map(a => a.name).join(', ')}${validatedData.specialRequests ? '. Notes: ' + validatedData.specialRequests : ''}`
          : validatedData.specialRequests || null,
      },
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
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking,
      orderNumber
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }
    
    console.error('Create booking error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Create sample product orders for testing
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Seller ID is required. Pass ?sellerId=xxx'
      }, { status: 400 });
    }

    // Check if seller exists
    const seller = await db.user.findUnique({
      where: { id: sellerId }
    });

    if (!seller) {
      return NextResponse.json({
        success: false,
        message: 'Seller not found'
      }, { status: 404 });
    }

    // Get seller's PRODUCTS only (not services)
    const products = await db.service.findMany({
      where: { 
        sellerId,
        type: 'PRODUCT' // Only products
      },
      take: 5
    });

    if (products.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Seller has no products. Please add products first (not services).'
      }, { status: 400 });
    }

    // Create sample customers or use existing
    const customers = [
      { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91 98765 43210', address: '123 Main Street, New Delhi' },
      { name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 87654 32109', address: '456 Park Avenue, Mumbai' },
      { name: 'Amit Singh', email: 'amit.singh@example.com', phone: '+91 76543 21098', address: '789 Lake Road, Bangalore' },
      { name: 'Neha Gupta', email: 'neha.gupta@example.com', phone: '+91 65432 10987', address: '321 Hill View, Chennai' },
      { name: 'Vikram Kumar', email: 'vikram.kumar@example.com', phone: '+91 54321 09876', address: '555 Garden City, Hyderabad' },
    ];

    const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED'];
    const paymentStatuses = ['PENDING', 'PAID', 'PAID', 'PAID', 'PAID'];
    const paymentMethods = ['CASH_ON_SERVICE', 'RAZORPAY', 'STRIPE', 'WALLET', 'RAZORPAY'];

    const createdOrders = [];

    // Create orders for each customer
    for (let i = 0; i < Math.min(customers.length, products.length); i++) {
      const customer = customers[i];
      const product = products[i % products.length];
      const orderNumber = `PRD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}${i}`;

      // Check if order already exists
      const existingOrder = await db.order.findUnique({
        where: { orderNumber }
      });

      if (existingOrder) continue;

      // Create a buyer user for this order (or find existing)
      let buyer = await db.user.findUnique({
        where: { email: customer.email }
      });

      if (!buyer) {
        buyer = await db.user.create({
          data: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            userType: 'BUYER',
            role: 'USER',
          }
        });
      }

      // Calculate pricing
      const productPrice = product.discountPrice || product.price;
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const subtotal = productPrice * quantity;
      const taxAmount = subtotal * 0.05; // 5% tax
      const totalAmount = subtotal + taxAmount;

      // Create order
      const order = await db.order.create({
        data: {
          orderNumber,
          serviceId: product.id,
          buyerId: buyer.id,
          sellerId: sellerId,
          bookingDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)), // Next few days
          bookingTime: 'Delivery',
          duration: 0, // Not applicable for products
          servicePrice: productPrice,
          taxAmount,
          discount: 0,
          totalAmount,
          status: statuses[i] as any,
          paymentStatus: paymentStatuses[i] as any,
          paymentMethod: paymentMethods[i] as any,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          specialRequests: i === 0 ? 'Please pack carefully' : null,
          ...(statuses[i] === 'COMPLETED' && { completedAt: new Date() }),
        },
        include: {
          service: true,
          buyer: true,
        }
      });

      createdOrders.push({
        orderNumber: order.orderNumber,
        customer: customer.name,
        product: product.title,
        status: order.status,
        total: order.totalAmount,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdOrders.length} sample product orders`,
      orders: createdOrders
    });

  } catch (error) {
    console.error('Seed product orders error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create sample product orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Check existing product orders for a seller
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Seller ID is required'
      }, { status: 400 });
    }

    // Count products vs services
    const productCount = await db.service.count({
      where: { sellerId, type: 'PRODUCT' }
    });

    const serviceCount = await db.service.count({
      where: { sellerId, type: 'SERVICE' }
    });

    // Get product orders only
    const orders = await db.order.findMany({
      where: { 
        sellerId,
        service: {
          type: 'PRODUCT'
        }
      },
      include: {
        service: {
          select: { title: true, type: true }
        },
        buyer: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      sellerStats: {
        products: productCount,
        services: serviceCount,
      },
      productOrdersCount: orders.length,
      orders: orders.map(o => ({
        orderNumber: o.orderNumber,
        product: o.service.title,
        type: o.service.type,
        customer: o.buyer?.name || o.customerName,
        status: o.status,
        total: o.totalAmount,
        createdAt: o.createdAt,
      }))
    });

  } catch (error) {
    console.error('Get product orders error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get product orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

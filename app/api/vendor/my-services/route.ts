import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get sellerId from query params
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    // Get limit from query params (default 10)
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get type from query params (SERVICE or PRODUCT)
    const type = searchParams.get('type');

    // Build where clause
    const whereClause: any = { sellerId };
    if (type === 'SERVICE' || type === 'PRODUCT') {
      whereClause.type = type;
    }
    
    // Debug logging
    console.log('🔍 API my-services called with:');
    console.log('   Seller ID:', sellerId);
    console.log('   Type filter:', type || 'ALL');
    console.log('   Where clause:', JSON.stringify(whereClause));

    // Fetch vendor's services/products
    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    
    console.log(`   Found ${services.length} items`);
    if (services.length > 0) {
      console.log('   First item:', services[0].title, '- Type:', services[0].type, '- Status:', services[0].status);
    }

    // Format services for frontend
    const formattedServices = services.map(service => {
      // Parse images JSON
      let imageUrl = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100';
      try {
        const images = JSON.parse(service.images);
        if (images && images.length > 0) {
          imageUrl = images[0];
        }
      } catch (e) {
        // Use default image
      }

      // Determine status text
      let statusText = 'Active';
      if (service.status === 'PENDING') statusText = 'Pending';
      if (service.status === 'REJECTED') statusText = 'Rejected';
      if (service.status === 'INACTIVE') statusText = 'Inactive';
      
      // For products, check stock
      if (service.type === 'PRODUCT' && service.stock !== null && service.stock < 10) {
        statusText = 'Low Stock';
      }

      return {
        id: service.id,
        name: service.title,
        price: service.discountPrice 
          ? `₹${service.discountPrice.toLocaleString('en-IN')}`
          : `₹${service.price.toLocaleString('en-IN')}`,
        bookings: service._count.orders, // For services
        sold: service._count.orders, // For products
        stock: service.stock || 0,
        rating: parseFloat(service.rating.toFixed(1)),
        status: statusText,
        image: imageUrl,
        type: service.type,
      };
    });

    return NextResponse.json(formattedServices);

  } catch (error) {
    console.error('Error fetching vendor services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

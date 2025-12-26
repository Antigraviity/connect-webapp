import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Dynamically import db to prevent build-time execution
    const db = (await import('@/lib/db')).default;
    
    const services = await db.service.findMany({
      where: {
        type: 'SERVICE' // Only fetch services, not products
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        category: {
          select: {
            name: true,
          }
        },
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const servicesFormatted = services.map(service => ({
      id: service.id.substring(0, 8).toUpperCase(),
      name: service.title,
      vendor: service.seller.name || service.seller.email,
      vendorId: service.seller.id,
      vendorEmail: service.seller.email || 'N/A',
      vendorPhone: service.seller.phone || 'N/A',
      category: service.category.name,
      price: service.discountPrice 
        ? `₹${service.discountPrice.toLocaleString()} - ₹${service.price.toLocaleString()}`
        : `₹${service.price.toLocaleString()}`,
      minPrice: service.discountPrice || service.price,
      maxPrice: service.price,
      rating: service.rating || 0,
      reviews: service._count.reviews,
      bookings: service._count.orders,
      location: [service.city, service.state, service.country].filter(Boolean).join(', ') || 'India',
      status: service.status,
      featured: service.featured,
      createdAt: new Date(service.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      description: service.description,
      duration: service.duration ? `${service.duration} minutes` : 'Varies',
    }));

    return NextResponse.json({
      success: true,
      services: servicesFormatted
    });

  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch services',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

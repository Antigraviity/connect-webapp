import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all vendors (users with SELLER type)
    const vendors = await db.user.findMany({
      where: {
        userType: 'SELLER',
      },
      include: {
        _count: {
          select: {
            services: {
              where: {
                type: 'SERVICE'
              }
            },
            sellerOrders: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        },
        services: {
          where: {
            type: 'SERVICE'
          },
          select: {
            rating: true,
            totalReviews: true,
            orders: {
              where: {
                status: 'COMPLETED'
              },
              select: {
                totalAmount: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const vendorsFormatted = vendors.map(vendor => {
      // Calculate total revenue
      const totalRevenue = vendor.services.reduce((sum, service) => {
        const serviceRevenue = service.orders.reduce((s, order) => s + (order.totalAmount || 0), 0);
        return sum + serviceRevenue;
      }, 0);

      // Calculate average rating
      const ratingsSum = vendor.services.reduce((sum, service) => sum + (service.rating || 0), 0);
      const avgRating = vendor.services.length > 0 
        ? (ratingsSum / vendor.services.length) 
        : 0;

      // Calculate total bookings
      const totalBookings = vendor._count.sellerOrders;

      // Determine status based on active field
      let status = 'ACTIVE';
      if (!vendor.active) {
        status = 'INACTIVE';
      } else if (!vendor.verified) {
        status = 'PENDING';
      }

      return {
        id: vendor.id.substring(0, 8).toUpperCase(),
        fullId: vendor.id,
        name: vendor.name || vendor.email,
        owner: vendor.name || 'N/A',
        email: vendor.email || 'N/A',
        phone: vendor.phone || 'N/A',
        location: [vendor.city, vendor.state].filter(Boolean).join(', ') || 'India',
        services: vendor._count.services,
        bookings: totalBookings,
        revenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        revenueAmount: totalRevenue,
        rating: parseFloat(avgRating.toFixed(1)),
        status: status,
        verified: vendor.verified,
        joinDate: new Date(vendor.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        }),
        businessName: vendor.name || 'N/A',
        businessAddress: [vendor.address, vendor.city, vendor.state, vendor.zipCode].filter(Boolean).join(', ') || 'N/A',
        bio: vendor.bio || '',
      };
    });

    return NextResponse.json({
      success: true,
      vendors: vendorsFormatted
    });

  } catch (error) {
    console.error('Vendors fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

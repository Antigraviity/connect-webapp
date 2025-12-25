import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Helper to clean bio text - removes any JSON-like content
function cleanBio(bio: string | null): string {
  if (!bio) return 'Professional service provider';
  
  // Trim whitespace
  const trimmed = bio.trim();
  
  // Check if it looks like JSON (starts with { or [ or contains typical JSON patterns)
  if (
    trimmed.startsWith('{') || 
    trimmed.startsWith('[') ||
    trimmed.includes('"day":') ||
    trimmed.includes('"enabled":') ||
    trimmed.includes('"startTime":') ||
    trimmed.includes('"endTime":')
  ) {
    return 'Professional service provider';
  }
  
  // Try to parse as JSON - if successful, it's JSON data not a bio
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'object') {
      return 'Professional service provider';
    }
  } catch {
    // Not JSON, that's good - return the bio
  }
  
  return bio;
}

// GET - Fetch vendor profile with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({
        success: false,
        message: 'Vendor ID is required'
      }, { status: 400 });
    }

    // Get vendor details
    const vendor = await db.user.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        verified: true,
        city: true,
        state: true,
        country: true,
        address: true,
        createdAt: true,
        role: true,
        userType: true,
      }
    });

    if (!vendor) {
      return NextResponse.json({
        success: false,
        message: 'Vendor not found'
      }, { status: 404 });
    }

    // Get services count
    const servicesCount = await db.service.count({
      where: {
        sellerId: vendorId,
        type: 'SERVICE'
      }
    });

    const activeServicesCount = await db.service.count({
      where: {
        sellerId: vendorId,
        type: 'SERVICE',
        status: 'APPROVED'
      }
    });

    // Get orders statistics
    const totalOrders = await db.order.count({
      where: {
        sellerId: vendorId,
        service: {
          type: 'SERVICE'
        }
      }
    });

    const completedOrders = await db.order.count({
      where: {
        sellerId: vendorId,
        status: 'COMPLETED',
        service: {
          type: 'SERVICE'
        }
      }
    });

    // Get total earnings
    const earningsResult = await db.order.aggregate({
      where: {
        sellerId: vendorId,
        status: 'COMPLETED',
        service: {
          type: 'SERVICE'
        }
      },
      _sum: {
        totalAmount: true
      }
    });
    const totalEarnings = earningsResult._sum.totalAmount || 0;

    // Get reviews statistics
    const reviews = await db.review.findMany({
      where: {
        service: {
          sellerId: vendorId,
          type: 'SERVICE'
        }
      },
      select: {
        rating: true
      }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Get recent activity
    const recentOrders = await db.order.findMany({
      where: {
        sellerId: vendorId,
        service: {
          type: 'SERVICE'
        }
      },
      include: {
        service: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });

    const recentReviews = await db.review.findMany({
      where: {
        service: {
          sellerId: vendorId,
          type: 'SERVICE'
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    const recentServices = await db.service.findMany({
      where: {
        sellerId: vendorId,
        type: 'SERVICE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    // Build recent activity list
    const recentActivity: any[] = [];

    recentOrders.forEach(order => {
      if (order.status === 'COMPLETED') {
        recentActivity.push({
          type: 'order_completed',
          title: `Order #${order.orderNumber} Completed`,
          subtitle: order.service?.title || 'Service',
          timestamp: order.updatedAt,
          icon: 'check'
        });
      } else if (order.status === 'CONFIRMED') {
        recentActivity.push({
          type: 'order_confirmed',
          title: `New Booking Confirmed`,
          subtitle: order.service?.title || 'Service',
          timestamp: order.createdAt,
          icon: 'order'
        });
      }
    });

    recentReviews.forEach(review => {
      recentActivity.push({
        type: 'review',
        title: `Received ${review.rating}-Star Review`,
        subtitle: `From ${review.user?.name || 'Customer'}`,
        timestamp: review.createdAt,
        icon: 'star'
      });
    });

    recentServices.forEach(service => {
      recentActivity.push({
        type: 'service_added',
        title: service.status === 'APPROVED' ? 'Service Approved' : 'New Service Added',
        subtitle: service.title,
        timestamp: service.createdAt,
        icon: 'package'
      });
    });

    // Sort by timestamp and take top 5
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const topActivity = recentActivity.slice(0, 5).map(activity => ({
      ...activity,
      timeAgo: getTimeAgo(activity.timestamp)
    }));

    // Format location
    const locationParts = [vendor.city, vendor.state, vendor.country].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'Not specified';

    // Format join date
    const joinDate = new Date(vendor.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: vendor.id,
          name: vendor.name || 'Vendor',
          email: vendor.email,
          phone: vendor.phone || 'Not provided',
          image: vendor.image,
          bio: cleanBio(vendor.bio),
          verified: vendor.verified,
          location,
          city: vendor.city,
          state: vendor.state,
          country: vendor.country,
          address: vendor.address,
          joinDate,
          role: vendor.role,
          userType: vendor.userType,
        },
        stats: {
          servicesOffered: servicesCount,
          activeServices: activeServicesCount,
          totalOrders,
          completedOrders,
          totalEarnings,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
        },
        recentActivity: topActivity
      }
    });

  } catch (error) {
    console.error('Fetch vendor profile error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch vendor profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update vendor profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, name, phone, bio, image, city, state, country, address } = body;

    if (!vendorId) {
      return NextResponse.json({
        success: false,
        message: 'Vendor ID is required'
      }, { status: 400 });
    }

    // Build update data - only include fields that are provided
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (country !== undefined) updateData.country = country;
    if (address !== undefined) updateData.address = address;

    // Update vendor
    const updatedVendor = await db.user.update({
      where: { id: vendorId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        verified: true,
        city: true,
        state: true,
        country: true,
        address: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedVendor
    });

  } catch (error) {
    console.error('Update vendor profile error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

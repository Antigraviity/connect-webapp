import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Dynamically import db to prevent build-time execution
    const db = (await import('@/lib/db')).default;
    
    // Fetch all sellers (users with role SELLER)
    const sellers = await db.user.findMany({
      where: {
        role: 'SELLER'
      },
      include: {
        _count: {
          select: {
            services: {
              where: {
                type: 'PRODUCT'
              }
            },
            sellerOrders: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const sellersFormatted = sellers.map(seller => {
      const totalRevenue = 0; // Can be calculated from orders if needed
      
      return {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone || '',
        location: seller.city || 'India',
        city: seller.city || '',
        state: seller.state || '',
        pincode: seller.zipCode || '',
        address: seller.address || '',
        businessType: '', // Not in User model - would need VendorSettings
        description: seller.bio || '',
        gstNumber: '', // Not in User model - would need VendorSettings
        panNumber: '', // Not in User model - would need VendorSettings
        products: seller._count.services,
        orders: seller._count.sellerOrders,
        revenue: totalRevenue,
        rating: 0, // Can be calculated from reviews if needed
        status: seller.active ? 'ACTIVE' : 'INACTIVE',
        verified: seller.verified,
        joinedDate: new Date(seller.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      };
    });

    // Calculate stats
    const totalRevenue = sellersFormatted.reduce((sum, seller) => sum + seller.revenue, 0);
    const totalProducts = sellersFormatted.reduce((sum, seller) => sum + seller.products, 0);
    
    const stats = {
      total: sellersFormatted.length,
      active: sellersFormatted.filter(s => s.status === 'ACTIVE').length,
      totalProducts: totalProducts,
      totalRevenue: totalRevenue,
    };

    return NextResponse.json({
      success: true,
      sellers: sellersFormatted,
      stats: stats,
    });

  } catch (error) {
    console.error('Sellers fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch sellers',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update seller
export async function PUT(request: NextRequest) {
  try {
    // Dynamically import db
    const db = (await import('@/lib/db')).default;
    
    const body = await request.json();
    const { id, name, email, phone, city, state, pincode, address, status } = body;

    console.log('Updating seller:', { id, name });

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Seller ID is required' },
        { status: 400 }
      );
    }

    // Update the seller (only fields that exist in User model)
    const seller = await db.user.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: pincode || undefined,
        address: address || undefined,
        active: status === 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            services: {
              where: {
                type: 'PRODUCT'
              }
            },
            sellerOrders: true,
          }
        }
      }
    });

    console.log('Seller updated successfully:', seller.id);

    return NextResponse.json({
      success: true,
      message: 'Seller updated successfully',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone || '',
        location: seller.city || 'India',
        city: seller.city || '',
        state: seller.state || '',
        pincode: seller.zipCode || '',
        address: seller.address || '',
        businessType: '',
        description: seller.bio || '',
        gstNumber: '',
        panNumber: '',
        products: seller._count.services,
        orders: seller._count.sellerOrders,
        revenue: 0,
        rating: 0,
        status: seller.active ? 'ACTIVE' : 'INACTIVE',
        verified: seller.verified,
        joinedDate: new Date(seller.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      },
    });

  } catch (error) {
    console.error('Seller update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update seller',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new seller
export async function POST(request: NextRequest) {
  try {
    // Dynamically import db
    const db = (await import('@/lib/db')).default;
    
    const body = await request.json();
    const { name, email, phone, city, state, pincode, address, status } = body;

    console.log('Creating seller:', { name, email });

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a random password (seller will need to reset it)
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create the seller user (only fields that exist in User model)
    const seller = await db.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: 'SELLER',
        phone: phone || null,
        city: city || null,
        state: state || null,
        zipCode: pincode || null,
        address: address || null,
        country: 'India',
        active: status === 'ACTIVE',
        verified: false,
      }
    });

    console.log('Seller created successfully:', seller.id);

    return NextResponse.json({
      success: true,
      message: 'Seller registered successfully',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone || '',
        location: seller.city || 'India',
        city: seller.city || '',
        state: seller.state || '',
        pincode: seller.zipCode || '',
        address: seller.address || '',
        businessType: '',
        description: seller.bio || '',
        gstNumber: '',
        panNumber: '',
        products: 0,
        orders: 0,
        revenue: 0,
        rating: 0,
        status: seller.active ? 'ACTIVE' : 'INACTIVE',
        verified: seller.verified,
        joinedDate: new Date(seller.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      },
      temporaryPassword: randomPassword,
    });

  } catch (error) {
    console.error('Seller creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create seller',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating service
const createServiceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  discountPrice: z.number().positive().optional().nullable(),
  duration: z.number().positive('Duration must be positive'),
  categoryId: z.string(),
  subCategoryId: z.string().optional(),
  sellerId: z.string(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metaKeywords: z.array(z.string()).optional(),
  // Location fields
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Shop name - stored in metaTitle
  shopName: z.string().optional(),
  featured: z.boolean().optional(),
  popular: z.boolean().optional(),
  // Type field - SERVICE or PRODUCT
  type: z.enum(['SERVICE', 'PRODUCT']).optional().default('SERVICE'),
  // Stock for products
  stock: z.number().min(0).optional().default(0),
});

import { createAdminNotification } from '@/lib/notifications';

// GET all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const zipCode = searchParams.get('zipCode');
    const city = searchParams.get('city');
    const type = searchParams.get('type'); // Filter by type: SERVICE or PRODUCT
    const slug = searchParams.get('slug'); // Filter by service slug
    const serviceId = searchParams.get('id'); // Filter by service ID
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (sellerId) where.sellerId = sellerId;
    if (slug) where.slug = slug;
    if (serviceId) where.id = serviceId;

    // Handle status filter
    if (status && status !== '' && status !== 'all') {
      where.status = status;
    } else if (!sellerId && !slug && !serviceId) {
      // Public view - only show approved
      where.status = 'APPROVED';
    }

    if (featured) where.featured = featured === 'true';

    // Location filtering - MySQL compatible (no mode: 'insensitive')
    if (zipCode && zipCode.trim()) {
      where.zipCode = { contains: zipCode.trim() };
    }
    if (city && city.trim()) {
      // For MySQL, contains is case-insensitive by default with utf8 collation
      where.city = { contains: city.trim() };
    }

    // Filter by service type (SERVICE or PRODUCT)
    if (type && type.trim()) {
      where.type = type.trim();
    }

    console.log('=== Services API Request ===');
    console.log('Query params:', { type, status, sellerId, zipCode, city, limit });
    console.log('Where clause:', JSON.stringify(where, null, 2));

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              verified: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            }
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.service.count({ where })
    ]);

    console.log('=== Services API Response ===');
    console.log('Total found:', total);
    console.log('Returned:', services.length);
    console.log('Services:', services.map(s => ({
      id: s.id,
      title: s.title,
      type: s.type,
      status: s.status,
      city: s.city,
      zipCode: s.zipCode,
      hasSeller: !!s.seller
    })));

    return NextResponse.json({
      success: true,
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch services error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch services',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== Creating service/product ===');
    console.log('Title:', body.title);
    console.log('Type:', body.type || 'SERVICE');

    // Validate input
    const validatedData = createServiceSchema.parse(body);

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    // --- VALIDATION START ---
    const sellerId = validatedData.sellerId;

    // Validate Seller exists
    const seller = await db.user.findUnique({
      where: { id: sellerId },
      select: { id: true, role: true, userType: true }
    });

    if (!seller) {
      return NextResponse.json({
        success: false,
        message: 'Seller account not found',
        code: 'SELLER_NOT_FOUND'
      }, { status: 400 });
    }

    // Validate Category exists
    const category = await db.category.findUnique({
      where: { id: validatedData.categoryId }
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'Invalid category selected',
        code: 'CATEGORY_NOT_FOUND'
      }, { status: 400 });
    }

    // Validate SubCategory if provided
    if (validatedData.subCategoryId) {
      const subCategory = await db.subCategory.findUnique({
        where: { id: validatedData.subCategoryId }
      });

      if (!subCategory) {
        // If invalid subcategory, we can either error or just ignore it.
        // Let's error to be safe and clear.
        return NextResponse.json({
          success: false,
          message: 'Invalid sub-category selected',
          code: 'SUBCATEGORY_NOT_FOUND'
        }, { status: 400 });
      }
    }
    // --- VALIDATION END ---

    // --- SUBSCRIPTION LIMIT CHECK START ---


    // 1. Get current subscription
    const subscription = await db.vendorSubscription.findUnique({
      where: { userId: sellerId }
    });
    const currentPlan = subscription?.planId || 'free';

    // 2. Define limits
    const PLAN_LIMITS: Record<string, number> = {
      free: 3,
      starter: 15,
      professional: 30,
      enterprise: Infinity
    };

    // Default to strict limit if plan not recognized
    const limit = PLAN_LIMITS[currentPlan] ?? 3;

    // 3. Count existing services/products
    const currentCount = await db.service.count({
      where: { sellerId }
    });

    console.log(`[Limit Check] Seller: ${sellerId}, Plan: ${currentPlan}, Count: ${currentCount}, Limit: ${limit}`);

    // 4. Enforce limit
    if (currentCount >= limit) {
      return NextResponse.json({
        success: false,
        message: `Plan limit reached. Your ${currentPlan} plan allows maximum ${limit} listings. Please upgrade to add more.`,
        code: 'LIMIT_REACHED'
      }, { status: 403 });
    }
    // --- SUBSCRIPTION LIMIT CHECK END ---

    // Create service with APPROVED status (no admin approval needed)
    const service = await db.service.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        price: validatedData.price,
        discountPrice: validatedData.discountPrice,
        duration: validatedData.duration,
        type: validatedData.type || 'SERVICE',
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId,
        sellerId: validatedData.sellerId,
        slug,
        status: 'APPROVED', // Auto-approve
        images: validatedData.images ? JSON.stringify(validatedData.images) : '[]',
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        metaKeywords: validatedData.metaKeywords ? JSON.stringify(validatedData.metaKeywords) : null,
        metaTitle: validatedData.shopName || null,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        featured: validatedData.featured || false,
        popular: validatedData.popular || false,
        stock: validatedData.stock || 0,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: true,
        subCategory: true,
      }
    });

    // Notify admins of new service/product
    try {
      await createAdminNotification(
        `New ${validatedData.type || 'Service'} Registered`,
        `New ${validatedData.type === 'PRODUCT' ? 'product' : 'service'} "${validatedData.title}" created by ${service.seller.name}`,
        'SERVICE',
        validatedData.type === 'PRODUCT' ? '/admin/products' : '/admin/services'
      );
    } catch (notifyError) {
      console.error('Failed to send admin notification:', notifyError);
    }

    console.log('=== Service/Product created ===');
    console.log('ID:', service.id);
    console.log('Status:', service.status);
    console.log('Type:', service.type);

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      service
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }

    console.error('Create service error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create service',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

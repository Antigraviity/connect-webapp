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
    const type = searchParams.get('type'); // Filter by category type: SERVICE or PRODUCT
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
    
    // Only apply status filter if provided and not empty
    if (status && status !== '') {
      where.status = status;
    } else if (!sellerId && !slug && !serviceId) {
      // If no sellerId specified (public view) and not looking up by slug/id, only show approved
      where.status = 'APPROVED';
    }
    // If sellerId is specified but no status, show all products for that seller
    
    if (featured) where.featured = featured === 'true';
    if (zipCode) where.zipCode = zipCode;
    if (city) where.city = { contains: city };
    
    // Filter by service type directly (SERVICE or PRODUCT)
    if (type) {
      where.type = type;
    }

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
    
    // Validate input
    const validatedData = createServiceSchema.parse(body);
    
    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    // Create service with APPROVED status (no admin approval needed)
    const service = await db.service.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        price: validatedData.price,
        discountPrice: validatedData.discountPrice,
        duration: validatedData.duration,
        type: validatedData.type || 'SERVICE', // Use type from request or default to SERVICE
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId,
        sellerId: validatedData.sellerId,
        slug,
        status: 'APPROVED',
        images: validatedData.images ? JSON.stringify(validatedData.images) : '[]',
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        metaKeywords: validatedData.metaKeywords ? JSON.stringify(validatedData.metaKeywords) : null,
        // Store shop name in metaTitle field
        metaTitle: validatedData.shopName || null,
        // Location fields
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        featured: validatedData.featured || false,
        popular: validatedData.popular || false,
        stock: validatedData.stock || 0, // Stock for products
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

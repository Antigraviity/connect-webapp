import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { cache, cacheKeys, cacheTTL } from '@/lib/cache';
import { withRateLimit, rateLimitPresets } from '@/lib/rateLimit';
import { getServices } from '@/lib/services';

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
    // Apply rate limiting (relaxed for read operations)
    const rateLimitResponse = await withRateLimit(request, rateLimitPresets.relaxed);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const zipCode = searchParams.get('zipCode');
    const city = searchParams.get('city');
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');
    const serviceId = searchParams.get('id');

    // Parse pagination
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(100, parseInt(limitParam)) : 20;

    const pageParam = searchParams.get('page');
    const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;

    // Use the shared library function
    const result = await getServices({
      categoryId,
      sellerId,
      status,
      featured: featured === 'true',
      zipCode,
      city,
      type,
      slug,
      serviceId,
      limit,
      page
    });

    return NextResponse.json(result, { status: 200 });

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
    // Apply stricter rate limiting for create operations
    const rateLimitResponse = await withRateLimit(request, rateLimitPresets.standard);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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

    // Invalidate related caches
    cache.invalidatePattern('services:*');
    console.log('📦 Cache INVALIDATED for services');

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

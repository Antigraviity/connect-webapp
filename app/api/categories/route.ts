import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import { cache, cacheKeys, cacheTTL } from '@/lib/cache';
import { withRateLimit, rateLimitPresets } from '@/lib/rateLimit';

// Validation schema for creating category
const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  type: z.enum(['SERVICE', 'PRODUCT']).optional().default('SERVICE'),
  featured: z.boolean().optional().default(false),
});

// GET all categories
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request, rateLimitPresets.relaxed);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const type = searchParams.get('type'); // Filter by type: SERVICE or PRODUCT
    const includeInactive = searchParams.get('includeInactive'); // For admin view

    // Generate cache key
    const cacheKey = cacheKeys.categories(type || undefined);

    // Check cache for public queries
    if (includeInactive !== 'true') {
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('📦 Cache HIT for categories');
        return NextResponse.json(cached);
      }
    }

    const where: any = {};

    // Only filter active by default (unless admin requests all)
    if (includeInactive !== 'true') {
      where.active = true;
    }

    if (featured) where.featured = featured === 'true';
    if (type) where.type = type;

    const categories = await db.category.findMany({
      where,
      include: {
        subCategories: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          }
        },
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    const response = {
      success: true,
      categories,
      total: categories.length
    };

    // Cache public queries for 15 minutes (categories don't change often)
    if (includeInactive !== 'true') {
      cache.set(cacheKey, response, cacheTTL.LONG);
      console.log('📦 Cache SET for categories');
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request, rateLimitPresets.standard);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();

    // Validate input
    const validatedData = createCategorySchema.parse(body);

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category with this name already exists'
      }, { status: 400 });
    }

    // Create category
    const category = await db.category.create({
      data: {
        ...validatedData,
        slug,
      }
    });

    // Invalidate category cache
    cache.invalidatePattern('categories:*');
    console.log('📦 Cache INVALIDATED for categories');

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }

    console.error('Create category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

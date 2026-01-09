import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating product
const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  discountPrice: z.number().positive().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  categoryId: z.string(),
  subCategoryId: z.string().optional(),
  sellerId: z.string(),
  stock: z.number().int().min(0).optional().default(100),
  unit: z.string().optional().default('piece'),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const sellerId = searchParams.get('sellerId');
    const zipCode = searchParams.get('zipCode');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Only show products, not services
    where.type = 'PRODUCT';

    // Handle status filter - default to APPROVED for public view
    // This ensures newly added products with APPROVED status are shown
    if (status && status !== '' && status !== 'all') {
      where.status = status;
    } else if (!sellerId) {
      // If no sellerId specified (public view), only show approved products
      where.status = 'APPROVED';
    }
    // If sellerId is specified but no status, show all products for that seller

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (zipCode) {
      where.zipCode = { contains: zipCode };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'popularity') {
      orderBy.totalReviews = 'desc';
    } else {
      orderBy.createdAt = sortOrder;
    }

    console.log('Products API - Query params:', { status, sellerId, where });

    const [products, total] = await Promise.all([
      db.service.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              verified: true,
              image: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
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
        orderBy,
      }),
      db.service.count({ where })
    ]);

    console.log('Products API - Found:', products.length, 'products');

    // Transform products to match frontend expected format
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.title,
      title: product.title,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      discountPrice: product.discountPrice,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      rating: product.rating,
      totalReviews: product.totalReviews,
      category: {
        id: product.category?.id || '',
        name: product.category?.name || 'Uncategorized',
        slug: product.category?.slug || 'uncategorized'
      },
      categoryId: product.categoryId,
      subCategory: product.subCategory?.name,
      subCategoryId: product.subCategoryId,
      seller: {
        id: product.seller.id,
        name: product.seller.name,
        email: product.seller.email,
        verified: product.seller.verified,
        image: product.seller.image,
      },
      city: product.city,
      state: product.state,
      zipCode: product.zipCode,
      address: product.address,
      stock: product.stock || 100,
      unit: 'piece',
      status: product.status,
      featured: product.featured,
      popular: product.popular,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createProductSchema.parse(body);

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
      '-' + Date.now();

    // Create product (using Service table)
    const product = await db.service.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        price: validatedData.price,
        discountPrice: validatedData.discountPrice,
        images: JSON.stringify(validatedData.images),
        duration: 0, // Not applicable for products
        type: 'PRODUCT', // Mark as product, not service
        sellerId: validatedData.sellerId,
        categoryId: validatedData.categoryId,
        subCategoryId: validatedData.subCategoryId,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        address: validatedData.address,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        stock: validatedData.stock,
        status: 'APPROVED', // Auto-approve for now
        rating: 0,
        totalReviews: 0,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            verified: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
        ...product,
        images: JSON.parse(product.images),
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }

    console.error('Create product error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

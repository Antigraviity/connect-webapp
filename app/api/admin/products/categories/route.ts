import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch all categories with product counts
    const categories = await db.category.findMany({
      // Don't filter by type - show all categories
      include: {
        _count: {
          select: {
            services: {
              where: {
                type: 'PRODUCT'
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Format the response
    const categoriesFormatted = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '📦',
      products: category._count.services,
      status: category.active ? 'ACTIVE' : 'INACTIVE',
      featured: category.featured,
    }));

    // Calculate stats
    const totalProducts = categoriesFormatted.reduce((sum, cat) => sum + cat.products, 0);
    const stats = {
      total: categoriesFormatted.length,
      active: categoriesFormatted.filter(c => c.status === 'ACTIVE').length,
      inactive: categoriesFormatted.filter(c => c.status === 'INACTIVE').length,
      totalProducts: totalProducts,
    };

    return NextResponse.json({
      success: true,
      categories: categoriesFormatted,
      stats: stats,
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// CREATE new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, status } = body;

    console.log('Creating category:', { name, description, status });

    // Validation
    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    console.log('Generated slug:', slug);

    // Check if slug already exists
    const existing = await db.category.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    // Get the highest order number and add 1
    const maxOrder = await db.category.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const newOrder = (maxOrder?.order || 0) + 1;

    // Create category - use SERVICE as type since existing categories use it
    const category = await db.category.create({
      data: {
        name: name,
        slug: slug,
        description: description,
        type: 'SERVICE', // Changed from PRODUCT to SERVICE
        active: status === 'ACTIVE',
        featured: false,
        order: newOrder,
      }
    });

    console.log('Category created successfully:', category);

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '📦',
        products: 0,
        status: category.active ? 'ACTIVE' : 'INACTIVE',
        featured: category.featured,
      },
    });

  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

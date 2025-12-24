import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      where: {
        type: 'SERVICE' // Only service categories
      },
      include: {
        _count: {
          select: {
            services: {
              where: {
                type: 'SERVICE' // Count only services, not products
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Get vendor count per category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        // Count unique vendors who have services in this category
        const vendorsCount = await db.user.count({
          where: {
            userType: 'SELLER',
            services: {
              some: {
                categoryId: category.id,
                type: 'SERVICE'
              }
            }
          }
        });

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          icon: category.icon,
          image: category.image,
          services: category._count.services,
          vendors: vendorsCount,
          status: category.active ? 'ACTIVE' : 'INACTIVE',
          featured: category.featured,
          order: category.order,
          createdAt: new Date(category.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
        };
      })
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithStats
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, status, icon, image } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Category name is required'
      }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-');       // Replace multiple hyphens with single hyphen

    // Check if slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'A category with this name already exists'
      }, { status: 400 });
    }

    // Get the highest order number to add new category at the end
    const maxOrder = await db.category.aggregate({
      _max: {
        order: true
      },
      where: {
        type: 'SERVICE'
      }
    });

    const newOrder = (maxOrder._max.order || 0) + 1;

    // Create the category
    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon || null,
        image: image || null,
        type: 'SERVICE',
        active: status === 'ACTIVE',
        featured: false,
        order: newOrder,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon,
        image: category.image,
        services: 0,
        vendors: 0,
        status: category.active ? 'ACTIVE' : 'INACTIVE',
        featured: category.featured,
        order: category.order,
        createdAt: new Date(category.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      }
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, status, icon, image } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Category ID is required'
      }, { status: 400 });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Category name is required'
      }, { status: 400 });
    }

    // Generate new slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if slug already exists (excluding current category)
    const existingCategory = await db.category.findFirst({
      where: { 
        slug,
        NOT: { id }
      }
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'A category with this name already exists'
      }, { status: 400 });
    }

    // Update the category
    const category = await db.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon || null,
        image: image || null,
        active: status === 'ACTIVE',
      }
    });

    // Get counts for the response
    const servicesCount = await db.service.count({
      where: {
        categoryId: category.id,
        type: 'SERVICE'
      }
    });

    const vendorsCount = await db.user.count({
      where: {
        userType: 'SELLER',
        services: {
          some: {
            categoryId: category.id,
            type: 'SERVICE'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon,
        image: category.image,
        services: servicesCount,
        vendors: vendorsCount,
        status: category.active ? 'ACTIVE' : 'INACTIVE',
        featured: category.featured,
        order: category.order,
        createdAt: new Date(category.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      }
    });

  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Category ID is required'
      }, { status: 400 });
    }

    // Check if category has services
    const servicesCount = await db.service.count({
      where: {
        categoryId: id,
        type: 'SERVICE'
      }
    });

    if (servicesCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete category with ${servicesCount} active service(s). Please move or delete the services first.`
      }, { status: 400 });
    }

    // Delete the category
    await db.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

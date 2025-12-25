import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      where: {
        type: 'PRODUCT' // Only product categories
      },
      include: {
        subCategories: {
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            services: {
              where: {
                type: 'PRODUCT' // Count only products, not services
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
        // Count unique vendors who have products in this category
        const vendorsCount = await db.user.count({
          where: {
            userType: 'SELLER',
            services: {
              some: {
                categoryId: category.id,
                type: 'PRODUCT'
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
          products: category._count.services, // Products count
          vendors: vendorsCount,
          status: category.active ? 'ACTIVE' : 'INACTIVE',
          featured: category.featured,
          order: category.order,
          subCategories: category.subCategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            icon: sub.icon,
            active: sub.active,
          })),
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
    console.error('Product categories fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch product categories',
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
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

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

    // Get the highest order number
    const maxOrder = await db.category.aggregate({
      _max: {
        order: true
      },
      where: {
        type: 'PRODUCT'
      }
    });

    const newOrder = (maxOrder._max.order || 0) + 1;

    // Create the category with type PRODUCT
    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon || null,
        image: image || null,
        type: 'PRODUCT', // Important: Set type to PRODUCT
        active: status === 'ACTIVE',
        featured: false,
        order: newOrder,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product category created successfully',
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon,
        image: category.image,
        products: 0,
        vendors: 0,
        status: category.active ? 'ACTIVE' : 'INACTIVE',
        featured: category.featured,
        order: category.order,
        subCategories: [],
        createdAt: new Date(category.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      }
    });

  } catch (error) {
    console.error('Product category creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create product category',
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
      },
      include: {
        subCategories: true
      }
    });

    // Get counts for the response
    const productsCount = await db.service.count({
      where: {
        categoryId: category.id,
        type: 'PRODUCT'
      }
    });

    const vendorsCount = await db.user.count({
      where: {
        userType: 'SELLER',
        services: {
          some: {
            categoryId: category.id,
            type: 'PRODUCT'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product category updated successfully',
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon,
        image: category.image,
        products: productsCount,
        vendors: vendorsCount,
        status: category.active ? 'ACTIVE' : 'INACTIVE',
        featured: category.featured,
        order: category.order,
        subCategories: category.subCategories.map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          icon: sub.icon,
          active: sub.active,
        })),
        createdAt: new Date(category.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      }
    });

  } catch (error) {
    console.error('Product category update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update product category',
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

    // Check if category has products
    const productsCount = await db.service.count({
      where: {
        categoryId: id,
        type: 'PRODUCT'
      }
    });

    if (productsCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete category with ${productsCount} active product(s). Please move or delete the products first.`
      }, { status: 400 });
    }

    // Delete subcategories first
    await db.subCategory.deleteMany({
      where: { categoryId: id }
    });

    // Delete the category
    await db.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Product category deleted successfully'
    });

  } catch (error) {
    console.error('Product category deletion error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete product category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

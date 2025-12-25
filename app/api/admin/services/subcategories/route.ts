import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all subcategories (optionally filtered by categoryId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const subCategories = await db.subCategory.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      subCategories: subCategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        icon: sub.icon,
        active: sub.active,
        categoryId: sub.categoryId,
        categoryName: sub.category.name,
        servicesCount: sub._count.services,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      }))
    });

  } catch (error) {
    console.error('SubCategories fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch sub-categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new subcategory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, categoryId } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Sub-category name is required'
      }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({
        success: false,
        message: 'Category ID is required'
      }, { status: 400 });
    }

    // Check if category exists
    const category = await db.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if slug already exists and make it unique if needed
    let slug = baseSlug;
    let counter = 1;
    while (await db.subCategory.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the subcategory
    const subCategory = await db.subCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon || null,
        categoryId,
        active: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Sub-category created successfully',
      subCategory: {
        id: subCategory.id,
        name: subCategory.name,
        slug: subCategory.slug,
        description: subCategory.description,
        icon: subCategory.icon,
        active: subCategory.active,
        categoryId: subCategory.categoryId,
      }
    });

  } catch (error) {
    console.error('SubCategory creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create sub-category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update subcategory
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, icon, active } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Sub-category ID is required'
      }, { status: 400 });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Sub-category name is required'
      }, { status: 400 });
    }

    // Check if subcategory exists
    const existingSubCategory = await db.subCategory.findUnique({
      where: { id }
    });

    if (!existingSubCategory) {
      return NextResponse.json({
        success: false,
        message: 'Sub-category not found'
      }, { status: 404 });
    }

    // Generate new slug from name
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if slug already exists (excluding current subcategory)
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.subCategory.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Update the subcategory
    const subCategory = await db.subCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon || null,
        active: active !== undefined ? active : true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Sub-category updated successfully',
      subCategory: {
        id: subCategory.id,
        name: subCategory.name,
        slug: subCategory.slug,
        description: subCategory.description,
        icon: subCategory.icon,
        active: subCategory.active,
        categoryId: subCategory.categoryId,
      }
    });

  } catch (error) {
    console.error('SubCategory update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update sub-category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete subcategory
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Sub-category ID is required'
      }, { status: 400 });
    }

    // Check if subcategory exists
    const subCategory = await db.subCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!subCategory) {
      return NextResponse.json({
        success: false,
        message: 'Sub-category not found'
      }, { status: 404 });
    }

    // Check if subcategory has services
    if (subCategory._count.services > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete sub-category with ${subCategory._count.services} active service(s). Please move or delete the services first.`
      }, { status: 400 });
    }

    // Delete the subcategory
    await db.subCategory.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Sub-category deleted successfully'
    });

  } catch (error) {
    console.error('SubCategory deletion error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete sub-category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

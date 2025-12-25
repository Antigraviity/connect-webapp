import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        subCategories: {
          where: { active: true },
        },
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      category
    });

  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    
    if (body.name !== undefined) {
      updateData.name = body.name;
      // Update slug if name changed
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Check if new slug conflicts with another category
      const conflictingCategory = await db.category.findFirst({
        where: {
          slug: updateData.slug,
          id: { not: id }
        }
      });
      
      if (conflictingCategory) {
        // Add a suffix to make it unique
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }
    
    if (body.description !== undefined) updateData.description = body.description;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.order !== undefined) updateData.order = body.order;

    // Update category
    const category = await db.category.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    // Check if category has services
    if (existingCategory._count.services > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete category. It has ${existingCategory._count.services} services/products associated with it. Please reassign or delete them first.`
      }, { status: 400 });
    }

    // Delete subcategories first
    await db.subCategory.deleteMany({
      where: { categoryId: id }
    });

    // Delete category
    await db.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

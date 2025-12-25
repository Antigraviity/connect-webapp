import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Create a new subcategory for a product category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, categoryId } = body;

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

    // Check if category exists and is a PRODUCT category
    const category = await db.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        message: 'Category not found'
      }, { status: 404 });
    }

    if (category.type !== 'PRODUCT') {
      return NextResponse.json({
        success: false,
        message: 'Category is not a product category'
      }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if slug already exists in this category
    const existingSubCategory = await db.subCategory.findFirst({
      where: {
        categoryId,
        slug
      }
    });

    if (existingSubCategory) {
      return NextResponse.json({
        success: false,
        message: 'A sub-category with this name already exists in this category'
      }, { status: 400 });
    }

    // Create the subcategory
    const subCategory = await db.subCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
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
        active: subCategory.active,
      }
    });

  } catch (error) {
    console.error('Product subcategory creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create sub-category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update a subcategory
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, active } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Sub-category ID is required'
      }, { status: 400 });
    }

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
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if slug conflicts with another subcategory in the same category
    const conflictingSubCategory = await db.subCategory.findFirst({
      where: {
        categoryId: existingSubCategory.categoryId,
        slug,
        NOT: { id }
      }
    });

    if (conflictingSubCategory) {
      return NextResponse.json({
        success: false,
        message: 'A sub-category with this name already exists in this category'
      }, { status: 400 });
    }

    // Update the subcategory
    const subCategory = await db.subCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        active: active !== undefined ? active : existingSubCategory.active,
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
        active: subCategory.active,
      }
    });

  } catch (error) {
    console.error('Product subcategory update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update sub-category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete a subcategory
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
    const existingSubCategory = await db.subCategory.findUnique({
      where: { id }
    });

    if (!existingSubCategory) {
      return NextResponse.json({
        success: false,
        message: 'Sub-category not found'
      }, { status: 404 });
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
    console.error('Product subcategory deletion error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete sub-category',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

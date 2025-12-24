import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, price, discountPrice, categoryId, sellerId, images, featured, stock } = body;

    // Validation
    if (!id || !title || !description || !price || !categoryId || !sellerId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, get the current product to check if category/seller are changing
    const currentProduct = await db.service.findUnique({
      where: { id },
      select: { categoryId: true, sellerId: true },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Build the update data object
    const updateData: any = {
      title: title,
      description: description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      images: images && images.length > 0 ? JSON.stringify(images.filter((img: any) => img !== null && img !== undefined && img !== '')) : null,
      featured: featured,
      stock: stock ? parseInt(stock) : 0,
    };

    // Only update category if it changed
    if (currentProduct.categoryId !== categoryId) {
      updateData.category = {
        connect: { id: categoryId }
      };
    }

    // Only update seller if it changed
    if (currentProduct.sellerId !== sellerId) {
      updateData.seller = {
        connect: { id: sellerId }
      };
    }

    // Update the product
    const product = await db.service.update({
      where: { id },
      data: updateData,
    });

    // Fetch the updated product with relations
    const updatedProduct = await db.service.findUnique({
      where: { id: product.id },
      include: {
        seller: true,
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Product update error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

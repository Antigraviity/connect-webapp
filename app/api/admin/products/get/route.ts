import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Fetch product with all details
    const product = await db.service.findUnique({
      where: { id },
      include: {
        seller: true,
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Parse images
    let images = [];
    if (product.images) {
      try {
        const parsedImages = JSON.parse(product.images);
        images = Array.isArray(parsedImages) ? parsedImages.filter((img: any) => img !== null && img !== undefined && img !== '') : [];
      } catch (e) {
        images = [];
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        categoryId: product.categoryId,
        categoryName: product.category?.name,
        sellerId: product.sellerId,
        sellerName: product.seller?.name,
        images: images,
        featured: product.featured,
        status: product.status,
        stock: product.stock || 0,
      },
    });
  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

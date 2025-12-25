import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      description,
      price,
      discountPrice,
      categoryId,
      sellerId,
      images, // Array of Cloudinary URLs
      featured = false,
      stock = 0,
    } = body;

    // Validation
    if (!title || !description || !price || !categoryId || !sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: title, description, price, categoryId, sellerId'
      }, { status: 400 });
    }

    // Create the product
    const product = await db.service.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        type: 'PRODUCT',
        categoryId: categoryId,
        sellerId: sellerId,
        images: images ? JSON.stringify(images.filter((img: any) => img !== null && img !== undefined && img !== '')) : '[]',
        featured: featured,
        status: 'APPROVED', // Auto-approve for admin-created products
        rating: 0,
        totalReviews: 0,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now(),
        duration: 0, // Products don't have duration (services do)
        stock: stock ? parseInt(stock.toString()) : 0,
      }
    });

    // Fetch the created product with relations
    const createdProduct = await db.service.findUnique({
      where: { id: product.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
          }
        },
        category: {
          select: {
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: createdProduct,
    });

  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

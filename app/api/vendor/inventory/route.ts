import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch inventory for a vendor (products only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const search = searchParams.get('search');

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        message: 'Seller ID is required'
      }, { status: 400 });
    }

    // Build where clause - only PRODUCT type items
    const where: any = {
      sellerId: sellerId,
      type: 'PRODUCT',
      status: 'APPROVED' // Only show approved products
    };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { metaTitle: { contains: search } }, // SKU stored in metaTitle sometimes
      ];
    }

    // Get products with stock info
    const products = await db.service.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        discountPrice: true,
        stock: true,
        images: true,
        metaTitle: true, // Used for shop name or SKU
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const LOW_STOCK_THRESHOLD = 10; // Default threshold
    
    let totalProducts = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    // Format products for frontend
    const formattedProducts = products.map((product, index) => {
      const stock = product.stock || 0;
      const minStock = LOW_STOCK_THRESHOLD;
      const price = product.discountPrice || product.price;
      const value = stock * price;
      
      // Determine status
      let status = 'In Stock';
      if (stock === 0) {
        status = 'Out of Stock';
        outOfStock++;
      } else if (stock < minStock) {
        status = 'Low Stock';
        lowStock++;
      } else {
        inStock++;
      }

      totalValue += value;

      // Parse images
      let images: string[] = [];
      try {
        images = product.images ? JSON.parse(product.images) : [];
      } catch (e) {
        images = [];
      }

      // Generate SKU from product name if not set
      const sku = `PRD-${String(index + 1).padStart(3, '0')}`;

      return {
        id: product.id,
        name: product.title,
        sku: sku,
        stock: stock,
        minStock: minStock,
        sold: 0, // Would need to calculate from orders
        price: price,
        value: value,
        status: status,
        image: images[0] || null,
        updatedAt: product.updatedAt,
      };
    });

    // Calculate sold counts from orders
    const orderCounts = await db.order.groupBy({
      by: ['serviceId'],
      where: {
        sellerId,
        service: {
          type: 'PRODUCT'
        },
        status: {
          in: ['COMPLETED', 'CONFIRMED', 'IN_PROGRESS']
        }
      },
      _count: {
        serviceId: true
      }
    });

    // Map order counts to products
    const orderCountMap = new Map(
      orderCounts.map(o => [o.serviceId, o._count.serviceId])
    );

    formattedProducts.forEach(product => {
      product.sold = orderCountMap.get(product.id) || 0;
    });

    return NextResponse.json({
      success: true,
      inventory: formattedProducts,
      stats: {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalValue,
      }
    });

  } catch (error) {
    console.error('Fetch inventory error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update product stock
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, stock, sellerId } = body;

    if (!productId || stock === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Product ID and stock are required'
      }, { status: 400 });
    }

    // Check if product belongs to this seller
    const existingProduct = await db.service.findFirst({
      where: {
        id: productId,
        ...(sellerId && { sellerId }),
        type: 'PRODUCT'
      }
    });

    if (!existingProduct) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    // Update stock
    const updatedProduct = await db.service.update({
      where: { id: productId },
      data: {
        stock: Math.max(0, stock) // Ensure non-negative
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      product: {
        id: updatedProduct.id,
        title: updatedProduct.title,
        stock: updatedProduct.stock,
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update stock',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

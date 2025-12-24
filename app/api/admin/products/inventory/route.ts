import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch inventory data for all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let where: any = {
      type: 'PRODUCT' // Only products, not services
    };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
        { seller: { name: { contains: search } } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      where.categoryId = category;
    }

    // Stock status filter
    if (status && status !== 'all') {
      if (status === 'IN_STOCK') {
        where.stock = { gt: 10 }; // More than min stock
      } else if (status === 'LOW_STOCK') {
        where.AND = [
          { stock: { gt: 0 } },
          { stock: { lte: 10 } } // 1-10 items
        ];
      } else if (status === 'OUT_OF_STOCK') {
        where.stock = 0;
      }
    }

    const products = await db.service.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data for inventory format
    const inventory = products.map(product => {
      const currentStock = product.stock || 0;
      const minStock = 10; // You can add this field to schema if needed
      const maxStock = 100; // You can add this field to schema if needed
      
      let stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
      if (currentStock === 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (currentStock <= minStock) {
        stockStatus = 'LOW_STOCK';
      } else {
        stockStatus = 'IN_STOCK';
      }

      return {
        id: product.id,
        productName: product.title,
        seller: product.seller.name || product.seller.email,
        sku: `SKU-${product.slug.substring(0, 10).toUpperCase()}`,
        category: product.category.name,
        currentStock,
        minStock,
        maxStock,
        status: stockStatus,
        lastRestocked: product.updatedAt.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        price: `₹${product.price.toFixed(0)}`,
        location: product.city || 'N/A',
      };
    });

    // Calculate stats
    const stats = {
      total: inventory.length,
      inStock: inventory.filter(i => i.status === 'IN_STOCK').length,
      lowStock: inventory.filter(i => i.status === 'LOW_STOCK').length,
      outOfStock: inventory.filter(i => i.status === 'OUT_OF_STOCK').length,
    };

    return NextResponse.json({
      success: true,
      inventory,
      stats,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch inventory',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update product stock
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, stock, action } = body; // action: set, add, subtract

    if (!productId || stock === undefined) {
      return NextResponse.json(
        { success: false, message: 'Product ID and stock are required' },
        { status: 400 }
      );
    }

    const product = await db.service.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    let newStock = stock;
    if (action === 'add') {
      newStock = (product.stock || 0) + stock;
    } else if (action === 'subtract') {
      newStock = Math.max(0, (product.stock || 0) - stock);
    }

    const updatedProduct = await db.service.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

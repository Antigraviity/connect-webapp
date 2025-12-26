import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Dynamically import db to prevent build-time execution
    const db = (await import('@/lib/db')).default;
    
    const products = await db.service.findMany({
      where: {
        type: 'PRODUCT'
      },
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
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const productsFormatted = products.map(product => {
      // Use actual stock from database
      const stockUnits = product.stock ?? 0;
      let stockStatus = 'In Stock';
      
      if (stockUnits === 0) {
        stockStatus = 'Out of Stock';
      } else if (stockUnits < 10) {
        stockStatus = 'Low Stock';
      }

      // Parse images safely
      let imageUrl = null;
      if (product.images) {
        try {
          const parsedImages = JSON.parse(product.images);
          // Filter out null/undefined/empty values and get first valid image
          const validImages = Array.isArray(parsedImages) 
            ? parsedImages.filter((img: any) => img && img !== null && img !== undefined && img !== '')
            : [];
          imageUrl = validImages.length > 0 ? validImages[0] : null;
        } catch (e) {
          // If parsing fails, treat as string
          imageUrl = product.images;
        }
      }

      return {
        id: product.id,
        name: product.title,
        seller: product.seller.name || product.seller.email,
        sellerLocation: product.seller.city || 'India',
        category: product.category?.name || 'Uncategorized',
        price: product.price,
        discountPrice: product.discountPrice,
        discountPercent: product.discountPrice 
          ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
          : 0,
        stock: stockUnits,
        stockStatus: stockStatus,
        rating: product.rating || 0,
        reviews: product.totalReviews || product._count.reviews,
        status: product.status,
        featured: product.featured,
        image: imageUrl,
        createdAt: new Date(product.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
      };
    });

    // Calculate statistics
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'APPROVED').length;
    const pendingProducts = products.filter(p => p.status === 'PENDING').length;
    const lowStockProducts = productsFormatted.filter(p => p.stock < 10 && p.stock > 0).length;
    const outOfStockProducts = productsFormatted.filter(p => p.stock === 0).length;

    const stats = {
      total: totalProducts,
      active: activeProducts,
      pending: pendingProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
    };

    return NextResponse.json({
      success: true,
      products: productsFormatted,
      stats: stats,
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

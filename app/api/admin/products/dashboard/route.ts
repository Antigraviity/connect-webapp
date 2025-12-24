import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all products
    const products = await db.service.findMany({
      where: {
        type: 'PRODUCT'
      },
      include: {
        _count: {
          select: {
            orders: true,
            favorites: true,
          }
        }
      }
    });

    // Get all product sellers
    const sellers = await db.user.findMany({
      where: {
        userType: 'SELLER',
        services: {
          some: {
            type: 'PRODUCT'
          }
        }
      }
    });

    // Get all product orders
    const allOrders = await db.order.findMany({
      where: {
        service: {
          type: 'PRODUCT'
        }
      },
      include: {
        service: {
          select: {
            title: true,
          }
        },
        buyer: {
          select: {
            name: true,
          }
        },
        seller: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Calculate time-based metrics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Today's orders
    const todayOrders = allOrders.filter(order => 
      new Date(order.createdAt) >= today
    );

    // This week's orders
    const weekOrders = allOrders.filter(order => 
      new Date(order.createdAt) >= thisWeek
    );

    // This month's revenue
    const monthRevenue = allOrders
      .filter(order => new Date(order.createdAt) >= thisMonth)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Order status counts
    const deliveredOrders = weekOrders.filter(o => o.status === 'COMPLETED').length;
    const inTransitOrders = allOrders.filter(o => o.status === 'IN_PROGRESS').length;
    const processingOrders = allOrders.filter(o => o.status === 'CONFIRMED').length;
    const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;

    // Low stock products (products with less than 15 orders - simplified logic)
    const lowStockProducts = products
      .filter(p => p._count.orders < 15)
      .sort((a, b) => a._count.orders - b._count.orders)
      .slice(0, 4)
      .map(product => ({
        name: product.title,
        seller: 'Seller',
        stock: product._count.orders,
      }));

    // Wishlisted items
    const wishlistedCount = products.reduce((sum, p) => sum + p._count.favorites, 0);

    // Recent orders (last 5)
    const recentOrders = allOrders.slice(0, 5).map(order => {
      let statusLabel = 'CONFIRMED';
      if (order.status === 'COMPLETED') statusLabel = 'DELIVERED';
      else if (order.status === 'IN_PROGRESS') statusLabel = 'OUT_FOR_DELIVERY';
      else if (order.status === 'CONFIRMED') statusLabel = 'PROCESSING';
      else if (order.status === 'PENDING') statusLabel = 'CONFIRMED';

      const timeAgo = getTimeAgo(new Date(order.createdAt));

      return {
        id: order.orderNumber || order.id.substring(0, 8).toUpperCase(),
        product: order.service?.title || 'Unknown Product',
        customer: order.buyer?.name || order.customerName || 'Unknown',
        seller: order.seller?.name || 'Unknown Seller',
        amount: `₹${order.totalAmount?.toLocaleString('en-IN') || 0}`,
        status: statusLabel,
        time: timeAgo,
      };
    });

    // Calculate percentage changes (mock for now - you can enhance with actual historical data)
    const stats = {
      totalProducts: products.length,
      activeSellers: sellers.length,
      todayOrders: todayOrders.length,
      monthlyRevenue: monthRevenue,
      deliveredOrders: deliveredOrders,
      inTransitOrders: inTransitOrders,
      processingOrders: processingOrders,
      pendingOrders: pendingOrders,
      lowStockProducts: lowStockProducts,
      wishlistedCount: wishlistedCount,
    };

    return NextResponse.json({
      success: true,
      stats: stats,
      recentOrders: recentOrders,
    });

  } catch (error) {
    console.error('Products dashboard fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

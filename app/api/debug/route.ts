import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Debug API to check ALL services without any filtering
export async function GET(request: NextRequest) {
  try {
    // Get ALL services from database - no filters at all
    const allServices = await db.service.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        city: true,
        zipCode: true,
        sellerId: true,
        categoryId: true,
        images: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all services with type SERVICE
    const servicesOnly = await db.service.findMany({
      where: { type: 'SERVICE' },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        city: true,
        zipCode: true,
        sellerId: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get approved services only
    const approvedServices = await db.service.findMany({
      where: { 
        type: 'SERVICE',
        status: 'APPROVED'
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        city: true,
        zipCode: true,
        sellerId: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check for bridal makeup specifically (MySQL compatible - no mode)
    const bridalMakeup = await db.service.findFirst({
      where: {
        title: { contains: 'bridal' }
      },
      include: {
        seller: true,
        category: true,
      }
    });

    // Check if seller exists for bridal makeup
    let sellerExists = null;
    if (bridalMakeup?.sellerId) {
      sellerExists = await db.user.findUnique({
        where: { id: bridalMakeup.sellerId },
        select: { id: true, name: true, email: true }
      });
    }

    // Get all unique seller IDs from services
    const uniqueSellerIds = [...new Set(allServices.map(s => s.sellerId))];
    
    // Check which sellers exist
    const existingSellers = await db.user.findMany({
      where: { id: { in: uniqueSellerIds } },
      select: { id: true, name: true }
    });
    
    const existingSellerIds = existingSellers.map(s => s.id);
    const missingSellerIds = uniqueSellerIds.filter(id => !existingSellerIds.includes(id));

    return NextResponse.json({
      success: true,
      debug: {
        totalInDatabase: allServices.length,
        servicesOnly: servicesOnly.length,
        approvedServices: approvedServices.length,
        uniqueSellerIds: uniqueSellerIds.length,
        existingSellerIds: existingSellerIds.length,
        missingSellerIds: missingSellerIds,
      },
      bridalMakeup: bridalMakeup ? {
        id: bridalMakeup.id,
        title: bridalMakeup.title,
        type: bridalMakeup.type,
        status: bridalMakeup.status,
        sellerId: bridalMakeup.sellerId,
        sellerExists: !!sellerExists,
        seller: sellerExists,
        category: bridalMakeup.category?.name,
      } : 'NOT FOUND',
      allServices: allServices.map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        status: s.status,
        sellerId: s.sellerId,
        sellerExists: existingSellerIds.includes(s.sellerId),
      })),
      approvedServicesList: approvedServices.map(s => ({
        id: s.id,
        title: s.title,
        status: s.status,
        sellerId: s.sellerId,
      })),
    }, { status: 200 });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch debug info',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

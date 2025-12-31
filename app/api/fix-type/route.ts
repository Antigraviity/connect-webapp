import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// API to fix item types in database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, newType } = body;

    if (!id || !newType) {
      return NextResponse.json({
        success: false,
        message: 'Please provide id and newType (SERVICE or PRODUCT)'
      }, { status: 400 });
    }

    if (newType !== 'SERVICE' && newType !== 'PRODUCT') {
      return NextResponse.json({
        success: false,
        message: 'newType must be SERVICE or PRODUCT'
      }, { status: 400 });
    }

    // Update the item type
    const updated = await db.service.update({
      where: { id },
      data: { type: newType },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: `Updated "${updated.title}" to type: ${newType}`,
      item: updated
    }, { status: 200 });

  } catch (error) {
    console.error('Fix type error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update type',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Show all items with their types
export async function GET(request: NextRequest) {
  try {
    const items = await db.service.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        city: true,
        zipCode: true,
        category: {
          select: {
            name: true,
            type: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const products = items.filter(i => i.type === 'PRODUCT');
    const services = items.filter(i => i.type === 'SERVICE');

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalServices: services.length,
        total: items.length,
      },
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        type: p.type,
        status: p.status,
        city: p.city,
        zipCode: p.zipCode,
        categoryName: p.category?.name,
        categoryType: p.category?.type,
      })),
      services: services.map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        status: s.status,
        city: s.city,
        zipCode: s.zipCode,
        categoryName: s.category?.name,
        categoryType: s.category?.type,
      })),
      // Items that might have wrong type (category type doesn't match item type)
      mismatchedItems: items.filter(i => i.category?.type && i.category.type !== i.type).map(i => ({
        id: i.id,
        title: i.title,
        itemType: i.type,
        categoryType: i.category?.type,
        suggestion: `Change type from ${i.type} to ${i.category?.type}`
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Get types error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get items',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

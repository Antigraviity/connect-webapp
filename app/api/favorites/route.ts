import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch user's favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // Filter by service type: SERVICE or PRODUCT

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { userId };
    
    // Filter by service type if provided
    if (type) {
      where.service = {
        type: type
      };
    }

    const favorites = await db.favorite.findMany({
      where,
      include: {
        service: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                verified: true,
                image: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      favorites,
      count: favorites.length,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, serviceId } = body;

    if (!userId || !serviceId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Service ID are required' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await db.favorite.findUnique({
      where: {
        userId_serviceId: { userId, serviceId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Service already in favorites' },
        { status: 400 }
      );
    }

    // Create favorite
    const favorite = await db.favorite.create({
      data: {
        userId,
        serviceId,
      },
      include: {
        service: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                verified: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Added to favorites',
      favorite,
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const serviceId = searchParams.get('serviceId');

    if (!userId || !serviceId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Service ID are required' },
        { status: 400 }
      );
    }

    // Delete favorite
    await db.favorite.delete({
      where: {
        userId_serviceId: { userId, serviceId },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}

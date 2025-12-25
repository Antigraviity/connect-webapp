import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET single service by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to find by ID first, then by slug
    let service = await db.service.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            verified: true,
            phone: true,
            city: true,
            state: true,
          }
        },
        category: true,
        subCategory: true,
        attributes: true,
        schedules: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    // If not found by ID, try slug
    if (!service) {
      service = await db.service.findUnique({
        where: { slug: id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              verified: true,
              phone: true,
              city: true,
              state: true,
            }
          },
          category: true,
          subCategory: true,
          attributes: true,
          schedules: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
    }
    
    if (!service) {
      return NextResponse.json({
        success: false,
        message: 'Service not found'
      }, { status: 404 });
    }
    
    // Increment views
    await db.service.update({
      where: { id: service.id },
      data: { views: { increment: 1 } }
    });
    
    return NextResponse.json({
      success: true,
      data: service
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get service error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch service',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Build update object dynamically
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.discountPrice !== undefined) updateData.discountPrice = body.discountPrice ? parseFloat(body.discountPrice) : null;
    if (body.duration !== undefined) updateData.duration = parseInt(body.duration);
    if (body.images !== undefined) updateData.images = body.images;
    if (body.video !== undefined) updateData.video = body.video;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.popular !== undefined) updateData.popular = body.popular;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.metaKeywords !== undefined) updateData.metaKeywords = body.metaKeywords;
    
    // Location fields
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode;
    if (body.latitude !== undefined) updateData.latitude = body.latitude ? parseFloat(body.latitude) : null;
    if (body.longitude !== undefined) updateData.longitude = body.longitude ? parseFloat(body.longitude) : null;
    
    // Stock for products
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock) || 0;
    
    const service = await db.service.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update service',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if service exists
    const service = await db.service.findUnique({
      where: { id }
    });
    
    if (!service) {
      return NextResponse.json({
        success: false,
        message: 'Service not found'
      }, { status: 404 });
    }
    
    await db.service.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete service',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch job alerts for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const alerts = await prisma.jobAlert.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      alerts: alerts,
    });
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch job alerts', error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new job alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      keywords,
      location,
      jobTypes,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      frequency,
    } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { success: false, message: 'User ID and title are required' },
        { status: 400 }
      );
    }

    const alert = await prisma.jobAlert.create({
      data: {
        userId,
        title,
        keywords: keywords ? JSON.stringify(keywords) : null,
        location: location || null,
        jobTypes: jobTypes ? JSON.stringify(jobTypes) : null,
        experienceMin: experienceMin || null,
        experienceMax: experienceMax || null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        frequency: frequency || 'DAILY',
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Job alert created successfully',
      alert,
    });
  } catch (error) {
    console.error('Error creating job alert:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create job alert', error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Update a job alert
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, ...updateData } = body;

    if (!alertId) {
      return NextResponse.json(
        { success: false, message: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Process JSON fields
    if (updateData.keywords && Array.isArray(updateData.keywords)) {
      updateData.keywords = JSON.stringify(updateData.keywords);
    }
    if (updateData.jobTypes && Array.isArray(updateData.jobTypes)) {
      updateData.jobTypes = JSON.stringify(updateData.jobTypes);
    }

    const alert = await prisma.jobAlert.update({
      where: { id: alertId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Job alert updated successfully',
      alert,
    });
  } catch (error) {
    console.error('Error updating job alert:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update job alert', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a job alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { success: false, message: 'Alert ID is required' },
        { status: 400 }
      );
    }

    await prisma.jobAlert.delete({
      where: { id: alertId },
    });

    return NextResponse.json({
      success: true,
      message: 'Job alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job alert:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete job alert', error: String(error) },
      { status: 500 }
    );
  }
}

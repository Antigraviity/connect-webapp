import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch job applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');
    const jobId = searchParams.get('jobId');
    const employerId = searchParams.get('employerId');
    const status = searchParams.get('status');

    const where: any = {};

    if (applicantId) {
      where.applicantId = applicantId;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (employerId) {
      where.job = {
        employerId: employerId
      };
    }

    if (status) {
      where.status = status;
    }

    const applications = await db.jobApplication.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            companyName: true,
            companyLogo: true,
            city: true,
            state: true,
            jobType: true,
            salaryMin: true,
            salaryMax: true,
            salaryPeriod: true,
            status: true,
            employer: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        },
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST - Create new job application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobId,
      applicantId,
      applicantName,
      applicantEmail,
      applicantPhone,
      coverLetter,
      resume,
    } = body;

    if (!jobId || !applicantId) {
      return NextResponse.json(
        { success: false, message: 'Job ID and Applicant ID are required' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await db.jobApplication.findFirst({
      where: {
        jobId,
        applicantId,
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, title: true }
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Create application
    const application = await db.jobApplication.create({
      data: {
        jobId,
        applicantId,
        applicantName,
        applicantEmail,
        applicantPhone,
        coverLetter,
        resume,
        status: 'PENDING',
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// PATCH - Update application status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, message: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const application = await db.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        ...(notes && { notes }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application,
    });
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update application' },
      { status: 500 }
    );
  }
}

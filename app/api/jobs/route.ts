import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

// GET - Fetch jobs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');
    const status = searchParams.get('status');
    const jobType = searchParams.get('jobType');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug'); // Add slug parameter
    const jobId = searchParams.get('id'); // Add id parameter
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // If slug or id is provided, fetch single job
    if (slug) {
      where.slug = slug;
    }

    if (jobId) {
      where.id = jobId;
    }

    if (employerId) {
      where.employerId = employerId;
    }

    if (status) {
      where.status = status;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (city) {
      where.city = { contains: city };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { companyName: { contains: search } },
        { skills: { contains: search } },
      ];
    }

    // Fetch jobs
    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              verified: true,
              industry: true,
              companySize: true,
              linkedin: true,
              website: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { postedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      db.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST - Create new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      jobType = 'FULL_TIME',
      experienceLevel,
      minExperience,
      maxExperience,
      skills,
      education,
      salaryMin,
      salaryMax,
      salaryPeriod,
      showSalary = true,
      location,
      city,
      state,
      country,
      zipCode,
      isRemote = false,
      status = 'ACTIVE',
      featured = false,
      urgent = false,
      deadline,
      employerId,
      companyName,
      companyLogo,
    } = body;

    if (!title || !description || !employerId) {
      return NextResponse.json(
        { success: false, message: 'Title, description, and employer ID are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const slug = generateSlug(title);

    // Create the job
    const job = await db.job.create({
      data: {
        title,
        slug,
        description,
        requirements,
        responsibilities,
        benefits,
        jobType,
        experienceLevel,
        minExperience,
        maxExperience,
        skills: skills ? JSON.stringify(skills) : null,
        education,
        salaryMin,
        salaryMax,
        salaryPeriod,
        showSalary,
        location,
        city,
        state,
        country,
        zipCode,
        isRemote,
        status,
        featured,
        urgent,
        deadline: deadline ? new Date(deadline) : null,
        postedAt: status === 'ACTIVE' ? new Date() : null,
        employerId,
        companyName,
        companyLogo,
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create job' },
      { status: 500 }
    );
  }
}

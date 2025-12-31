import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch job seeker profile(s)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const skills = searchParams.get('skills');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    // If userId is provided, fetch specific profile
    if (userId) {
      const profile = await db.jobSeekerProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              city: true,
              state: true,
              country: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        profile,
      });
    }

    // Build filter for talent pool
    const where: any = {
      isPublic: true,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Search by name, headline, skills
    if (search) {
      where.OR = [
        { headline: { contains: search } },
        { currentRole: { contains: search } },
        { skills: { contains: search } },
        { user: { name: { contains: search } } },
      ];
    }

    // Fetch all public profiles for talent pool
    const profiles = await db.jobSeekerProfile.findMany({
      where,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            city: true,
            state: true,
            country: true,
          },
        },
      },
    });

    // Filter by skills if provided
    let filteredProfiles = profiles;
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      filteredProfiles = profiles.filter(profile => {
        if (!profile.skills) return false;
        try {
          const profileSkills = JSON.parse(profile.skills).map((s: string) => s.toLowerCase());
          return skillsArray.some(skill => profileSkills.includes(skill));
        } catch {
          return profile.skills.toLowerCase().includes(skills.toLowerCase());
        }
      });
    }

    // Get counts by status
    const counts = await db.jobSeekerProfile.groupBy({
      by: ['status'],
      where: { isPublic: true },
      _count: true,
    });

    const statusCounts = {
      total: filteredProfiles.length,
      AVAILABLE: counts.find(c => c.status === 'AVAILABLE')?._count || 0,
      OPEN_TO_OFFERS: counts.find(c => c.status === 'OPEN_TO_OFFERS')?._count || 0,
      NOT_LOOKING: counts.find(c => c.status === 'NOT_LOOKING')?._count || 0,
      EMPLOYED: counts.find(c => c.status === 'EMPLOYED')?._count || 0,
    };

    return NextResponse.json({
      success: true,
      profiles: filteredProfiles,
      counts: statusCounts,
    });
  } catch (error) {
    console.error('Error fetching job seeker profiles:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

// POST - Create or Update job seeker profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Handle profile image update if present in the request
    // This updates the User model since image is a user property
    if (profileData.profileImage) {
      try {
        await db.user.update({
          where: { id: userId },
          data: { image: profileData.profileImage }
        });
      } catch (userUpdateError) {
        console.error('Error updating user profile image:', userUpdateError);
        // We continue even if image update fails, or we could return error
      }
    }

    // Prepare data - convert arrays to JSON strings
    // Filter out fields that don't belong to JobSeekerProfile model
    const dataToSave: any = { ...profileData };

    // Remove fields that don't belong to JobSeekerProfile
    delete dataToSave.profileImage;
    delete dataToSave.resumeFile;
    const arrayFields = ['skills', 'primarySkills', 'education', 'certifications', 'preferredJobTypes', 'preferredLocations', 'experience', 'tags'];

    for (const field of arrayFields) {
      if (dataToSave[field] && Array.isArray(dataToSave[field])) {
        dataToSave[field] = JSON.stringify(dataToSave[field]);
      }
    }

    // Handle availableFrom date
    if (dataToSave.availableFrom) {
      dataToSave.availableFrom = new Date(dataToSave.availableFrom);
    }

    // Upsert profile
    const profile = await db.jobSeekerProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...dataToSave,
      },
      update: dataToSave,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      profile,
    });
  } catch (error) {
    console.error('Error saving job seeker profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save profile' },
      { status: 500 }
    );
  }
}

// DELETE - Delete job seeker profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    await db.jobSeekerProfile.delete({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job seeker profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}

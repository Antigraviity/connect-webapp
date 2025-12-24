import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch job categories with statistics
export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET request received for job categories');
    
    // Fetch all job categories
    const categories = await db.jobCategory.findMany({
      orderBy: [
        { status: 'desc' },
        { name: 'asc' }
      ]
    });

    console.log(`✅ Found ${categories.length} categories`);

    // Get statistics for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const [totalJobs, activeJobs, applications] = await Promise.all([
          db.job.count(),
          db.job.count({ where: { status: 'ACTIVE' } }),
          db.jobApplication.count()
        ]);

        // Calculate average salary
        const jobsWithSalary = await db.job.findMany({
          where: {
            salaryMin: { not: null },
            salaryMax: { not: null }
          },
          select: {
            salaryMin: true,
            salaryMax: true
          },
          take: 100
        });

        let avgSalary = '₹0 LPA';
        if (jobsWithSalary.length > 0) {
          const totalSalary = jobsWithSalary.reduce((sum, job) => {
            const avg = ((job.salaryMin || 0) + (job.salaryMax || 0)) / 2;
            return sum + avg;
          }, 0);
          const average = totalSalary / jobsWithSalary.length;
          avgSalary = `₹${(average / 100000).toFixed(1)} LPA`;
        }

        // Calculate growth
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const [recentJobs, previousJobs] = await Promise.all([
          db.job.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
          db.job.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } })
        ]);

        const growth = previousJobs > 0 
          ? ((recentJobs - previousJobs) / previousJobs * 100).toFixed(1)
          : '0';
        const trend = parseFloat(growth) >= 0 ? 'up' : 'down';

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          slug: category.slug,
          status: category.status,
          subCategories: category.subCategories,
          totalJobs: Math.floor(totalJobs / Math.max(categories.length, 1)),
          activeJobs: Math.floor(activeJobs / Math.max(categories.length, 1)),
          totalApplications: Math.floor(applications / Math.max(categories.length, 1)),
          avgSalary,
          growth: `${parseFloat(growth) > 0 ? '+' : ''}${growth}%`,
          trend,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        };
      })
    );

    // Calculate overall statistics
    const [totalCategories, totalJobs, totalApplications] = await Promise.all([
      db.jobCategory.count({ where: { status: 'Active' } }),
      db.job.count(),
      db.jobApplication.count()
    ]);

    const allJobsWithSalary = await db.job.findMany({
      where: {
        salaryMin: { not: null },
        salaryMax: { not: null }
      },
      select: { salaryMin: true, salaryMax: true }
    });

    let overallAvgSalary = '₹0 LPA';
    if (allJobsWithSalary.length > 0) {
      const totalSalary = allJobsWithSalary.reduce((sum, job) => {
        const avg = ((job.salaryMin || 0) + (job.salaryMax || 0)) / 2;
        return sum + avg;
      }, 0);
      const average = totalSalary / allJobsWithSalary.length;
      overallAvgSalary = `₹${(average / 100000).toFixed(1)} LPA`;
    }

    return NextResponse.json({
      success: true,
      categories: categoriesWithStats,
      stats: {
        totalCategories,
        totalJobs,
        totalApplications,
        avgSalary: overallAvgSalary
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job categories:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch job categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new job category
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST request received for creating job category');
    
    const body = await request.json();
    console.log('📦 Request body:', body);
    
    const { name, description, icon, color, subCategories, status } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, message: 'Description is required' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    console.log('🔍 Checking if category exists...');
    
    // Check if category already exists
    const existingCategory = await db.jobCategory.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      console.log('⚠️  Category already exists:', existingCategory.name);
      return NextResponse.json(
        { success: false, message: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    // Parse subcategories
    let parsedSubCategories = null;
    if (subCategories) {
      if (typeof subCategories === 'string') {
        const subCatArray = subCategories
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        parsedSubCategories = JSON.stringify(subCatArray);
      } else if (Array.isArray(subCategories)) {
        parsedSubCategories = JSON.stringify(subCategories);
      }
    }

    console.log('💾 Creating category...');
    
    // Create the category
    const newCategory = await db.jobCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon || '📁',
        color: color || '#8B5CF6',
        subCategories: parsedSubCategories,
        status: status || 'Active'
      }
    });

    console.log('✅ Job category created successfully:', newCategory.id);

    return NextResponse.json({
      success: true,
      message: 'Job category created successfully',
      category: newCategory
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating job category:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create job category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update job category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, icon, color, subCategories, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const existingCategory = await db.jobCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    
    if (name && name.trim() !== existingCategory.name) {
      updateData.name = name.trim();
      updateData.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    if (description !== undefined) updateData.description = description?.trim() || null;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (status) updateData.status = status;

    if (subCategories !== undefined) {
      if (typeof subCategories === 'string') {
        const subCatArray = subCategories
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        updateData.subCategories = JSON.stringify(subCatArray);
      } else if (Array.isArray(subCategories)) {
        updateData.subCategories = JSON.stringify(subCategories);
      } else {
        updateData.subCategories = null;
      }
    }

    const updatedCategory = await db.jobCategory.update({
      where: { id },
      data: updateData
    });

    console.log('✅ Job category updated:', updatedCategory.id);

    return NextResponse.json({
      success: true,
      message: 'Job category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('❌ Error updating job category:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update job category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete job category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const existingCategory = await db.jobCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    await db.jobCategory.delete({
      where: { id }
    });

    console.log('✅ Job category deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Job category deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting job category:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete job category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

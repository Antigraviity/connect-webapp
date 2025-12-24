/**
 * Example: Team Management API Route with Demo User Filtering
 * This shows how to implement demo user filtering for team members
 * 
 * USAGE: Copy this pattern to your actual team management API route
 */

import { NextRequest, NextResponse } from 'next/server';
import { isDemoUser } from '@/lib/demo-user-utils';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get current user from your auth system
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all team members from database
    let teamMembers = await prisma.user.findMany({
      where: {
        // Add any additional filtering (e.g., by organization, status)
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // **KEY FILTERING LOGIC FOR DEMO USERS**
    // If user is a demo user, only show themselves in the team list
    // This prevents demo users from seeing other real users
    if (isDemoUser(user)) {
      teamMembers = teamMembers.filter(member => 
        member.id === user.id || 
        member.email === user.email
      );
      
      console.log(`Demo user ${user.email} - Filtered to ${teamMembers.length} team members`);
    }

    // Return filtered data
    return NextResponse.json({
      success: true,
      teamMembers: teamMembers,
      count: teamMembers.length,
      isDemo: isDemoUser(user)
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

/**
 * Example for updating team members
 * Demo users should only be able to edit their own profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, ...updateData } = await request.json();

    // **PREVENT DEMO USERS FROM EDITING OTHER USERS**
    if (isDemoUser(user) && userId !== user.id) {
      return NextResponse.json(
        { error: 'Demo users can only edit their own profile' },
        { status: 403 }
      );
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * Example for deleting team members
 * Demo users should NOT be able to delete any users
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // **BLOCK ALL DELETE OPERATIONS FOR DEMO USERS**
    if (isDemoUser(user)) {
      return NextResponse.json(
        { error: 'Demo users cannot delete team members' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get current user
 */
async function getCurrentUser(request: NextRequest) {
  // Implement your auth logic here
  return null;
}

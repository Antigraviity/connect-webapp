/**
 * Demo User Utility Functions for GLAM AI
 * These functions help identify and filter content for demo users
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  userType?: 'BUYER' | 'SELLER' | 'EMPLOYER';
}

/**
 * Check if a user is a demo user based on various criteria
 * @param user - User object with email, name, id, etc.
 * @returns boolean - true if user is a demo user
 */
export function isDemoUser(user: User | null | undefined): boolean {
  if (!user) return false;

  // Check multiple criteria for demo user identification
  const email = user.email?.toLowerCase() || '';
  const name = user.name?.toLowerCase() || '';
  const role = user.role?.toLowerCase() || '';

  // Check various demo indicators
  return (
    // Email-based checks
    email.includes('demo') ||
    email === 'demo@glamai.com' ||
    email === 'demo.user@dillards.com' ||
    email.startsWith('demo@') ||
    
    // Name-based checks
    name.includes('demo') ||
    name === 'demo user' ||
    
    // Role-based checks
    role === 'demo' ||
    
    // ID-based check (if you have a specific demo user ID)
    user.id === 'demo-user-id'
  );
}

/**
 * Check if a user should see existing data
 * Demo users should NOT see existing data
 * @param user - User object
 * @returns boolean - true if user should see existing data
 */
export function shouldShowExistingData(user: User | null | undefined): boolean {
  return !isDemoUser(user);
}

/**
 * Check if user can see an image
 * For demo users: only if they approved it for their job
 * For regular users: all images
 */
export function canUserSeeImage(image: any, user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Regular users can see everything
  if (!isDemoUser(user)) {
    return true;
  }

  // Demo users can only see images they approved
  // Check various approval scenarios
  return (
    // Direct approval
    image.approvedBy === user.id ||
    image.approvedByEmail === user.email ||
    
    // Approval array
    image.approvals?.some((approval: any) => 
      approval.userId === user.id || 
      approval.userEmail === user.email ||
      (approval.status === 'approved' && approval.userId === user.id)
    ) ||
    
    // Job ownership
    image.jobUserId === user.id ||
    image.job?.userId === user.id ||
    image.job?.createdBy === user.id ||
    
    // Created by demo user
    image.userId === user.id ||
    image.createdBy === user.id
  );
}

/**
 * Filter images for demo user based on their approvals
 */
export function filterImagesForDemoUser(images: any[], user: User | null | undefined): any[] {
  if (!user || !isDemoUser(user)) {
    return images;
  }

  // For demo users, only return images they have approved or created
  return images.filter(image => canUserSeeImage(image, user));
}

/**
 * Filter team members for demo users
 * Demo users should see NO team members (empty array)
 */
export function filterTeamForDemoUser(teamMembers: any[], user: User | null | undefined): any[] {
  if (!user || !isDemoUser(user)) {
    return teamMembers;
  }

  // For demo users, return empty array - no team data visible
  return [];
}

/**
 * Check if demo user should see team section at all
 */
export function shouldShowTeamSection(user: User | null | undefined): boolean {
  return !isDemoUser(user);
}

/**
 * Get demo user configuration
 */
export function getDemoUserConfig() {
  return {
    showExistingImages: false,
    showTeamMembers: false,
    showOnlyApprovedImages: true,
    canEditOthersData: false,
    canDeleteOthersData: false,
    maxImagesAllowed: 50,
    maxProjectsAllowed: 5,
  };
}

/**
 * Log demo user action for debugging
 */
export function logDemoUserAction(user: User | null | undefined, action: string, details?: any) {
  if (isDemoUser(user)) {
    console.log(`[DEMO USER] ${user?.email} - ${action}`, details || '');
  }
}

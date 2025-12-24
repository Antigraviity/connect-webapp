/**
 * Demo User API Middleware
 * Automatically filters API responses for demo users
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isDemoUser, filterDataForDemoUser } from './demo-user-utils';

export interface DemoUserFilterOptions {
  /**
   * Field name that indicates the creator of an item
   * Default: 'createdBy'
   */
  createdByField?: string;
  
  /**
   * Whether to completely hide data or show empty arrays
   * Default: false (show empty arrays)
   */
  hideCompletely?: boolean;
  
  /**
   * Custom filter function for complex filtering logic
   */
  customFilter?: (data: any[], user: any) => any[];
}

/**
 * Filter API response data for demo users
 * This function can be used in API routes to automatically filter data
 */
export function filterApiResponseForDemoUser(
  data: any,
  user: any,
  options: DemoUserFilterOptions = {}
): any {
  const {
    createdByField = 'createdBy',
    hideCompletely = false,
    customFilter
  } = options;

  // If not a demo user, return data as-is
  if (!isDemoUser(user)) {
    return data;
  }

  // If it's a single object
  if (!Array.isArray(data)) {
    // For single objects, check if it belongs to the demo user
    if (data[createdByField] && data[createdByField] !== user.id) {
      return hideCompletely ? null : {};
    }
    return data;
  }

  // If it's an array, filter it
  if (customFilter) {
    return customFilter(data, user);
  }

  return filterDataForDemoUser(data, user, createdByField);
}

/**
 * Create a wrapper for API route handlers
 * This automatically filters responses for demo users
 */
export function withDemoUserFilter(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: DemoUserFilterOptions = {}
) {
  return async (request: NextRequest, context: any) => {
    // Call the original handler
    const response = await handler(request, context);
    
    // Get user from request (you'll need to implement getUserFromRequest)
    const user = await getUserFromRequest(request);
    
    if (!user || !isDemoUser(user)) {
      return response;
    }

    // Parse the response JSON
    const responseData = await response.json();
    
    // Filter the data
    const filteredData = filterApiResponseForDemoUser(
      responseData,
      user,
      options
    );

    // Return new response with filtered data
    return NextResponse.json(filteredData, {
      status: response.status,
      headers: response.headers,
    });
  };
}

/**
 * Helper to get user from request
 * You'll need to adapt this based on your auth implementation
 */
async function getUserFromRequest(request: NextRequest): Promise<any | null> {
  try {
    // Option 1: Get from session cookie
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie) {
      // Decode and return user
      // This depends on your auth implementation
    }

    // Option 2: Get from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      // Decode JWT or validate token
      // This depends on your auth implementation
    }

    // Option 3: Get from custom header
    const userHeader = request.headers.get('x-user-id');
    if (userHeader) {
      // Fetch user by ID
      // This depends on your user storage
    }

    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

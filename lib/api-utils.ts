/**
 * API Utilities for Scalable API Routes
 * 
 * Provides helpers for:
 * - Rate limiting
 * - Caching
 * - Error handling
 * - Response formatting
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache, cacheKeys, cacheTTL } from './cache';
import { withRateLimit, rateLimitPresets, getClientIP } from './rateLimit';

/**
 * Standard API response format
 */
export function apiResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return apiResponse({
    success: true,
    message,
    ...data,
  }, status);
}

/**
 * Error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: any
): NextResponse {
  return apiResponse({
    success: false,
    message,
    errors,
  }, status);
}

/**
 * Not found response
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse {
  return errorResponse(`${resource} not found`, 404);
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 401);
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return errorResponse(message, 403);
}

/**
 * Server error response
 */
export function serverErrorResponse(error: unknown): NextResponse {
  console.error('Server error:', error);
  return errorResponse(
    'An unexpected error occurred',
    500,
    process.env.NODE_ENV === 'development'
      ? { detail: error instanceof Error ? error.message : 'Unknown error' }
      : undefined
  );
}

/**
 * Wrapper for API handlers with built-in rate limiting and error handling
 */
export function createAPIHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: keyof typeof rateLimitPresets | false;
    cache?: {
      key: string;
      ttl?: number;
    };
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      if (options.rateLimit !== false) {
        const preset = options.rateLimit
          ? rateLimitPresets[options.rateLimit]
          : rateLimitPresets.standard;

        const rateLimitResponse = await withRateLimit(request, preset);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // Check cache for GET requests
      if (request.method === 'GET' && options.cache) {
        const cached = cache.get(options.cache.key);
        if (cached) {
          return successResponse(cached, undefined, 200);
        }
      }

      // Execute handler
      const response = await handler(request);

      // Cache successful GET responses
      if (
        request.method === 'GET' &&
        options.cache &&
        response.status === 200
      ) {
        const data = await response.clone().json();
        if (data.success) {
          cache.set(options.cache.key, data, options.cache.ttl || cacheTTL.MEDIUM);
        }
      }

      return response;

    } catch (error) {
      return serverErrorResponse(error);
    }
  };
}

/**
 * Parse pagination parameters from request
 */
export function getPaginationParams(request: NextRequest): {
  page: number;
  limit: number;
  skip: number;
} {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create pagination response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
} {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Log API request for debugging
 */
export function logRequest(
  request: NextRequest,
  context?: string
): void {
  if (process.env.NODE_ENV === 'development') {
    const ip = getClientIP(request);
    console.log(`[API] ${request.method} ${request.url} - IP: ${ip}${context ? ` - ${context}` : ''}`);
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(
    field => body[field] === undefined || body[field] === null || body[field] === ''
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Safe JSON parse for request body
 */
export async function parseBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json() as T;
  } catch {
    return null;
  }
}

// Export cache utilities for use in API routes
export { cache, cacheKeys, cacheTTL };
export { rateLimitPresets, withRateLimit, getClientIP };

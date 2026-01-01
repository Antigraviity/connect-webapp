/**
 * Rate Limiter for API Protection
 * 
 * Protects APIs from abuse by limiting requests per IP/user.
 * Designed to be extensible for Redis (for multi-server scaling).
 * 
 * Features:
 * - Per-IP rate limiting
 * - Per-user rate limiting
 * - Abstract Store interface (switchable to Redis)
 * - Configurable limits and windows
 */

import { NextRequest, NextResponse } from 'next/server';

// ==================== STORE INTERFACE ====================

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

export interface RateLimitStore {
  /**
   * Increment the counter for a key
   * @param key - The unique key to throttle
   * @param windowMs - Time window in milliseconds
   * @returns Current count and reset time
   */
  increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }>;

  /**
   * Reset/Clear a key
   */
  reset(key: string): Promise<void>;
}

// ==================== MEMORY STORE IMPLEMENTATION ====================

interface MemoryEntry {
  count: number;
  resetTime: number;
}

export class MemoryStore implements RateLimitStore {
  private store: Map<string, MemoryEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup every 10 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // New window
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    // Existing window
    entry.count++;
    return { count: entry.count, resetTime: entry.resetTime };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// ==================== REDIS STORE (Placeholder) ====================
// class RedisStore implements RateLimitStore { ... }

// ==================== RATE LIMITER CORE ====================

export interface RateLimitConfig {
  limit: number;          // Max requests
  windowMs: number;       // Time window in milliseconds
  message?: string;       // Custom error message
  keyGenerator?: (request: NextRequest) => string;
}

export class RateLimiter {
  constructor(private store: RateLimitStore) { }

  /**
   * Check if request should be rate limited
   */
  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const { count, resetTime } = await this.store.increment(key, windowMs);

    return {
      allowed: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetTime,
    };
  }
}

// ==================== INSTANTIATION ====================

// Use global singleton to preserve state in development/serverless
const globalForRateLimiter = global as unknown as { rateLimitStore: RateLimitStore };

// Initialize Store - CHANGE THIS TO RedisStore() WHEN READY
const store = globalForRateLimiter.rateLimitStore || new MemoryStore();

if (process.env.NODE_ENV !== 'production') {
  globalForRateLimiter.rateLimitStore = store;
}

const rateLimiter = new RateLimiter(store);

// ==================== HELPERS ====================

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * Helper to apply rate limiting in API routes
 * @returns Result object or null if allowed
 */
export async function checkRateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<NextResponse | null> {
  const {
    limit = 100,
    windowMs = 60 * 1000,
    message = 'Too many requests, please try again later.',
    keyGenerator,
  } = config;

  const key = keyGenerator
    ? keyGenerator(request)
    : `ip:${getClientIP(request)}`;

  const result = await rateLimiter.check(key, limit, windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null; // Allowed
}

// Preset rate limit configurations
export const rateLimitPresets = {
  // Strict - for sensitive endpoints (login, register, password reset)
  strict: {
    limit: 5,
    windowMs: 15 * 60 * 1000, // 5 requests per 15 minutes
    message: 'Too many attempts. Please try again in 15 minutes.',
  },

  // Auth - for authentication endpoints
  auth: {
    limit: 10,
    windowMs: 15 * 60 * 1000, // 10 requests per 15 minutes
    message: 'Too many login attempts. Please try again later.',
  },

  // Standard - for regular API endpoints
  standard: {
    limit: 100,
    windowMs: 60 * 1000, // 100 requests per minute
    message: 'Rate limit exceeded. Please slow down.',
  },

  // Relaxed - for read-heavy endpoints
  relaxed: {
    limit: 300,
    windowMs: 60 * 1000, // 300 requests per minute
    message: 'Too many requests. Please try again shortly.',
  },

  // Search - for search endpoints
  search: {
    limit: 30,
    windowMs: 60 * 1000, // 30 searches per minute
    message: 'Too many search requests. Please wait a moment.',
  },

  // Upload - for file uploads
  upload: {
    limit: 10,
    windowMs: 60 * 1000, // 10 uploads per minute
    message: 'Too many uploads. Please wait before uploading more files.',
  },

  // Booking - for booking/order creation
  booking: {
    limit: 10,
    windowMs: 60 * 1000, // 10 bookings per minute
    message: 'Too many booking attempts. Please wait a moment.',
  },

  // Message - for sending messages
  message: {
    limit: 30,
    windowMs: 60 * 1000, // 30 messages per minute
    message: 'Slow down! Too many messages sent.',
  },
};

/**
 * @deprecated Use checkRateLimit instead
 */
export const withRateLimit = checkRateLimit;

export default rateLimiter;

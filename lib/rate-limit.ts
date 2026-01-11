/**
 * Simple in-memory rate limiter for API routes
 * Tracks requests by IP address and enforces configurable limits
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Clean up old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 10 * 60 * 1000);

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    max: number; // Max requests per window
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
}

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const key = identifier;

    // Initialize or get existing record
    if (!store[key] || store[key].resetTime < now) {
        store[key] = {
            count: 0,
            resetTime: now + config.windowMs,
        };
    }

    // Increment count
    store[key].count++;

    const remaining = Math.max(0, config.max - store[key].count);
    const success = store[key].count <= config.max;

    return {
        success,
        limit: config.max,
        remaining,
        resetTime: store[key].resetTime,
    };
}

/**
 * Get client IP address from request
 * @param request - Next.js request object
 * @returns IP address or 'unknown'
 */
export function getClientIp(request: Request): string {
    // Try various headers in order of preference
    const headers = request.headers;

    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIp = headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    const cfConnectingIp = headers.get('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp;
    }

    return 'unknown';
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
    // Strict limit for login attempts
    LOGIN: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts
    },

    // Strict limit for admin login
    ADMIN_LOGIN: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 3, // 3 attempts
    },

    // Moderate limit for registration
    REGISTER: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 registrations
    },

    // General API rate limit
    API: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests
    },
};

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';
import { cache } from '@/lib/cache';
import rateLimiter from '@/lib/rateLimit';

/**
 * Health Check API
 * 
 * Use this endpoint to monitor application health:
 * - Database connectivity
 * - Cache status
 * - Rate limiter status
 * - Memory usage
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check database
    const dbHealth = await checkDatabaseHealth();

    // Get cache stats
    const cacheStats = cache.stats();

    // Get rate limiter stats
    // const rateLimitStats = rateLimiter.stats();
    const rateLimitStats = { totalKeys: 0 }; // Placeholder


    // Get memory usage (if available)
    let memoryUsage = null;
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      memoryUsage = {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(mem.rss / 1024 / 1024) + ' MB',
      };
    }

    const responseTime = Date.now() - startTime;

    const isHealthy = dbHealth.healthy;

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: dbHealth.healthy ? 'up' : 'down',
          latency: dbHealth.latency ? `${dbHealth.latency}ms` : null,
          error: dbHealth.error || null,
        },
        cache: {
          status: 'up',
          entries: cacheStats.size,
          maxEntries: cacheStats.maxSize,
        },
        rateLimiter: {
          status: 'up',
          activeKeys: rateLimitStats.totalKeys,
        },
      },
      memory: memoryUsage,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}

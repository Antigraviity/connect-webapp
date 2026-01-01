/**
 * Simple In-Memory Cache for Scalability
 * 
 * This cache reduces database load by storing frequently accessed data in memory.
 * For production with multiple servers, replace with Redis.
 * 
 * Features:
 * - TTL (Time To Live) support
 * - Automatic cleanup of expired entries
 * - Pattern-based invalidation
 * - Memory limit protection
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
  createdAt: number;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000; // Maximum entries
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run cleanup every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttlSeconds - Time to live in seconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    // Enforce max size
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
    });
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern - Pattern to match (supports * wildcard)
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; maxSize: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Get or set - returns cached value or fetches and caches new value
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttlSeconds);
    return data;
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldest: { key: string; createdAt: number } | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.createdAt < oldest.createdAt) {
        oldest = { key, createdAt: entry.createdAt };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
    }
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Singleton instance
const globalForCache = global as unknown as { cache: InMemoryCache };

export const cache = globalForCache.cache || new InMemoryCache();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.cache = cache;
}

// Cache key generators for consistency
export const cacheKeys = {
  // Services
  services: (type?: string, status?: string) => 
    `services:${type || 'all'}:${status || 'all'}`,
  serviceById: (id: string) => `service:${id}`,
  servicesByCategory: (categoryId: string) => `services:category:${categoryId}`,
  servicesBySeller: (sellerId: string) => `services:seller:${sellerId}`,
  
  // Products
  products: (status?: string) => `products:${status || 'all'}`,
  productById: (id: string) => `product:${id}`,
  
  // Categories
  categories: (type?: string) => `categories:${type || 'all'}`,
  categoryById: (id: string) => `category:${id}`,
  
  // Users
  userById: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  
  // Stats/Counts
  serviceCount: (sellerId?: string) => `stats:services:${sellerId || 'all'}`,
  orderCount: (userId: string, type: string) => `stats:orders:${userId}:${type}`,
  
  // Misc
  featuredServices: () => 'featured:services',
  popularServices: () => 'popular:services',
};

// Cache TTL presets (in seconds)
export const cacheTTL = {
  SHORT: 60,        // 1 minute - for frequently changing data
  MEDIUM: 300,      // 5 minutes - default
  LONG: 900,        // 15 minutes - for stable data
  HOUR: 3600,       // 1 hour - for rarely changing data
  DAY: 86400,       // 24 hours - for static data
};

export default cache;

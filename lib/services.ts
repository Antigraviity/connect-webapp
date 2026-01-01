
import db from '@/lib/db';
import { cache, cacheKeys, cacheTTL } from '@/lib/cache';

export type ServiceFilterOptions = {
    categoryId?: string | null;
    sellerId?: string | null;
    status?: string | null;
    featured?: boolean | null;
    zipCode?: string | null;
    city?: string | null;
    type?: string | null;
    slug?: string | null;
    serviceId?: string | null;
    limit?: number;
    page?: number;
};

export type ServiceResult = {
    success: boolean;
    services: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export async function getServices(options: ServiceFilterOptions = {}): Promise<ServiceResult> {
    const {
        categoryId,
        sellerId,
        status,
        featured,
        zipCode,
        city,
        type,
        slug,
        serviceId,
        limit = 20,
        page = 1,
    } = options;

    const skip = (page - 1) * limit;

    // Generate cache key for this specific query
    const cacheKey = `services:${type || 'all'}:${status || 'approved'}:${categoryId || 'all'}:${city || 'all'}:${page}:${limit}`;

    // Check cache for public queries (not seller-specific)
    if (!sellerId && !slug && !serviceId) {
        const cached = cache.get<ServiceResult>(cacheKey);
        if (cached) {
            console.log('📦 Cache HIT for services (Server Action)');
            return cached;
        }
    }

    const where: any = {};

    if (categoryId) where.categoryId = categoryId;
    if (sellerId) where.sellerId = sellerId;
    if (slug) where.slug = slug;
    if (serviceId) where.id = serviceId;

    // Handle status filter
    if (status && status !== '' && status !== 'all') {
        where.status = status;
    } else if (!sellerId && !slug && !serviceId) {
        // Public view - only show approved if not specific request
        where.status = 'APPROVED';
    }

    if (featured) where.featured = featured;

    // Location filtering
    if (zipCode && zipCode.trim()) {
        where.zipCode = { contains: zipCode.trim() };
    }
    if (city && city.trim()) {
        where.city = { contains: city.trim() };
    }

    // Filter by service type
    if (type && type.trim()) {
        where.type = type.trim();
    }

    try {
        const [services, total] = await Promise.all([
            db.service.findMany({
                where,
                include: {
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            verified: true,
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            type: true,
                        }
                    },
                    subCategory: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            db.service.count({ where })
        ]);

        const result = {
            success: true,
            services,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };

        // Cache public queries
        if (!sellerId && !slug && !serviceId) {
            cache.set(cacheKey, result, cacheTTL.SHORT);
            console.log('📦 Cache SET for services (Server Action)');
        }

        return result;
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
}

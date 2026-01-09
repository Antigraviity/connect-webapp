"use client";

import { useState, useEffect } from "react";
import { FiStar, FiMapPin, FiHeart, FiClock, FiSearch, FiLoader, FiRefreshCw } from "react-icons/fi";

interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  images: string;
  rating: number;
  totalReviews: number;
  zipCode?: string;
  city?: string;
  state?: string;
  address?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  };
  status: string;
}

interface ServiceGridProps {
  filters: {
    category: string;
    priceRange: number[];
    rating: number;
    availability: string;
    sortBy: string;
    location: string;
    query: string;
  };
  onServiceClick: (service: any) => void;
  onCategoriesDerived?: (categories: { name: string, slug: string }[]) => void;
}

export default function ServiceGrid({
  filters,
  onServiceClick,
  onCategoriesDerived,
}: ServiceGridProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const itemsPerPage = 9;

  // Check for logged-in user and fetch their favorites
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserFavorites(parsedUser.id);
    }
  }, []);

  // Fetch user's favorites
  const fetchUserFavorites = async (userId: string) => {
    try {
      const response = await fetch(`/api/favorites?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setFavorites(data.favorites.map((f: any) => f.serviceId));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Fetch services from API - runs on mount and when location changes
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params - fetch ALL approved services of type SERVICE
      const params = new URLSearchParams();
      params.append('status', 'APPROVED');
      params.append('type', 'SERVICE');
      params.append('limit', '100'); // Get all services

      // NOTE: We do NOT filter by location in API call
      // Location filtering is done client-side to show all services initially
      // and filter when user enters a location

      console.log('Fetching all services with params:', params.toString());

      const response = await fetch(`/api/services?${params}`);
      const data = await response.json();

      console.log('Services API response:', data.success, 'Count:', data.services?.length || 0);

      if (data.success) {
        console.log('Services loaded:', data.services?.map((s: any) => ({ id: s.id, title: s.title, city: s.city, zipCode: s.zipCode })));
        setServices(data.services || []);

        // Derive categories
        if (onCategoriesDerived) {
          const uniqueCategoriesMap = new Map();
          (data.services || []).forEach((s: any) => {
            if (s.category && s.category.name && s.category.slug) {
              uniqueCategoriesMap.set(s.category.slug, {
                name: s.category.name,
                slug: s.category.slug
              });
            }
          });
          const sortedCategories = Array.from(uniqueCategoriesMap.values()).sort((a: any, b: any) =>
            a.name.localeCompare(b.name)
          );
          onCategoriesDerived(sortedCategories);
        }
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      console.error('Fetch services error:', err);
      setError('An error occurred while loading services');
    } finally {
      setLoading(false);
    }
  };

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []); // Only fetch once on mount

  const toggleFavorite = async (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();

    if (!user) {
      alert('Please sign in to add favorites');
      window.location.href = '/signin?redirect=/book-services';
      return;
    }

    try {
      setTogglingFavorite(serviceId);

      if (favorites.includes(serviceId)) {
        const response = await fetch(`/api/favorites?userId=${user.id}&serviceId=${serviceId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setFavorites(prev => prev.filter(id => id !== serviceId));
        }
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, serviceId }),
        });
        const data = await response.json();
        if (data.success) {
          setFavorites(prev => [...prev, serviceId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setTogglingFavorite(null);
    }
  };

  // Filter and sort services CLIENT-SIDE
  const filteredServices = services
    .filter((service: any) => {
      // Location filter - only apply if location is specified
      if (filters.location && filters.location.trim() !== "") {
        const searchLocation = filters.location.toLowerCase().trim();
        const serviceZip = service.zipCode?.toLowerCase() || "";
        const serviceCity = service.city?.toLowerCase() || "";
        const serviceState = service.state?.toLowerCase() || "";

        // Check if location matches zipCode, city, or state
        const locationMatches =
          serviceZip.includes(searchLocation) ||
          serviceCity.includes(searchLocation) ||
          serviceState.includes(searchLocation);

        if (!locationMatches) return false;
      }

      // Category filter
      if (filters.category && filters.category !== "all") {
        const serviceCategoryName = service.category?.name || "";
        const serviceCategorySlug = service.category?.slug || "";
        const filterCategory = filters.category.toLowerCase();

        const categoryMatches =
          serviceCategoryName.toLowerCase() === filterCategory ||
          serviceCategorySlug.toLowerCase() === filterCategory ||
          serviceCategoryName.toLowerCase().replace(/ /g, "-") === filterCategory ||
          serviceCategoryName.toLowerCase().replace(/ & /g, "-") === filterCategory;

        if (!categoryMatches) return false;
      }

      // Price filter
      const servicePrice = service.discountPrice || service.price;
      if (servicePrice > filters.priceRange[1]) return false;

      // Rating filter
      if (service.rating < filters.rating) return false;

      // Query/keyword filter
      if (filters.query && filters.query.trim() !== "") {
        const searchQuery = filters.query.toLowerCase().trim();
        const serviceTitle = service.title?.toLowerCase() || "";
        const serviceDesc = service.description?.toLowerCase() || "";
        const sellerName = service.seller?.name?.toLowerCase() || "";

        const matches =
          serviceTitle.includes(searchQuery) ||
          serviceDesc.includes(searchQuery) ||
          sellerName.includes(searchQuery);

        if (!matches) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case "price-high":
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case "rating":
          return b.rating - a.rating;
        default:
          return b.totalReviews - a.totalReviews;
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                ? "bg-primary-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600 font-medium">Loading services...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchServices}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
          >
            <FiRefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      )}

      {/* Results Header */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-heading">
            {filteredServices.length} Service{filteredServices.length !== 1 ? 's' : ''} Available
            {filters.category && filters.category !== "all" && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                in {filters.category}
              </span>
            )}
            {filters.location && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                for "{filters.location}"
              </span>
            )}
          </h2>
          <button
            onClick={fetchServices}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 border border-gray-300 rounded-lg hover:border-primary-300 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      )}

      {/* Top Pagination */}
      {!loading && !error && <Pagination />}

      {/* Service Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {currentServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-transparent hover:border-primary-300 transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              {/* Image */}
              <div
                className="relative h-40 overflow-hidden"
                onClick={() => onServiceClick(service)}
              >
                <img
                  src={service.images ? (typeof service.images === 'string' ? JSON.parse(service.images)[0] : service.images[0]) || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500' : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
                  }}
                />

                {/* Discount Badge */}
                {service.discountPrice && service.discountPrice < service.price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    {Math.round(((service.price - service.discountPrice) / service.price) * 100)}% OFF
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(e, service.id)}
                  disabled={togglingFavorite === service.id}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${favorites.includes(service.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                    } ${togglingFavorite === service.id ? 'opacity-50' : ''}`}
                  title={favorites.includes(service.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {togglingFavorite === service.id ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiHeart
                      className={`w-4 h-4 ${favorites.includes(service.id) ? 'fill-current' : ''}`}
                    />
                  )}
                </button>

                {/* Verified Badge */}
                {service.seller?.verified && (
                  <span className="absolute bottom-3 left-3 px-2 py-1 bg-primary-600 text-white text-[10px] font-semibold rounded-full">
                    Verified
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-3" onClick={() => onServiceClick(service)}>
                {/* Service Name */}
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {service.title}
                </h3>

                {/* Provider */}
                <p className="text-xs text-gray-600 mb-2">{service.seller?.name || 'Service Provider'}</p>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-semibold text-gray-900">
                      {service.rating || 0}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({service.totalReviews || 0})
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <FiMapPin className="w-3 h-3" />
                  <span>{service.city ? `${service.city}, ${service.state}` : service.address || 'Location not specified'}</span>
                </div>

                {/* Pincode Badge */}
                <div className="mb-2">
                  <span className={`inline-block px-2 py-1 text-[10px] font-semibold rounded-full ${service.zipCode
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-gray-100 text-gray-500'
                    }`}>
                    Pincode: {service.zipCode || 'Not specified'}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 text-xs text-green-600 mb-2">
                  <FiClock className="w-3 h-3" />
                  <span className="font-medium">
                    Available for Booking
                  </span>
                </div>

                {/* Price & Button */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div>
                    <p className="text-[10px] text-gray-500">Starting from</p>
                    <p className="text-lg font-bold text-primary-600">
                      ₹{service.discountPrice || service.price}
                    </p>
                    {service.discountPrice && service.discountPrice < service.price && (
                      <p className="text-[10px] text-gray-400 line-through">
                        ₹{service.price}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceClick(service);
                    }}
                    className="border-2 border-primary-500 text-primary-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-600 hover:text-white hover:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Pagination */}
      {!loading && !error && <Pagination />}

      {/* No Results */}
      {!loading && !error && filteredServices.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mb-6">
            <FiSearch className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No Services Found
          </h3>
          <p className="text-gray-600 mb-2 max-w-md mx-auto">
            {filters.location ? (
              <>
                No services found for <span className="font-semibold text-primary-600">"{filters.location}"</span>
              </>
            ) : (
              "No services match your current filters"
            )}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Try adjusting your filters or clearing the location
          </p>

          {/* Debug info */}
          <div className="text-xs text-gray-400 mb-4">
            Total services loaded: {services.length} | After filters: {filteredServices.length}
          </div>

          <button
            onClick={() => {
              // Clear location filter
              if (filters.location) {
                window.location.reload();
              }
            }}
            className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
          >
            Show All Services
          </button>
        </div>
      )}
    </div>
  );
}

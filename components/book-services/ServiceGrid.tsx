"use client";

import { useState, useEffect } from "react";
import { FiStar, FiMapPin, FiHeart, FiClock, FiSearch } from "react-icons/fi";

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
}

export default function ServiceGrid({
  filters,
  onServiceClick,
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

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query params
        const params = new URLSearchParams();
        params.append('status', 'APPROVED'); // Only show approved services
        params.append('type', 'SERVICE'); // Only show services, not products
        
        if (filters.location && filters.location.trim()) {
          params.append('zipCode', filters.location.trim());
        }
        
        const response = await fetch(`/api/services?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setServices(data.services || []);
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
    
    fetchServices();
  }, [filters.location]);

  const toggleFavorite = async (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    
    if (!user) {
      // Redirect to login if not logged in
      alert('Please sign in to add favorites');
      window.location.href = '/signin?redirect=/book-services';
      return;
    }

    try {
      setTogglingFavorite(serviceId);
      
      if (favorites.includes(serviceId)) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?userId=${user.id}&serviceId=${serviceId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setFavorites(prev => prev.filter(id => id !== serviceId));
        }
      } else {
        // Add to favorites
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

  // Filter and sort services
  const filteredServices = services
    .filter((service: any) => {
      // Category filter
      if (filters.category && filters.category !== "all") {
        const serviceCategoryName = service.category?.name || "";
        const filterCategory = filters.category;
        
        // Match either full name or slugified name
        const categoryMatches = 
          serviceCategoryName === filterCategory ||
          serviceCategoryName.toLowerCase().replace(/ /g, "-") === filterCategory.toLowerCase() ||
          serviceCategoryName.toLowerCase().replace(/ & /g, "-&-") === filterCategory.toLowerCase();
        
        if (!categoryMatches) return false;
      }
      
      // Price filter
      if (service.price > filters.priceRange[1]) return false;
      
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
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
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
                {filters.category && filters.category !== "all" ? "for" : "for"} {filters.location}
              </span>
            )}
          </h2>
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
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(e, service.id)}
                  disabled={togglingFavorite === service.id}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${
                    favorites.includes(service.id)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                  } ${togglingFavorite === service.id ? 'opacity-50' : ''}`}
                  title={favorites.includes(service.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FiHeart 
                    className={`w-4 h-4 ${favorites.includes(service.id) ? 'fill-current' : ''}`} 
                  />
                </button>
                
                {/* Verified Badge */}
                {service.seller.verified && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-primary-600 text-white text-[10px] font-semibold rounded-full">
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
                <p className="text-xs text-gray-600 mb-2">{service.seller.name}</p>

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

                {/* Location with Pincode */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <FiMapPin className="w-3 h-3" />
                  <span>{service.city ? `${service.city}, ${service.state}` : service.address || 'Location not specified'}</span>
                </div>
                
                {/* Pincode Badge */}
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-[10px] font-semibold bg-primary-50 text-primary-700 rounded-full">
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
                    {service.discountPrice && (
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
            Services Not Available
          </h3>
          <p className="text-gray-600 mb-2 max-w-md mx-auto">
            {filters.location ? (
              <>
                No services are currently available for <span className="font-semibold text-primary-600">"{filters.location}"</span>
              </>
            ) : (
              "We couldn't find any services matching your criteria"
            )}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {filters.location ? (
              "Services are only shown for their assigned pincodes. Try a different pincode or location."
            ) : (
              "Try adjusting your filters or search in a different location"
            )}
          </p>
          
          {/* Suggestions */}
          <div className="max-w-md mx-auto">
            <p className="text-sm font-semibold text-gray-700 mb-3">Suggestions:</p>
            <div className="grid grid-cols-1 gap-2 text-left">
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                <span className="text-primary-600 font-bold">•</span>
                <span>Try a different 6-digit pincode (e.g., 600001, 641001)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                <span className="text-primary-600 font-bold">•</span>
                <span>Search by city name (e.g., Chennai, Coimbatore, Salem)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                <span className="text-primary-600 font-bold">•</span>
                <span>Clear the location filter to browse all available services</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                <span className="text-primary-600 font-bold">•</span>
                <span>Each service is available only in its assigned pincode area</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

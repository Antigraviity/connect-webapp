"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPin, Navigation, Search } from "lucide-react";
import { FiStar, FiMapPin, FiHeart, FiCalendar, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiX, FiClock, FiShield, FiUser, FiPhone, FiMail, FiCheck, FiLoader, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "@/lib/useAuth";

// Service Interface
interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  images: string;
  rating: number;
  totalReviews: number;
  duration: number;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
  status: string;
  featured: boolean;
  seller: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    image?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BuyerServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [0, 50000],
    rating: 0,
    sortBy: "popularity",
    location: "",
    query: "",
  });

  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
  });

  // Typewriter effect
  const serviceTypes = [
    "home cleaning",
    "AC repair",
    "salon services",
    "plumbing",
    "electrician",
    "pest control",
  ];

  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingSpeed = isDeleting ? 60 : 100;
    const current = serviceTypes[index];

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setText(current.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setText(current.slice(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === current.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % serviceTypes.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, index]);

  // Fetch services and categories on mount
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Fetch user favorites
  useEffect(() => {
    if (user?.id) {
      fetchFavorites();
    }
  }, [user]);

  // Auto-populate location from URL
  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setAddress(locationParam);
      setFilters(prev => ({ ...prev, location: locationParam }));
    }
  }, [searchParams]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only SERVICE type (not PRODUCT)
      const response = await fetch('/api/services?status=APPROVED&type=SERVICE');
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

  const fetchCategories = async () => {
    try {
      // Fetch only SERVICE type categories
      const response = await fetch('/api/categories?type=SERVICE');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`/api/favorites?userId=${user?.id}`);
      const data = await response.json();
      
      if (data.success) {
        const favSet = new Set<string>();
        data.favorites.forEach((fav: any) => {
          favSet.add(fav.serviceId);
        });
        setFavorites(favSet);
      }
    } catch (err) {
      console.error('Fetch favorites error:', err);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setAddress("Detecting location...");
      setShowDropdown(false);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            );
            const data = await response.json();
            const pincode = data.address?.postcode || "";
            const locationText = pincode || data.display_name || `Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`;
            setAddress(locationText);
            setFilters({ ...filters, location: locationText });
          } catch (error) {
            console.error("Error fetching address:", error);
            setAddress("");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to access location. Please enable GPS or enter manually.");
          setAddress("");
        }
      );
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, location: address, query: query });
  };

  const toggleFavorite = async (serviceId: string) => {
    if (!user) {
      alert('Please sign in to add favorites');
      return;
    }

    setFavoriteLoading(serviceId);

    try {
      if (favorites.has(serviceId)) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?userId=${user.id}&serviceId=${serviceId}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
          setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(serviceId);
            return newSet;
          });
        } else {
          alert(data.message || 'Failed to remove from favorites');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            serviceId: serviceId,
          }),
        });
        const data = await response.json();

        if (data.success) {
          setFavorites(prev => new Set(prev).add(serviceId));
        } else {
          alert(data.message || 'Failed to add to favorites');
        }
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
      alert('An error occurred while updating favorites');
    } finally {
      setFavoriteLoading(null);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
  };

  // Parse images from JSON string
  const parseImages = (imagesStr: string): string[] => {
    try {
      return JSON.parse(imagesStr) || [];
    } catch {
      return [];
    }
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    if (filters.location && filters.location.trim() !== "") {
      const searchLocation = filters.location.toLowerCase().trim();
      const serviceZip = service.zipCode?.toLowerCase() || "";
      const serviceCity = service.city?.toLowerCase() || "";
      if (!serviceZip.includes(searchLocation) && !serviceCity.includes(searchLocation)) {
        return false;
      }
    }

    const servicePrice = service.discountPrice || service.price;
    if (servicePrice > filters.priceRange[1]) return false;
    if (service.rating < filters.rating) return false;

    if (filters.category !== "all") {
      if (service.category?.slug !== filters.category && service.category?.id !== filters.category) {
        return false;
      }
    }

    if (filters.query && filters.query.trim() !== "") {
      const searchQuery = filters.query.toLowerCase().trim();
      const matches =
        service.title.toLowerCase().includes(searchQuery) ||
        service.description.toLowerCase().includes(searchQuery) ||
        service.seller?.name?.toLowerCase().includes(searchQuery);
      if (!matches) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low": return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price-high": return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case "rating": return b.rating - a.rating;
      default: return b.totalReviews - a.totalReviews;
    }
  });

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Services</h1>
          <p className="text-gray-600">Find and book trusted professionals for all your needs</p>
        </div>
        <button
          onClick={fetchServices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Location Input */}
            <div className="relative flex items-center flex-1 w-full">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                type="text"
                placeholder="Enter your pincode or city"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                    <button
                      onClick={handleUseCurrentLocation}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Use my current location</div>
                        <div className="text-xs text-gray-500">Auto-detect your address</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex items-center flex-1 w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                type="text"
                placeholder={`Search for '${text}'`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>

        {/* Location Badge */}
        {filters.location && (
          <div className="mt-3">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm">
              <MapPin className="w-4 h-4" />
              <span>Showing services for: {filters.location}</span>
              <button
                onClick={() => {
                  setAddress("");
                  setFilters(prev => ({ ...prev, location: "" }));
                }}
                className="ml-1 hover:text-primary-900"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            </div>

            {/* Sort By */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection("category")}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2"
              >
                <span>Category</span>
                {expandedSections.category ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.category && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === "all"}
                      onChange={() => setFilters({ ...filters, category: "all" })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-primary-600">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category.slug || filters.category === category.id}
                        onChange={() => setFilters({ ...filters, category: category.slug })}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 group-hover:text-primary-600">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection("price")}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2"
              >
                <span>Price Range</span>
                {expandedSections.price ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.price && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>₹{filters.priceRange[0]}</span>
                    <span>₹{filters.priceRange[1]}+</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })}
                    className="w-full accent-primary-600"
                  />
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection("rating")}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2"
              >
                <span>Minimum Rating</span>
                {expandedSections.rating ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.rating && (
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0, 0].map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => setFilters({ ...filters, rating })}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 flex items-center text-sm text-gray-700 group-hover:text-primary-600">
                        {rating === 0 ? (
                          "All Ratings"
                        ) : (
                          <>
                            <FiStar className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                            {rating}+ & above
                          </>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => setFilters({
                category: "all",
                priceRange: [0, 50000],
                rating: 0,
                sortBy: "popularity",
                location: filters.location,
                query: filters.query,
              })}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {loading ? 'Loading...' : `${filteredServices.length} Services Available`}
            </h2>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-center">
                <FiLoader className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading services...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-red-500 mb-4">
                <FiX className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Services</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchServices}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredServices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">Try adjusting your filters or search criteria</p>
            </div>
          )}

          {/* Services Grid */}
          {!loading && !error && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServices.map((service) => {
                const images = parseImages(service.images);
                const imageUrl = images[0] || 'https://via.placeholder.com/400x300?text=Service';
                const isFavorite = favorites.has(service.id);
                const isLoadingFav = favoriteLoading === service.id;

                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Service';
                        }}
                      />
                      {service.discountPrice && service.discountPrice < service.price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {Math.round(((service.price - service.discountPrice) / service.price) * 100)}% OFF
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(service.id);
                        }}
                        disabled={isLoadingFav}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isFavorite
                            ? "bg-red-500 text-white"
                            : "bg-white/80 text-gray-600 hover:bg-white"
                        } ${isLoadingFav ? 'opacity-50' : ''}`}
                      >
                        {isLoadingFav ? (
                          <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiHeart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                        )}
                      </button>
                      {service.featured && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-primary-50 text-primary-700 rounded-full mb-2">
                        {service.category?.name || 'Service'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{service.title}</h3>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        {service.seller?.name || 'Provider'}
                        {service.seller?.verified && <span className="text-green-500">✓</span>}
                      </p>

                      <div className="flex items-center gap-3 mb-2 text-xs">
                        <div className="flex items-center gap-1">
                          <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="font-semibold">{service.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500">({service.totalReviews || 0})</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <FiClock className="w-3 h-3" />
                          {service.duration} mins
                        </div>
                      </div>

                      {service.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                          <FiMapPin className="w-3 h-3" />
                          {service.city}{service.state ? `, ${service.state}` : ''}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-base font-bold text-primary-600">
                            ₹{service.discountPrice || service.price}
                          </p>
                          {service.discountPrice && service.discountPrice < service.price && (
                            <p className="text-xs text-gray-400 line-through">₹{service.price}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedService(service);
                            setShowBookingModal(true);
                          }}
                          className="border-2 border-primary-500 text-primary-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-600 hover:text-white hover:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          user={user}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          onBookingComplete={() => {
            setShowBookingModal(false);
            setSelectedService(null);
            router.push('/buyer/bookings');
          }}
        />
      )}
    </div>
  );
}

// Booking Modal Component
function BookingModal({ 
  service, 
  user,
  onClose,
  onBookingComplete 
}: { 
  service: Service; 
  user: any;
  onClose: () => void;
  onBookingComplete: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerAddress, setCustomerAddress] = useState(
    user?.address 
      ? `${user.address}${user.city ? ', ' + user.city : ''}${user.state ? ', ' + user.state : ''}${user.zipCode ? ' - ' + user.zipCode : ''}`
      : ""
  );
  const [specialRequests, setSpecialRequests] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Parse images from JSON string
  const parseImages = (imagesStr: string): string[] => {
    try {
      return JSON.parse(imagesStr) || [];
    } catch {
      return [];
    }
  };

  const images = parseImages(service.images);
  const imageUrl = images[0] || 'https://via.placeholder.com/400x300?text=Service';

  const handleBooking = async () => {
    if (!user) {
      alert("Please sign in to book a service");
      return;
    }

    if (!selectedDate || !selectedTime || !customerAddress || !customerPhone) {
      alert("Please fill all required fields");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          buyerId: user.id,
          sellerId: service.seller.id,
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          duration: service.duration,
          servicePrice: service.discountPrice || service.price,
          totalAmount: service.discountPrice || service.price,
          customerName: customerName || user.name,
          customerEmail: customerEmail || user.email,
          customerPhone,
          customerAddress,
          specialRequests,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingComplete(true);
      } else {
        setBookingError(data.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError('An error occurred while booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Your service has been booked successfully. You'll receive a confirmation shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700"><strong>Service:</strong> {service.title}</p>
            <p className="text-sm text-gray-700"><strong>Provider:</strong> {service.seller?.name}</p>
            <p className="text-sm text-gray-700"><strong>Date:</strong> {selectedDate}</p>
            <p className="text-sm text-gray-700"><strong>Time:</strong> {selectedTime}</p>
            <p className="text-sm text-gray-700"><strong>Amount:</strong> ₹{service.discountPrice || service.price}</p>
          </div>
          <button
            onClick={onBookingComplete}
            className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Book Service</h2>
              <p className="text-sm text-gray-600">{service.title}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-primary-100 rounded-full transition-colors">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Error Message */}
            {bookingError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {bookingError}
              </div>
            )}

            {/* Service Summary */}
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              <img
                src={imageUrl}
                alt={service.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.seller?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-primary-600">₹{service.discountPrice || service.price}</span>
                  {service.discountPrice && service.discountPrice < service.price && (
                    <span className="text-sm text-gray-400 line-through">₹{service.price}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Select Date *</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex-shrink-0 p-3 rounded-xl border-2 text-center transition-all ${selectedDate === dateStr
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300"
                        }`}
                    >
                      <p className="text-xs text-gray-500">{dayName}</p>
                      <p className="text-lg font-bold text-gray-900">{dayNum}</p>
                      <p className="text-xs text-gray-500">{monthName}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Select Time *</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${selectedTime === time
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-primary-300"
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Service Address *</label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests or instructions"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Total Amount</span>
              <span className="text-xl font-bold text-primary-600">₹{service.discountPrice || service.price}</span>
            </div>
            <button
              onClick={handleBooking}
              disabled={isBooking || !user}
              className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isBooking ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Booking...
                </>
              ) : !user ? (
                "Please Sign In to Book"
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  Confirm Booking
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              <FiShield className="inline w-3 h-3 mr-1" />
              Secure booking with verified professionals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

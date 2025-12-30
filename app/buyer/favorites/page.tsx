"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiHeart,
  FiMapPin,
  FiStar,
  FiDollarSign,
  FiSearch,
  FiPackage,
  FiCalendar,
  FiClock,
  FiUser,
  FiRefreshCw,
  FiTrash2,
  FiExternalLink,
} from "react-icons/fi";

interface Favorite {
  id: string;
  userId: string;
  serviceId: string;
  createdAt: string;
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    discountPrice?: number;
    images: string;
    rating: number;
    totalReviews: number;
    duration: number;
    city?: string;
    state?: string;
    status: string;
    seller: {
      id: string;
      name: string;
      email: string;
      verified: boolean;
      image?: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

const getServiceImage = (images: string) => {
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images;
    if (parsed && parsed.length > 0) {
      return parsed[0];
    }
  } catch (e) {
    // Fallback
  }
  return null;
};

const renderStars = (rating: number) => {
  return [...Array(5)].map((_, i) => (
    <FiStar
      key={i}
      className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
    />
  ));
};

export default function ServiceFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [user, setUser] = useState<any>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchFavorites(parsedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFavorites = async (userId: string) => {
    try {
      setLoading(true);
      // Fetch only SERVICE type favorites (not PRODUCT)
      const response = await fetch(`/api/favorites?userId=${userId}&type=SERVICE`);
      const data = await response.json();

      if (data.success) {
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (serviceId: string) => {
    if (!user) return;

    try {
      setRemovingId(serviceId);
      const response = await fetch(`/api/favorites?userId=${user.id}&serviceId=${serviceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(prev => prev.filter(f => f.serviceId !== serviceId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    } finally {
      setRemovingId(null);
    }
  };

  // Get unique categories
  const categories = ["all", ...new Set(favorites.map(f => f.service.category?.name).filter(Boolean))];

  // Filter and sort
  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch =
      fav.service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.service.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || fav.service.category?.name === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "rating") return (b.service.rating || 0) - (a.service.rating || 0);
    if (sortBy === "price") return (a.service.discountPrice || a.service.price) - (b.service.discountPrice || b.service.price);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate stats
  const avgRating = favorites.length > 0
    ? (favorites.reduce((sum, f) => sum + (f.service.rating || 0), 0) / favorites.length).toFixed(1)
    : "0.0";

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">You need to sign in to view your favorites</p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Favorite Services</h1>
          <p className="text-gray-600 mt-1">
            {favorites.length} service{favorites.length !== 1 ? 's' : ''} saved for quick booking
          </p>
        </div>
        <button
          onClick={() => user && fetchFavorites(user.id)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Favorites</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "-" : favorites.length}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FiHeart className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "-" : categories.length - 1}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "-" : avgRating}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <FiStar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search favorite services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-40">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredFavorites.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || filterCategory !== "all" ? "No Services Match Your Filters" : "No Favorite Services Yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Start adding services to your favorites by clicking the heart icon on services"}
          </p>
          <Link
            href="/book-services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-semibold"
          >
            <FiPackage className="w-4 h-4" />
            Browse Services
          </Link>
        </div>
      )}

      {/* Services Grid */}
      {!loading && filteredFavorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => {
            const service = favorite.service;
            const serviceImage = getServiceImage(service.images);

            return (
              <div
                key={favorite.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Service Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                  {serviceImage ? (
                    <img
                      src={serviceImage}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FiPackage className="w-16 h-16 text-primary-400" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFavorite(service.id)}
                    disabled={removingId === service.id}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {removingId === service.id ? (
                      <FiRefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                      <FiHeart className="w-5 h-5 text-red-500 fill-current" />
                    )}
                  </button>
                  {service.seller.verified && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                {/* Service Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{service.title}</h3>

                  {/* Provider */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <FiUser className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium">{service.seller.name}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(service.rating || 0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{service.rating || 0}</span>
                    <span className="text-sm text-gray-600">({service.totalReviews || 0})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <div>
                      <div className="flex items-center gap-1 text-primary-600">
                        <span className="text-lg font-bold">
                          ₹{service.discountPrice || service.price}
                        </span>
                        {service.discountPrice && (
                          <span className="text-sm text-gray-400 line-through">₹{service.price}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location & Duration */}
                  <div className="space-y-2 mb-4">
                    {(service.city || service.state) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4" />
                        <span>{[service.city, service.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiClock className="w-4 h-4" />
                      <span>{service.duration} mins</span>
                    </div>
                    {service.category && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiPackage className="w-4 h-4" />
                        <span>{service.category.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/book-services`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-lg hover:from-primary-400 hover:to-primary-600 transition-colors text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                      <FiCalendar className="w-4 h-4" />
                      Book Now
                    </Link>
                    <button
                      onClick={() => removeFavorite(service.id)}
                      disabled={removingId === service.id}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      {!loading && filteredFavorites.length > 0 && (
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-700">
              <FiHeart className="w-5 h-5" />
              <span className="font-medium">
                Showing {filteredFavorites.length} of {favorites.length} favorite services
              </span>
            </div>
            <Link
              href="/book-services"
              className="text-white hover:text-white font-medium text-sm flex items-center gap-1 bg-gradient-to-r from-primary-300 to-primary-500 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Browse More Services
              <FiExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

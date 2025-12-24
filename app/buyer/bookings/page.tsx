"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiStar, 
  FiMessageSquare, 
  FiPhone,
  FiFilter,
  FiSearch,
  FiEye,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiRefreshCw,
  FiMail,
  FiUser,
  FiDollarSign,
  FiEdit3,
  FiHeart,
} from "react-icons/fi";

interface Booking {
  id: string;
  orderNumber: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  servicePrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  specialRequests?: string;
  createdAt: string;
  service: {
    id: string;
    title: string;
    images: string;
    price: number;
    duration: number;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  orderId: string;
  serviceId: string;
}

interface Favorite {
  id: string;
  userId: string;
  serviceId: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: "Pending", color: "text-yellow-800", bgColor: "bg-yellow-100", icon: FiAlertCircle },
  CONFIRMED: { label: "Confirmed", color: "text-blue-800", bgColor: "bg-blue-100", icon: FiCheckCircle },
  IN_PROGRESS: { label: "In Progress", color: "text-purple-800", bgColor: "bg-purple-100", icon: FiLoader },
  COMPLETED: { label: "Completed", color: "text-green-800", bgColor: "bg-green-100", icon: FiCheckCircle },
  CANCELLED: { label: "Cancelled", color: "text-red-800", bgColor: "bg-red-100", icon: FiX },
  REFUNDED: { label: "Refunded", color: "text-gray-800", bgColor: "bg-gray-100", icon: FiRefreshCw },
};

const renderStars = (rating: number, interactive = false, onRate?: (r: number) => void) => {
  return [...Array(5)].map((_, i) => (
    <FiStar
      key={i}
      onClick={() => interactive && onRate && onRate(i + 1)}
      className={`w-6 h-6 ${
        i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
      } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
    />
  ));
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [user, setUser] = useState<any>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch bookings from API
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Fetch user's reviews and favorites
  useEffect(() => {
    if (user) {
      fetchUserReviews();
      fetchUserFavorites();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only SERVICE type bookings (not PRODUCT orders)
      const userId = user?.id || '';
      const response = await fetch(`/api/bookings?buyerId=${userId}&type=SERVICE`);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError('An error occurred while loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        // Create a map of orderId -> review
        const reviewMap: Record<string, Review> = {};
        data.reviews.forEach((review: any) => {
          reviewMap[review.orderId] = review;
        });
        setReviews(reviewMap);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch(`/api/favorites?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        // Create a set of serviceIds that are favorites
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

  // Get service image
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

  // Calculate stats
  const stats = {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    active: bookings.filter(b => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length,
    totalSpent: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Open review modal
  const openReviewModal = (booking: Booking) => {
    setReviewBooking(booking);
    const existingReview = reviews[booking.id];
    if (existingReview) {
      setReviewRating(existingReview.rating);
      setReviewComment(existingReview.comment);
    } else {
      setReviewRating(5);
      setReviewComment("");
    }
    setShowReviewModal(true);
  };

  // Submit review
  const submitReview = async () => {
    if (!reviewBooking || !user) return;
    
    try {
      setSubmittingReview(true);
      
      const existingReview = reviews[reviewBooking.id];
      
      if (existingReview) {
        // Update existing review
        const response = await fetch('/api/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviewId: existingReview.id,
            userId: user.id,
            rating: reviewRating,
            comment: reviewComment,
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setReviews(prev => ({
            ...prev,
            [reviewBooking.id]: { ...existingReview, rating: reviewRating, comment: reviewComment },
          }));
          setShowReviewModal(false);
          alert('Review updated successfully!');
        } else {
          alert(data.message || 'Failed to update review');
        }
      } else {
        // Create new review
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            serviceId: reviewBooking.service.id,
            orderId: reviewBooking.id,
            rating: reviewRating,
            comment: reviewComment,
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setReviews(prev => ({
            ...prev,
            [reviewBooking.id]: {
              id: data.review.id,
              rating: reviewRating,
              comment: reviewComment,
              orderId: reviewBooking.id,
              serviceId: reviewBooking.service.id,
            },
          }));
          setShowReviewModal(false);
          alert('Review submitted successfully! Thank you for your feedback.');
        } else {
          alert(data.message || 'Failed to submit review');
        }
      }
    } catch (err) {
      console.error('Submit review error:', err);
      alert('An error occurred while submitting your review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Manage and track all your service bookings</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={fetchBookings}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/buyer/services"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Book New Service
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '-' : `₹${stats.totalSpent.toLocaleString()}`}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by service, provider, or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 text-red-600 font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              {filteredBookings.length === 0 
                ? 'No Bookings Found' 
                : `All Bookings (${filteredBookings.length})`}
            </h2>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'ALL' 
                  ? "No bookings match your search criteria" 
                  : "Start by booking your first service"}
              </p>
              <Link
                href="/buyer/services"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                const status = statusConfig[booking.status] || statusConfig.PENDING;
                const StatusIcon = status.icon;
                const serviceImage = getServiceImage(booking.service?.images);
                const hasReview = reviews[booking.id];
                const isFavorite = favorites.has(booking.service?.id);
                const isLoadingFavorite = favoriteLoading === booking.service?.id;

                return (
                  <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Service Image or Icon */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          {serviceImage ? (
                            <img
                              src={serviceImage}
                              alt={booking.service?.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ${serviceImage ? 'hidden' : ''}`}>
                            <span className="text-white font-bold text-xl">
                              {booking.service?.title?.charAt(0) || 'S'}
                            </span>
                          </div>
                          
                          {/* Favorite Button Overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(booking.service?.id);
                            }}
                            disabled={isLoadingFavorite}
                            className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${
                              isFavorite 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white text-gray-400 hover:text-red-500'
                            } ${isLoadingFavorite ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {isLoadingFavorite ? (
                              <FiLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            )}
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {booking.service?.title || 'Service'}
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">{booking.seller?.name || 'Provider'}</p>
                              <p className="text-xs text-gray-500 font-mono">#{booking.orderNumber}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiCalendar className="w-4 h-4" />
                              <span>{formatDate(booking.bookingDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiClock className="w-4 h-4" />
                              <span>{booking.bookingTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiMapPin className="w-4 h-4" />
                              <span className="truncate">{booking.customerAddress?.split(',')[0] || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Show Review if exists */}
                          {hasReview && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Your Review:</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <FiStar
                                      key={i}
                                      className={`w-4 h-4 ${i < hasReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {hasReview.comment && (
                                <p className="text-sm text-gray-700 mt-1 line-clamp-2">"{hasReview.comment}"</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-primary-600 mb-1">₹{booking.totalAmount}</p>
                        <p className={`text-xs font-medium ${
                          booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {booking.paymentStatus}
                        </p>
                        <div className="flex flex-col gap-2 mt-3">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <FiEye className="w-4 h-4" />
                            View Details
                          </button>
                          {booking.status === 'COMPLETED' && (
                            <button 
                              onClick={() => openReviewModal(booking)}
                              className={`flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                                hasReview 
                                  ? 'text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50'
                                  : 'text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:bg-yellow-50'
                              }`}
                            >
                              {hasReview ? (
                                <>
                                  <FiEdit3 className="w-4 h-4" />
                                  Edit Review
                                </>
                              ) : (
                                <>
                                  <FiStar className="w-4 h-4" />
                                  Add Review
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          ></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {reviews[reviewBooking.id] ? 'Edit Your Review' : 'Rate & Review'}
                    </h2>
                    <p className="text-yellow-100 text-sm mt-1">
                      {reviewBooking.service?.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Service Info */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    {getServiceImage(reviewBooking.service?.images) ? (
                      <img
                        src={getServiceImage(reviewBooking.service?.images)!}
                        alt={reviewBooking.service?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {reviewBooking.service?.title?.charAt(0) || 'S'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{reviewBooking.service?.title}</h3>
                    <p className="text-sm text-gray-600">by {reviewBooking.seller?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Booked on {formatDate(reviewBooking.bookingDate)}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    How would you rate this service?
                  </label>
                  <div className="flex items-center gap-2 justify-center py-4 bg-gray-50 rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <FiStar
                          className={`w-10 h-10 ${
                            star <= reviewRating 
                              ? "text-yellow-400 fill-current" 
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {reviewRating === 1 && "Poor"}
                    {reviewRating === 2 && "Fair"}
                    {reviewRating === 3 && "Good"}
                    {reviewRating === 4 && "Very Good"}
                    {reviewRating === 5 && "Excellent"}
                  </p>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Write your review (optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this service..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiStar className="w-5 h-5" />
                        {reviews[reviewBooking.id] ? 'Update Review' : 'Submit Review'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedBooking(null)}
          ></div>
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Booking Details</h2>
                    <p className="text-primary-100 text-sm mt-1 font-mono">
                      #{selectedBooking.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Status */}
                <div className="mb-6 flex items-center justify-between">
                  {(() => {
                    const status = statusConfig[selectedBooking.status] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.bgColor} ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-semibold">{status.label}</span>
                      </div>
                    );
                  })()}
                  
                  {/* Favorite Button in Modal */}
                  <button
                    onClick={() => toggleFavorite(selectedBooking.service?.id)}
                    disabled={favoriteLoading === selectedBooking.service?.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      favorites.has(selectedBooking.service?.id)
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    }`}
                  >
                    {favoriteLoading === selectedBooking.service?.id ? (
                      <FiLoader className="w-5 h-5 animate-spin" />
                    ) : (
                      <FiHeart className={`w-5 h-5 ${favorites.has(selectedBooking.service?.id) ? 'fill-current' : ''}`} />
                    )}
                    <span className="font-medium">
                      {favorites.has(selectedBooking.service?.id) ? 'In Favorites' : 'Add to Favorites'}
                    </span>
                  </button>
                </div>

                {/* Service Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      {getServiceImage(selectedBooking.service?.images) ? (
                        <img
                          src={getServiceImage(selectedBooking.service?.images)!}
                          alt={selectedBooking.service?.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-2xl">
                          {selectedBooking.service?.title?.charAt(0) || 'S'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{selectedBooking.service?.title}</h4>
                      <p className="text-sm text-gray-600">by {selectedBooking.seller?.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Duration: {selectedBooking.service?.duration || 60} mins
                      </p>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <FiCalendar className="w-5 h-5" />
                      <span className="font-semibold">Date</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedBooking.bookingDate)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <FiClock className="w-5 h-5" />
                      <span className="font-semibold">Time</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {selectedBooking.bookingTime}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 text-gray-400" />
                    Service Address
                  </h3>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                    {selectedBooking.customerAddress}
                  </p>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUser className="w-4 h-4" />
                      <span>{selectedBooking.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiPhone className="w-4 h-4" />
                      <span>{selectedBooking.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMail className="w-4 h-4" />
                      <span className="truncate">{selectedBooking.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Special Requests / Add-ons</h3>
                    <p className="text-gray-700 bg-yellow-50 rounded-xl p-4">
                      {selectedBooking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Service Price</span>
                      <span>₹{selectedBooking.servicePrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax & Fees</span>
                      <span>₹{selectedBooking.totalAmount - selectedBooking.servicePrice}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-primary-600 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>₹{selectedBooking.totalAmount}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`font-semibold ${
                        selectedBooking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Provider Contact */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Provider</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedBooking.seller?.name}</p>
                      <p className="text-sm text-gray-600">{selectedBooking.seller?.email}</p>
                    </div>
                    <Link
                      href={`/buyer/messages/services?provider=${selectedBooking.seller?.id}&booking=${selectedBooking.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      <FiMessageSquare className="w-4 h-4" />
                      Contact
                    </Link>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                {selectedBooking.status === 'PENDING' && (
                  <button className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-colors">
                    Cancel Booking
                  </button>
                )}
                {selectedBooking.status === 'COMPLETED' && (
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      openReviewModal(selectedBooking);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-colors flex items-center gap-2"
                  >
                    <FiStar className="w-4 h-4" />
                    {reviews[selectedBooking.id] ? 'Edit Review' : 'Add Review'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

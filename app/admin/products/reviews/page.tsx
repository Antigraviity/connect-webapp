"use client";

import { useState, useEffect } from "react";
import {
  FiStar,
  FiSearch,
  FiFilter,
  FiThumbsUp,
  FiThumbsDown,
  FiFlag,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
} from "react-icons/fi";

interface Review {
  id: string;
  rating: number;
  comment: string;
  helpful: number;
  approved: boolean;
  reported: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  service: {
    id: string;
    title: string;
    seller: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  order: {
    id: string;
    orderNumber: string;
  };
}

interface Stats {
  total: number;
  avgRating: string;
  pending: number;
  flagged: number;
  approved: number;
}

const getStatusBadge = (approved: boolean, reported: boolean) => {
  if (reported) {
    return { bg: "bg-red-100", text: "text-red-800", label: "FLAGGED" };
  } else if (approved) {
    return { bg: "bg-green-100", text: "text-green-800", label: "APPROVED" };
  } else {
    return { bg: "bg-yellow-100", text: "text-yellow-800", label: "PENDING" };
  }
};

export default function ProductReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, avgRating: "0.0", pending: 0, flagged: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    fetchReviews();
  }, [filterStatus, filterRating, searchQuery]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterRating !== 'all') params.append('rating', filterRating);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/products/reviews?${params}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reviewId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/products/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action })
      });

      const data = await response.json();
      if (data.success) {
        fetchReviews(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
          <p className="text-gray-600 mt-1">Manage and moderate product reviews.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiStar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiFlag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiFlag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
              <p className="text-xs text-gray-500">Flagged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:border-primary-500 outline-none text-sm transition-all"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:border-primary-500 outline-none cursor-pointer text-sm font-medium transition-all"
          >
            <option value="all">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="FLAGGED">Flagged</option>
          </select>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:border-primary-500 outline-none cursor-pointer text-sm font-medium transition-all"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const statusBadge = getStatusBadge(review.approved, review.reported);
            return (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{review.service.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{review.service.seller.name || review.service.seller.email}</p>

                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                        />
                      ))}
                      <span className="text-sm text-gray-500">by {review.user.name || review.user.email}</span>
                      <span className="text-xs text-gray-400">• {formatDate(review.createdAt)}</span>
                    </div>

                    <p className="text-gray-700">{review.comment}</p>

                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiThumbsUp className="w-4 h-4" />
                        {review.helpful} found helpful
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2">
                    {!review.approved && !review.reported && (
                      <>
                        <button
                          onClick={() => handleAction(review.id, 'approve')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-semibold"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(review.id, 'reject')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-semibold"
                        >
                          <FiXCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                    {review.reported && (
                      <button
                        onClick={() => handleAction(review.id, 'unflag')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 font-semibold"
                      >
                        Unflag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {/* Pagination */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{reviews.length}</span> of <span className="font-medium">{stats.total}</span> reviews
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
              {reviews.length > 10 && (
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">2</button>
              )}
              {reviews.length > 20 && (
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">3</button>
              )}
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled={reviews.length <= 10}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

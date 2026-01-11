"use client";

import { useState, useEffect } from "react";
import {
  FiStar,
  FiThumbsUp,
  FiMessageSquare,
  FiFlag,
  FiSearch,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Review {
  id: string;
  fullId: string;
  reviewId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  providerName: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  status: string;
  createdAt: string;
  createdAtISO: string;
}

interface Stats {
  totalReviews: number;
  averageRating: number;
  publishedReviews: number;
  flaggedReviews: number;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Published":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "Flagged":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "Pending":
      return { bg: "bg-slate-100", text: "text-slate-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
};

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-slate-400 text-slate-400" : "text-gray-300"
            }`}
        />
      ))}
    </div>
  );
};

export default function ServiceReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReviews: 0,
    averageRating: 0,
    publishedReviews: 0,
    flaggedReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/services/reviews");
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      } else {
        setError(data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      setError("Network error: Could not fetch reviews");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.reviewId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || review.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" color="primary" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 text-red-800 mb-4">
            <FiAlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">Error Loading Reviews</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchReviews}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 text-gray-900 border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Service Reviews Management</h1>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
              LIVE DATA
            </span>
          </div>
          <p className="mt-2 text-gray-500">
            Monitor and manage customer reviews and ratings for services
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <FiStar className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReviews.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiThumbsUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Average Rating</p>
            <div className="mt-1">{renderStars(Math.round(stats.averageRating))}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.publishedReviews.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Published</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiFlag className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.flaggedReviews}</p>
            <p className="text-sm text-gray-500">Flagged</p>
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
            <option value="Published">Published</option>
            <option value="Pending">Pending</option>
            <option value="Flagged">Flagged</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiStar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {reviews.length === 0 ? "No Reviews Found" : "No reviews match your search"}
          </h3>
          <p className="text-gray-500">
            {searchQuery || filterStatus !== "all"
              ? "Try adjusting your filters"
              : "Reviews will appear here once customers rate services"}
          </p>
        </div>
      ) : (
        <>
          {/* Reviews List */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                All Reviews ({filteredReviews.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Review Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Service & Provider
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Rating & Comment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReviews.map((review) => {
                    const statusBadge = getStatusBadge(review.status);

                    return (
                      <tr key={review.fullId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{review.reviewId}</p>
                            <p className="text-sm text-gray-600">By: {review.customerName}</p>
                            <p className="text-xs text-gray-500">{review.createdAt}</p>
                            {review.helpfulCount > 0 && (
                              <p className="text-xs text-primary-600 mt-1">
                                {review.helpfulCount} found helpful
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{review.serviceName}</p>
                            <p className="text-sm text-gray-600">Provider: {review.providerName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(review.rating)}
                              <span className="font-bold text-gray-900">({review.rating}/5)</span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {review.comment || "No comment provided"}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {review.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => alert(`View details for ${review.reviewId}`)}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => alert(`Like review ${review.reviewId}`)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as Helpful"
                            >
                              <FiThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => alert(`Flag review ${review.reviewId}`)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Flag Review"
                            >
                              <FiFlag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredReviews.length} of {reviews.length} reviews (live data)
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
                {filteredReviews.length > 10 && (
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">2</button>
                )}
                {filteredReviews.length > 20 && (
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">3</button>
                )}
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled={filteredReviews.length <= 10}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiStar,
  FiThumbsUp,
  FiMessageSquare,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiPackage,
  FiCalendar,
  FiLoader,
  FiAlertCircle,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { useAuth } from "@/lib/useAuth";

// Types
interface ReviewUser {
  id: string;
  name: string;
  image: string | null;
}

interface ServiceSeller {
  id: string;
  name: string;
  image: string | null;
}

interface ReviewService {
  id: string;
  title: string;
  images: string;
  seller: ServiceSeller;
}

interface ReviewOrder {
  id: string;
  orderNumber: string;
  bookingDate: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  images: string | null;
  serviceId: string;
  userId: string;
  orderId: string;
  helpful: number;
  reported: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
  service: ReviewService;
  order: ReviewOrder;
}

interface ApiResponse {
  success: boolean;
  reviews: Review[];
  count: number;
  message?: string;
}

const renderStars = (rating: number, size: string = "w-5 h-5") => {
  return [...Array(5)].map((_, i) => (
    <FiStar
      key={i}
      className={`${size} ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
    />
  ));
};

export default function ServiceReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch reviews when user is available
  useEffect(() => {
    if (user?.id) {
      fetchReviews();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchReviews = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch only PRODUCT type reviews for this page
      const response = await fetch(`/api/reviews?userId=${user.id}&type=PRODUCT`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setReviews(data.reviews);
      } else {
        setError(data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to fetch reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch =
        review.service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.service.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating =
        filterRating === "all" || review.rating.toString() === filterRating;
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "helpful") return b.helpful - a.helpful;
      if (sortBy === "rating") return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Calculate stats
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const parseImages = (imagesJson: string | null): string[] => {
    if (!imagesJson) return [];
    try {
      return JSON.parse(imagesJson);
    } catch {
      return [];
    }
  };

  const getServiceImage = (imagesJson: string): string | null => {
    try {
      const images = JSON.parse(imagesJson);
      return images && images.length > 0 ? images[0] : null;
    } catch {
      return null;
    }
  };

  // Handle edit review
  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingReview || !user?.id) return;

    setEditLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId: editingReview.id,
          userId: user.id,
          rating: editRating,
          comment: editComment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReview.id
              ? { ...r, rating: editRating, comment: editComment }
              : r
          )
        );
        setEditModalOpen(false);
        setEditingReview(null);
      } else {
        alert(data.message || "Failed to update review");
      }
    } catch (err) {
      console.error("Error updating review:", err);
      alert("Failed to update review. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete review
  const openDeleteModal = (review: Review) => {
    setDeletingReview(review);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview || !user?.id) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(
        `/api/reviews?reviewId=${deletingReview.id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setReviews((prev) => prev.filter((r) => r.id !== deletingReview.id));
        setDeleteModalOpen(false);
        setDeletingReview(null);
      } else {
        alert(data.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Please Sign In
          </h3>
          <p className="text-gray-600 mb-4">
            You need to be signed in to view your reviews.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Reviews
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchReviews}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Service Reviews</h1>
          <p className="text-gray-600 mt-1">
            Reviews you've written for products you've purchased
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
          title="Refresh reviews"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Average Rating Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Average Rating</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex items-center justify-center gap-1 mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-600">{reviews.length} reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-900">
                    {dist.star}
                  </span>
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="sm:w-40">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-40">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || filterRating !== "all"
              ? "No Reviews Match Your Filters"
              : "No Reviews Yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterRating !== "all"
              ? "Try adjusting your search or filters"
              : "Purchase and review products to help others make informed decisions"}
          </p>
          <Link
            href="/buyer/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
          >
            <FiPackage className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const serviceImage = getServiceImage(review.service.images);
            const reviewImages = parseImages(review.images);
            const sellerName = review.service.seller?.name || "Service Provider";

            return (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Service Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {serviceImage ? (
                            <img
                              src={serviceImage}
                              alt={review.service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiPackage className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {review.service.title}
                          </h3>
                          <p className="text-sm text-gray-600">{sellerName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rating and Date */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating, "w-4 h-4")}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(review)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit review"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(review)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* Review Images (if any) */}
                {reviewImages.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {reviewImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden"
                      >
                        <img
                          src={img}
                          alt={`Review image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Helpful Counter */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    <FiThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      {filteredReviews.length > 0 && (
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-700">
              <FiCheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Showing {filteredReviews.length} of {reviews.length} reviews
              </span>
            </div>
            <Link
              href="/buyer/purchase-history"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
            >
              View Purchase History
              <FiPackage className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Review</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Service Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium text-gray-900">{editingReview.service.title}</p>
                <p className="text-sm text-gray-500">{editingReview.service.seller?.name}</p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEditRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <FiStar
                        className={`w-8 h-8 ${star <= editRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Write your review..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Review?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your review for "
                {deletingReview.service.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

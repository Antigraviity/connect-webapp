"use client";

import { useState, useEffect } from "react";
import { FiStar, FiMessageSquare, FiThumbsUp, FiAlertCircle, FiX, FiSend } from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Review {
  id: string;
  customer: {
    id?: string;
    name: string;
    avatar: string;
    image?: string | null;
  };
  product: string;
  productId?: string;
  productImage?: string | null;
  rating: number;
  comment: string;
  date: string;
  createdAt: string;
  helpful: number;
  replied: boolean;
  vendorReply?: string | null;
  vendorReplyAt?: string | null;
}

interface RatingStats {
  average: number;
  total: number;
  breakdown: {
    stars: number;
    count: number;
    percentage: number;
  }[];
}

export default function ProductReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    average: 0,
    total: 0,
    breakdown: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  });
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reply modal state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // View reply modal state
  const [viewReplyModalOpen, setViewReplyModalOpen] = useState(false);
  const [viewingReview, setViewingReview] = useState<Review | null>(null);

  // Get seller ID from localStorage
  const getSellerId = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.id;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  // Fetch reviews
  const fetchReviews = async () => {
    const sellerId = getSellerId();
    if (!sellerId) {
      setError('Please login to view your reviews');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        sellerId,
        ...(filterRating && { rating: filterRating.toString() }),
      });

      const response = await fetch(`/api/vendor/reviews/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      } else {
        setError(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to fetch reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterRating]);

  // Handle reply submission
  const handleSubmitReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    const sellerId = getSellerId();
    if (!sellerId) {
      alert('Please login to reply');
      return;
    }

    try {
      setSubmittingReply(true);

      const response = await fetch('/api/vendor/reviews/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reply',
          reviewId: selectedReview.id,
          vendorId: sellerId,
          replyText: replyText.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the review in the list
        setReviews(prev => prev.map(r =>
          r.id === selectedReview.id
            ? {
              ...r,
              replied: true,
              vendorReply: data.data.vendorReply,
              vendorReplyAt: new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            }
            : r
        ));
        setReplyModalOpen(false);
        setSelectedReview(null);
        setReplyText("");
      } else {
        alert(data.message || 'Failed to submit reply');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle helpful click
  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch('/api/vendor/reviews/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'helpful',
          reviewId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the review in the list
        setReviews(prev => prev.map(r =>
          r.id === reviewId
            ? { ...r, helpful: data.data.helpful }
            : r
        ));
      }
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  // Open reply modal
  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.vendorReply || "");
    setReplyModalOpen(true);
  };

  // Open view reply modal
  const openViewReplyModal = (review: Review) => {
    setViewingReview(review);
    setViewReplyModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="vendor" label="Loading reviews..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3 text-red-700">
          <FiAlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading reviews</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchReviews}
            className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
        <p className="text-gray-600 mt-1">See what customers say about your products</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Average Rating */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.average}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(stats.average) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-500">Based on {stats.total} reviews</p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {stats.breakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <button
                  onClick={() => setFilterRating(filterRating === item.stars ? null : item.stars)}
                  className={`flex items-center gap-1 min-w-[60px] ${filterRating === item.stars ? "text-emerald-600" : "text-gray-600"}`}
                >
                  <span>{item.stars}</span>
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 min-w-[40px]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">All Reviews</h3>
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-sm text-emerald-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiStar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm">Reviews from customers will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  {review.customer.image ? (
                    <img
                      src={review.customer.image}
                      alt={review.customer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.customer.avatar}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.customer.name}</h4>
                        <p className="text-sm text-emerald-600">{review.product}</p>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {/* Vendor Reply Display */}
                    {review.replied && review.vendorReply && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-emerald-700">Your Reply</span>
                          {review.vendorReplyAt && (
                            <span className="text-xs text-emerald-500">• {review.vendorReplyAt}</span>
                          )}
                        </div>
                        <p className="text-sm text-emerald-800">{review.vendorReply}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <FiThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful})
                      </button>
                      {review.replied ? (
                        <button
                          onClick={() => openViewReplyModal(review)}
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                        >
                          <FiMessageSquare className="w-4 h-4" />
                          View Reply
                        </button>
                      ) : (
                        <button
                          onClick={() => openReplyModal(review)}
                          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          <FiMessageSquare className="w-4 h-4" />
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Reply to Review</h3>
              <button
                onClick={() => {
                  setReplyModalOpen(false);
                  setSelectedReview(null);
                  setReplyText("");
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              {/* Review Summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{selectedReview.customer.name}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-3 h-3 ${star <= selectedReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{selectedReview.comment}</p>
              </div>

              {/* Reply Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a professional response to this review..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setReplyModalOpen(false);
                  setSelectedReview(null);
                  setReplyText("");
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || submittingReply}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
              >
                {submittingReply ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    Submit Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Reply Modal */}
      {viewReplyModalOpen && viewingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Review & Reply</h3>
              <button
                onClick={() => {
                  setViewReplyModalOpen(false);
                  setViewingReview(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Original Review */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{viewingReview.customer.name}</span>
                  <span className="text-sm text-gray-500">{viewingReview.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-4 h-4 ${star <= viewingReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{viewingReview.comment}</p>
              </div>

              {/* Your Reply */}
              {viewingReview.vendorReply && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-emerald-700">Your Reply</span>
                    {viewingReview.vendorReplyAt && (
                      <span className="text-sm text-emerald-500">{viewingReview.vendorReplyAt}</span>
                    )}
                  </div>
                  <p className="text-emerald-800">{viewingReview.vendorReply}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewReplyModalOpen(false);
                  setViewingReview(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewReplyModalOpen(false);
                  openReplyModal(viewingReview);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Edit Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

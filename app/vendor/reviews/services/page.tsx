"use client";

import { useState, useEffect } from "react";
import { FiStar, FiMessageSquare, FiThumbsUp, FiRefreshCw, FiX, FiSend, FiCheck } from "react-icons/fi";

interface Review {
  id: string;
  customer: {
    name: string;
    avatar: string;
    image?: string | null;
  };
  service: string;
  serviceId?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  replied: boolean;
  vendorReply?: string | null;
  vendorReplyAt?: string | null;
}

interface ReviewStats {
  average: number;
  total: number;
  breakdown: {
    stars: number;
    count: number;
    percentage: number;
  }[];
}

export default function ServiceReviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    average: 0,
    total: 0,
    breakdown: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ]
  });
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Reply modal state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Helpful tracking (to prevent multiple clicks)
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReviews();
    }
  }, [userId]);

  const fetchReviews = async (rating?: number | null) => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        setError('Please login to view reviews');
        return;
      }

      let url = `/api/vendor/reviews?sellerId=${userId}`;
      if (rating) {
        url += `&rating=${rating}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data.reviews);
        // Only update stats if not filtering
        if (!rating) {
          setStats(result.data.stats);
        }
      } else {
        setError(result.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (rating: number | null) => {
    setFilterRating(rating);
    fetchReviews(rating);
  };

  const handleHelpful = async (reviewId: string) => {
    // Prevent multiple clicks on same review
    if (helpfulClicked.has(reviewId)) {
      return;
    }

    try {
      const response = await fetch('/api/vendor/reviews/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'helpful',
          reviewId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setReviews(prev => prev.map(review =>
          review.id === reviewId
            ? { ...review, helpful: result.data.helpful }
            : review
        ));
        // Mark as clicked
        setHelpfulClicked(prev => new Set([...prev, reviewId]));
      }
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.vendorReply || "");
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedReview(null);
    setReplyText("");
  };

  const handleSubmitReply = async () => {
    if (!selectedReview || !replyText.trim() || !userId) return;

    setSubmittingReply(true);

    try {
      const response = await fetch('/api/vendor/reviews/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          reviewId: selectedReview.id,
          vendorId: userId,
          replyText: replyText.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setReviews(prev => prev.map(review =>
          review.id === selectedReview.id
            ? {
              ...review,
              replied: true,
              vendorReply: result.data.vendorReply,
              vendorReplyAt: new Date().toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            }
            : review
        ));
        closeReplyModal();
        alert('Reply posted successfully!');
      } else {
        alert(result.message || 'Failed to post reply');
      }
    } catch (err) {
      console.error('Error posting reply:', err);
      alert('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchReviews()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Reviews</h1>
          <p className="text-gray-600 mt-1">See what customers say about your services</p>
        </div>
        <button
          onClick={() => fetchReviews(filterRating)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Average Rating */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {stats.average > 0 ? stats.average.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(stats.average) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-500">
              {stats.total > 0 ? `Based on ${stats.total} review${stats.total !== 1 ? 's' : ''}` : 'No reviews yet'}
            </p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {stats.breakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <button
                  onClick={() => handleFilterChange(filterRating === item.stars ? null : item.stars)}
                  className={`flex items-center gap-1 min-w-[60px] transition-colors ${filterRating === item.stars ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <span>{item.stars}</span>
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 min-w-[40px] text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">
            {filterRating ? `${filterRating}-Star Reviews` : 'All Reviews'}
            {loading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
          </h3>
          {filterRating && (
            <button
              onClick={() => handleFilterChange(null)}
              className="text-sm text-emerald-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                    {review.customer.image ? (
                      <img
                        src={review.customer.image}
                        alt={review.customer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      review.customer.avatar
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.customer.name}</h4>
                        <p className="text-sm text-emerald-600">{review.service}</p>
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

                    {review.comment && (
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    )}

                    {/* Vendor Reply */}
                    {review.vendorReply && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-emerald-700">Your Reply</span>
                          <span className="text-xs text-emerald-500">{review.vendorReplyAt}</span>
                        </div>
                        <p className="text-sm text-emerald-800">{review.vendorReply}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        disabled={helpfulClicked.has(review.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${helpfulClicked.has(review.id)
                            ? "text-green-600 cursor-default"
                            : "text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        {helpfulClicked.has(review.id) ? (
                          <FiCheck className="w-4 h-4" />
                        ) : (
                          <FiThumbsUp className="w-4 h-4" />
                        )}
                        Helpful {review.helpful > 0 && `(${review.helpful})`}
                      </button>
                      <button
                        onClick={() => openReplyModal(review)}
                        className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        <FiMessageSquare className="w-4 h-4" />
                        {review.replied ? "Edit Reply" : "Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <FiStar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">
              {filterRating ? `No ${filterRating}-star reviews yet` : 'No reviews yet'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filterRating
                ? 'Try selecting a different rating filter'
                : 'Reviews from your customers will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedReview.replied ? "Edit Your Reply" : "Reply to Review"}
              </h3>
              <button
                onClick={closeReplyModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Original Review */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{selectedReview.customer.name}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-3 h-3 ${star <= selectedReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{selectedReview.comment || 'No comment'}</p>
              </div>

              {/* Reply Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Thank you for your feedback..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your reply will be visible to the customer and other users.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeReplyModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || submittingReply}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReply ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    {selectedReview.replied ? "Update Reply" : "Post Reply"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

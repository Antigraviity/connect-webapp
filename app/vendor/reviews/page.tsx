"use client";

import { useState } from "react";
import { FiStar, FiThumbsUp, FiMessageCircle, FiTrendingUp, FiFilter } from "react-icons/fi";

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    customer: {
      name: "Rahul Sharma",
      avatar: "RS",
      verified: true,
    },
    service: "AC Repair & Service",
    rating: 5,
    comment: "Excellent service! The technician was professional and fixed my AC quickly. Highly recommended!",
    helpful: 12,
    date: "2025-11-01",
    response: null,
    images: [],
  },
  {
    id: "2",
    customer: {
      name: "Priya Patel",
      avatar: "PP",
      verified: true,
    },
    service: "Plumbing Service",
    rating: 4,
    comment: "Good service but arrived 15 minutes late. Work quality was excellent though.",
    helpful: 8,
    date: "2025-10-30",
    response: "Thank you for your feedback! We apologize for the delay and will ensure better time management.",
    images: [],
  },
  {
    id: "3",
    customer: {
      name: "Amit Kumar",
      avatar: "AK",
      verified: false,
    },
    service: "Electrical Work",
    rating: 5,
    comment: "Very satisfied with the electrical repairs. Professional and knowledgeable.",
    helpful: 15,
    date: "2025-10-28",
    response: "We appreciate your kind words! Thank you for choosing our service.",
    images: [],
  },
  {
    id: "4",
    customer: {
      name: "Sneha Reddy",
      avatar: "SR",
      verified: true,
    },
    service: "House Painting",
    rating: 3,
    comment: "Average service. Paint quality could be better. But the workers were polite.",
    helpful: 5,
    date: "2025-10-25",
    response: null,
    images: [],
  },
  {
    id: "5",
    customer: {
      name: "Vikram Singh",
      avatar: "VS",
      verified: true,
    },
    service: "Carpentry Service",
    rating: 5,
    comment: "Outstanding craftsmanship! The custom wardrobe looks amazing. Worth every penny!",
    helpful: 20,
    date: "2025-10-22",
    response: "Thank you so much! We're thrilled you're happy with the wardrobe!",
    images: [],
  },
  {
    id: "6",
    customer: {
      name: "Anjali Gupta",
      avatar: "AG",
      verified: true,
    },
    service: "AC Repair & Service",
    rating: 4,
    comment: "Fast and efficient service. My AC is working perfectly now. Would recommend!",
    helpful: 10,
    date: "2025-10-20",
    response: null,
    images: [],
  },
];

const ratingDistribution = [
  { stars: 5, count: 45, percentage: 56 },
  { stars: 4, count: 25, percentage: 31 },
  { stars: 3, count: 8, percentage: 10 },
  { stars: 2, count: 2, percentage: 2 },
  { stars: 1, count: 1, percentage: 1 },
];

export default function VendorReviews() {
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const filteredReviews = mockReviews
    .filter((review) => filterRating === "all" || review.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "helpful") {
        return b.helpful - a.helpful;
      } else {
        return b.rating - a.rating;
      }
    });

  const averageRating = 4.7;
  const totalReviews = 89;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-600 mt-1">
            Manage customer feedback and respond to reviews
          </p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          Export Reviews
        </button>
      </div>

      {/* Overall Rating Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Rating */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
              <span className="text-3xl font-bold text-white">{averageRating}</span>
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-600">
              Based on <span className="font-semibold">{totalReviews}</span> reviews
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">
                    {dist.stars}
                  </span>
                  <FiStar className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageRating}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiStar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
            <FiTrendingUp className="w-4 h-4" />
            <span>+0.3 from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalReviews}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiMessageCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
            <FiTrendingUp className="w-4 h-4" />
            <span>+12 this month</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">85%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiThumbsUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
            <FiTrendingUp className="w-4 h-4" />
            <span>Excellent!</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline w-4 h-4 mr-1" />
              Filter by Rating
            </label>
            <select
              value={filterRating}
              onChange={(e) =>
                setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {review.customer.avatar}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {review.customer.name}
                    </h3>
                    {review.customer.verified && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{review.service}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(review.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                <span className="text-sm font-semibold text-gray-900 ml-1">
                  {review.rating}.0
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Review Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                <FiThumbsUp className="w-4 h-4" />
                <span>Helpful ({review.helpful})</span>
              </button>
              {!review.response && (
                <button
                  onClick={() => setShowResponseForm(review.id)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Respond
                </button>
              )}
            </div>

            {/* Response Form */}
            {showResponseForm === review.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                  placeholder="Write your response to this review..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-2 mt-3">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    Submit Response
                  </button>
                  <button
                    onClick={() => {
                      setShowResponseForm(null);
                      setResponseText("");
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Vendor Response */}
            {review.response && (
              <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">V</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Your Response
                    </p>
                    <p className="text-sm text-gray-700">{review.response}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiStar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-600">
            No reviews match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}

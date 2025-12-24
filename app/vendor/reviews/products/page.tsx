"use client";

import { useState } from "react";
import { FiStar, FiMessageSquare, FiThumbsUp } from "react-icons/fi";

const reviewsData = [
  {
    id: "1",
    customer: { name: "John Doe", avatar: "JD" },
    product: "Fresh Vegetables Basket",
    rating: 5,
    comment: "Very fresh vegetables! Will order again. Fast delivery and well packaged.",
    date: "Nov 24, 2024",
    helpful: 18,
    replied: true,
  },
  {
    id: "2",
    customer: { name: "Priya Singh", avatar: "PS" },
    product: "Organic Fruit Pack",
    rating: 5,
    comment: "Absolutely loved the fruits. They were so fresh and sweet. Best quality!",
    date: "Nov 23, 2024",
    helpful: 14,
    replied: false,
  },
  {
    id: "3",
    customer: { name: "Amit Verma", avatar: "AV" },
    product: "Homemade Murukku",
    rating: 4,
    comment: "Tasty and crispy! Just like homemade. Would love more quantity in the pack.",
    date: "Nov 22, 2024",
    helpful: 10,
    replied: true,
  },
  {
    id: "4",
    customer: { name: "Neha Gupta", avatar: "NG" },
    product: "Farm Fresh Eggs",
    rating: 5,
    comment: "Fresh eggs with beautiful orange yolks. You can taste the difference!",
    date: "Nov 20, 2024",
    helpful: 22,
    replied: false,
  },
  {
    id: "5",
    customer: { name: "Rajesh Kumar", avatar: "RK" },
    product: "Fresh Paneer",
    rating: 4,
    comment: "Good quality paneer. Soft and fresh. Packaging could be improved.",
    date: "Nov 19, 2024",
    helpful: 8,
    replied: true,
  },
];

const ratingStats = {
  average: 4.8,
  total: 156,
  breakdown: [
    { stars: 5, count: 112, percentage: 72 },
    { stars: 4, count: 32, percentage: 20 },
    { stars: 3, count: 8, percentage: 5 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 1, percentage: 1 },
  ],
};

export default function ProductReviews() {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredReviews = filterRating
    ? reviewsData.filter((r) => r.rating === filterRating)
    : reviewsData;

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
            <div className="text-5xl font-bold text-gray-900 mb-2">{ratingStats.average}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(ratingStats.average) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-500">Based on {ratingStats.total} reviews</p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
          <div className="space-y-3">
            {ratingStats.breakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <button
                  onClick={() => setFilterRating(filterRating === item.stars ? null : item.stars)}
                  className={`flex items-center gap-1 min-w-[60px] ${filterRating === item.stars ? "text-blue-600" : "text-gray-600"}`}
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
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {review.customer.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.customer.name}</h4>
                      <p className="text-sm text-blue-600">{review.product}</p>
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

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                      <FiThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </button>
                    <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                      <FiMessageSquare className="w-4 h-4" />
                      {review.replied ? "View Reply" : "Reply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

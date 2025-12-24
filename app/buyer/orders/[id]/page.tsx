"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import {
  FiArrowLeft,
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCreditCard,
  FiFileText,
  FiDownload,
  FiMessageSquare,
  FiLoader,
  FiAlertCircle,
  FiShoppingBag,
  FiUser,
  FiHome,
  FiDollarSign,
} from "react-icons/fi";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  servicePrice: number;
  taxAmount: number;
  discount: number;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  service: {
    id: string;
    title: string;
    slug: string;
    images: string;
    description: string;
    price: number;
    type: string;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
    image?: string;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    image?: string;
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  };
}

// Status configuration
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any; description: string }> = {
  PENDING: { 
    label: "Processing", 
    color: "text-yellow-700", 
    bgColor: "bg-yellow-100 border-yellow-200", 
    icon: FiClock,
    description: "Your order is being processed by the seller"
  },
  CONFIRMED: { 
    label: "Confirmed", 
    color: "text-blue-700", 
    bgColor: "bg-blue-100 border-blue-200", 
    icon: FiCheckCircle,
    description: "Your order has been confirmed and is being prepared"
  },
  IN_PROGRESS: { 
    label: "In Transit", 
    color: "text-purple-700", 
    bgColor: "bg-purple-100 border-purple-200", 
    icon: FiTruck,
    description: "Your order is on its way to you"
  },
  COMPLETED: { 
    label: "Delivered", 
    color: "text-green-700", 
    bgColor: "bg-green-100 border-green-200", 
    icon: FiCheckCircle,
    description: "Your order has been delivered successfully"
  },
  CANCELLED: { 
    label: "Cancelled", 
    color: "text-red-700", 
    bgColor: "bg-red-100 border-red-200", 
    icon: FiXCircle,
    description: "This order has been cancelled"
  },
  REFUNDED: { 
    label: "Refunded", 
    color: "text-gray-700", 
    bgColor: "bg-gray-100 border-gray-200", 
    icon: FiRefreshCw,
    description: "Payment has been refunded for this order"
  },
};

// Order timeline steps
const getOrderTimeline = (order: Order) => {
  const steps = [
    { key: 'placed', label: 'Order Placed', status: 'completed', date: order.createdAt },
    { key: 'confirmed', label: 'Confirmed', status: order.status === 'PENDING' ? 'pending' : 'completed', date: order.status !== 'PENDING' ? order.updatedAt : null },
    { key: 'in_progress', label: 'In Transit', status: ['IN_PROGRESS', 'COMPLETED'].includes(order.status) ? 'completed' : 'pending', date: order.status === 'IN_PROGRESS' ? order.updatedAt : null },
    { key: 'delivered', label: 'Delivered', status: order.status === 'COMPLETED' ? 'completed' : 'pending', date: order.completedAt },
  ];
  
  if (order.status === 'CANCELLED') {
    return [
      { key: 'placed', label: 'Order Placed', status: 'completed', date: order.createdAt },
      { key: 'cancelled', label: 'Cancelled', status: 'cancelled', date: order.updatedAt },
    ];
  }
  
  return steps;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(searchParams.get('review') === 'true');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const orderId = params.id as string;

  // Fetch order details
  useEffect(() => {
    if (orderId && user?.id) {
      fetchOrder();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [orderId, user, authLoading]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        // Verify the order belongs to the current user
        if (data.order.buyerId !== user?.id) {
          setError("You don't have permission to view this order");
          return;
        }
        setOrder(data.order);
      } else {
        setError(data.message || "Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to fetch order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Parse images from JSON string
  const getProductImage = (imagesStr: string): string | null => {
    try {
      const images = typeof imagesStr === 'string' ? JSON.parse(imagesStr) : imagesStr;
      if (Array.isArray(images) && images.length > 0) {
        return images[0];
      }
    } catch (e) {}
    return null;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate expected delivery (3 days from order date)
  const getExpectedDelivery = (orderDate: string) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 3);
    return date;
  };

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!order || !user) return;
    
    setSubmittingReview(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: order.service.id,
          orderId: order.id,
          rating: reviewRating,
          comment: reviewComment,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowReviewForm(false);
        fetchOrder(); // Refresh order to show review
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setCancellingOrder(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchOrder(); // Refresh order
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrder(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">You need to be signed in to view order details.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Order</h3>
          <p className="text-gray-600 mb-4">{error || "Order not found"}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={fetchOrder}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  const productImage = getProductImage(order.service?.images || '[]');
  const expectedDelivery = getExpectedDelivery(order.createdAt);
  const timeline = getOrderTimeline(order);

  return (
    <div className="p-6 space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrder}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`px-6 py-4 ${status.bgColor} border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-6 h-6 ${status.color}`} />
                  <div>
                    <h2 className={`font-semibold ${status.color}`}>{status.label}</h2>
                    <p className="text-sm text-gray-600">{status.description}</p>
                  </div>
                </div>
                {order.status === 'COMPLETED' && !order.review && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <FiStar className="w-4 h-4" />
                    Write Review
                  </button>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="p-6">
              <div className="relative">
                {timeline.map((step, index) => (
                  <div key={step.key} className="flex items-start gap-4 pb-6 last:pb-0">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'cancelled' ? 'bg-red-500' :
                        'bg-gray-200'
                      }`}>
                        {step.status === 'completed' ? (
                          <FiCheckCircle className="w-4 h-4 text-white" />
                        ) : step.status === 'cancelled' ? (
                          <FiXCircle className="w-4 h-4 text-white" />
                        ) : (
                          <FiClock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`absolute top-8 left-1/2 w-0.5 h-full -translate-x-1/2 ${
                          step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`font-medium ${
                        step.status === 'completed' ? 'text-gray-900' :
                        step.status === 'cancelled' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-gray-500">{formatDateTime(step.date)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage className="w-5 h-5" />
              Product Details
            </h3>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={order.service?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <FiPackage className="w-10 h-10 text-primary-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {order.service?.category?.name || 'Product'}
                </p>
                <h4 className="font-semibold text-gray-900 mt-1 text-lg">
                  {order.service?.title || 'Product'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Sold by: {order.seller?.name}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-lg font-bold text-primary-600">
                    ₹{order.servicePrice?.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">Qty: 1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Section */}
          {order.review && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiStar className="w-5 h-5" />
                Your Review
              </h3>
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-5 h-5 ${
                        star <= order.review!.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{order.review.comment}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Reviewed on {formatDate(order.review.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && !order.review && order.status === 'COMPLETED' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiStar className="w-5 h-5" />
                Write a Review
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <FiStar
                          className={`w-8 h-8 ${
                            star <= reviewRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Share your experience with this product..."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReviewSubmit}
                    disabled={submittingReview || !reviewComment.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingReview ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiStar className="w-4 h-4" />
                    )}
                    Submit Review
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiFileText className="w-5 h-5" />
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{order.servicePrice?.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-₹{order.discount?.toLocaleString()}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">₹{order.taxAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-primary-600">
                    ₹{order.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="w-5 h-5" />
              Payment Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Method</span>
                <span className="text-gray-900">{order.paymentMethod?.replace(/_/g, ' ') || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="w-5 h-5" />
              Delivery Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiUser className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiPhone className="w-4 h-4 text-gray-400 mt-1" />
                <p className="text-sm text-gray-600">{order.customerPhone}</p>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="w-4 h-4 text-gray-400 mt-1" />
                <p className="text-sm text-gray-600">{order.customerEmail}</p>
              </div>
              {order.customerAddress && (
                <div className="flex items-start gap-3">
                  <FiHome className="w-4 h-4 text-gray-400 mt-1" />
                  <p className="text-sm text-gray-600">{order.customerAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiShoppingBag className="w-5 h-5" />
              Seller Information
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                {order.seller?.image ? (
                  <img
                    src={order.seller.image}
                    alt={order.seller.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary-600 font-semibold">
                    {order.seller?.name?.charAt(0) || 'S'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.seller?.name}</p>
                <p className="text-sm text-gray-500">{order.seller?.email}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href={`/buyer/messages/products?sellerId=${order.seller?.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <FiMessageSquare className="w-4 h-4" />
                Contact Seller
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
            {['PENDING', 'CONFIRMED'].includes(order.status) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {cancellingOrder ? (
                  <FiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FiXCircle className="w-4 h-4" />
                )}
                Cancel Order
              </button>
            )}
            <button className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <FiDownload className="w-4 h-4" />
              Download Invoice
            </button>
            <Link
              href="/buyer/purchase-history"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

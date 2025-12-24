"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiX,
  FiStar,
  FiMapPin,
  FiClock,
  FiShield,
  FiCalendar,
  FiUser,
  FiLogIn,
  FiHeart,
} from "react-icons/fi";

interface ServiceDetailsModalProps {
  service: any;
  onClose: () => void;
}

export default function ServiceDetailsModal({
  service,
  onClose,
}: ServiceDetailsModalProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
          
          // Check if this service is in user's favorites
          const response = await fetch(`/api/favorites?userId=${parsedUser.id}`);
          const data = await response.json();
          if (data.success) {
            const isFav = data.favorites.some((f: any) => f.serviceId === service.id);
            setIsFavorite(isFav);
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    
    checkAuth();
  }, [service.id]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!isLoggedIn || !user) {
      alert('Please sign in to add favorites');
      return;
    }

    try {
      setTogglingFavorite(true);
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?userId=${user.id}&serviceId=${service.id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, serviceId: service.id }),
        });
        const data = await response.json();
        if (data.success) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setTogglingFavorite(false);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const addons = [
    { id: "addon1", name: "Premium Products", price: 199 },
    { id: "addon2", name: "Extended Service", price: 299 },
    { id: "addon3", name: "Same Day Service", price: 149 },
  ];

  const reviews = [
    {
      id: 1,
      user: "Priya R.",
      rating: 5,
      comment: "Excellent service! Very professional and punctual.",
      date: "2 days ago",
    },
    {
      id: 2,
      user: "Arun K.",
      rating: 4,
      comment: "Good service, would recommend to others.",
      date: "1 week ago",
    },
    {
      id: 3,
      user: "Lakshmi S.",
      rating: 5,
      comment: "Amazing experience! Will definitely book again.",
      date: "2 weeks ago",
    },
  ];

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    const servicePrice = service.discountPrice || service.price;
    const addonsTotal = addons
      .filter((addon) => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);
    return servicePrice + addonsTotal;
  };

  // Get service image
  const getServiceImage = () => {
    try {
      if (service.images) {
        const images = typeof service.images === 'string' 
          ? JSON.parse(service.images) 
          : service.images;
        if (images && images.length > 0) {
          return images[0];
        }
      }
    } catch (e) {
      // Fallback to default
    }
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Save the current service and booking details to localStorage so we can restore after login
    const pendingBooking = {
      serviceId: service.id,
      returnUrl: '/book-services',
      selectedDate,
      selectedTime,
      address,
      selectedAddons,
    };
    localStorage.setItem('pendingBooking', JSON.stringify(pendingBooking));
    
    // Close modal and redirect to login
    onClose();
    router.push('/signin?redirect=/book-services&action=booking');
  };

  const handleProceedToCheckout = () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      handleLoginRedirect();
      return;
    }

    if (!selectedDate || !selectedTime || !address) {
      alert("Please fill all booking details (date, time, and address)");
      return;
    }

    setIsProcessing(true);

    // Prepare booking data
    const bookingData = {
      service: {
        id: service.id,
        title: service.title,
        price: service.price,
        discountPrice: service.discountPrice,
        images: service.images,
        duration: service.duration || 60,
        seller: {
          id: service.seller?.id || service.sellerId,
          name: service.seller?.name || 'Service Provider',
          email: service.seller?.email || '',
          verified: service.seller?.verified || false,
        },
      },
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      address: address,
      addons: addons.filter((addon) => selectedAddons.includes(addon.id)),
      userId: user?.id,
    };

    // Save to localStorage
    localStorage.setItem("serviceBooking", JSON.stringify(bookingData));

    // Close modal and redirect to checkout
    onClose();
    router.push("/checkout/service");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-slide-up">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <FiX className="w-6 h-6 text-gray-700" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            disabled={togglingFavorite}
            className={`absolute top-4 right-16 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isFavorite
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-500'
            } ${togglingFavorite ? 'opacity-50' : ''}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Hero Image */}
          <div className="relative h-72 overflow-hidden">
            <img
              src={getServiceImage()}
              alt={service.title || service.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl font-bold text-white mb-2 font-heading">
                {service.title || service.name}
              </h2>
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-1">
                  <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{service.rating || 0}</span>
                  <span className="text-white/80">({service.totalReviews || service.reviews || 0} reviews)</span>
                </div>
                {(service.seller?.verified || service.verified) && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Provider Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {service.seller?.name || service.provider || 'Service Provider'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4" />
                        {service.city ? `${service.city}, ${service.state}` : service.location || service.address || 'Location not specified'}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      About this Service
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {service.description || 'Professional service with high-quality delivery. Our team ensures attention to detail and customer satisfaction.'}
                    </p>
                  </div>

                  {/* Inclusions */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      What's Included
                    </h3>
                    <ul className="space-y-2">
                      {[
                        "Professional service by trained experts",
                        "All necessary equipment and materials",
                        "Quality guarantee",
                        "Post-service support",
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Add-ons */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Optional Add-ons
                    </h3>
                    <div className="space-y-3">
                      {addons.map((addon) => (
                        <label
                          key={addon.id}
                          className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary-500 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedAddons.includes(addon.id)}
                              onChange={() => toggleAddon(addon.id)}
                              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="font-medium text-gray-900">
                              {addon.name}
                            </span>
                          </div>
                          <span className="font-bold text-primary-600">
                            +₹{addon.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Reviews */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Customer Reviews
                    </h3>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-gray-50 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {review.user}
                              </span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.date}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety & Policy */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FiShield className="w-5 h-5 text-primary-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Safety & Refund Policy
                        </h4>
                        <p className="text-sm text-gray-700">
                          100% secure payment. Full refund if service not
                          delivered as promised. All professionals are
                          background verified.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Booking Widget */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6 bg-gray-50 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Book this Service
                    </h3>

                    {/* Login Notice (if not logged in) */}
                    {!isLoggedIn && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <FiLogIn className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Login required to book
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Please sign in to proceed with your booking
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiCalendar className="inline w-4 h-4 mr-1" />
                        Select Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiClock className="inline w-4 h-4 mr-1" />
                        Select Time *
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Choose a time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiMapPin className="inline w-4 h-4 mr-1" />
                        Service Address *
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your complete address"
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      ></textarea>
                    </div>

                    {/* Price Summary */}
                    <div className="pt-4 border-t border-gray-300 space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Service Price</span>
                        <div className="text-right">
                          <span className="font-semibold">₹{service.discountPrice || service.price}</span>
                          {service.discountPrice && (
                            <span className="text-sm text-gray-400 line-through ml-2">₹{service.price}</span>
                          )}
                        </div>
                      </div>
                      {selectedAddons.length > 0 && (
                        <>
                          {addons
                            .filter((addon) => selectedAddons.includes(addon.id))
                            .map((addon) => (
                              <div
                                key={addon.id}
                                className="flex justify-between text-gray-700 text-sm"
                              >
                                <span>{addon.name}</span>
                                <span>₹{addon.price}</span>
                              </div>
                            ))}
                        </>
                      )}
                      <div className="flex justify-between text-xl font-bold text-primary-600 pt-2 border-t border-gray-300">
                        <span>Total</span>
                        <span>₹{calculateTotal()}</span>
                      </div>
                    </div>

                    {/* Proceed to Checkout / Login Button */}
                    <button
                      onClick={handleProceedToCheckout}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : !isLoggedIn ? (
                        <>
                          <FiLogIn className="w-5 h-5" />
                          Sign In to Book
                        </>
                      ) : (
                        'Proceed to Checkout'
                      )}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                      By booking, you agree to our Terms & Conditions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

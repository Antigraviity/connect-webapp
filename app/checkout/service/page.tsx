"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiCheck,
  FiShield,
  FiClock,
  FiCalendar,
  FiUser,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";

interface BookingData {
  service: {
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    images: string;
    duration: number;
    seller: {
      id: string;
      name: string;
      email: string;
      verified: boolean;
    };
  };
  bookingDate: string;
  bookingTime: string;
  address: string;
  addons: Array<{ id: string; name: string; price: number }>;
}

function ServiceCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Customer details form
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check authentication and load booking data
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      // Not logged in, redirect to signin
      const savedBooking = localStorage.getItem("serviceBooking");
      if (savedBooking) {
        // Keep the booking data, redirect to login
        router.push('/signin?redirect=/checkout/service');
      } else {
        router.push('/signin?redirect=/book-services');
      }
      return;
    }

    // User is logged in
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsLoggedIn(true);

      // Pre-fill customer details from user data
      setCustomerDetails(prev => ({
        ...prev,
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
      }));
    } catch (e) {
      router.push('/signin?redirect=/checkout/service');
      return;
    }

    // Load booking data
    const savedBooking = localStorage.getItem("serviceBooking");
    if (savedBooking) {
      const parsed = JSON.parse(savedBooking);
      setBookingData(parsed);
      // Pre-fill address if available
      if (parsed.address) {
        setCustomerDetails(prev => ({ ...prev, address: parsed.address }));
      }
    } else {
      // No booking data, redirect back
      router.push("/book-services");
    }
  }, [router]);

  const paymentMethods = [
    { id: "cod", name: "Cash on Service", icon: FiDollarSign, description: "Pay after service completion" },
    { id: "upi", name: "UPI", icon: FiSmartphone, description: "Pay using UPI apps" },
    { id: "card", name: "Credit/Debit Card", icon: FiCreditCard, description: "Visa, Mastercard, RuPay" },
  ];

  // Calculate totals
  const servicePrice = bookingData?.service?.discountPrice || bookingData?.service?.price || 0;
  const addonsTotal = bookingData?.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
  const subtotal = servicePrice + addonsTotal;
  const taxAmount = Math.round(subtotal * 0.05); // 5% tax
  const totalAmount = subtotal + taxAmount;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerDetails.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!customerDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerDetails.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!customerDetails.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      // Remove all non-digit characters for validation
      const digitsOnly = customerDetails.phone.replace(/\D/g, '');
      // Accept 10 digits (Indian mobile) or 12 digits (with 91 country code)
      const isValid = /^\d{10}$/.test(digitsOnly) || /^91\d{10}$/.test(digitsOnly);
      if (!isValid) {
        newErrors.phone = "Invalid phone number (10 digits required)";
      }
    }
    if (!customerDetails.address.trim()) {
      newErrors.address = "Service address is required";
    } else if (customerDetails.address.length < 10) {
      newErrors.address = "Please enter complete address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    if (!bookingData) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: bookingData.service.id,
          sellerId: bookingData.service.seller.id,
          buyerId: user?.id, // Include logged-in user's ID
          bookingDate: bookingData.bookingDate,
          bookingTime: bookingData.bookingTime,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          customerAddress: customerDetails.address,
          specialRequests: customerDetails.specialRequests,
          servicePrice: servicePrice,
          addons: bookingData.addons,
          totalAmount: totalAmount,
          paymentMethod: selectedPayment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderNumber(data.orderNumber);
        setOrderPlaced(true);
        // Clear booking data from localStorage
        localStorage.removeItem("serviceBooking");
      } else {
        alert(data.message || 'Failed to place booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your service has been booked successfully.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Booking ID</p>
            <p className="text-xl font-bold text-primary-600">{orderNumber}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-primary-600" />
              <div>
                <span className="font-semibold text-gray-900">Date & Time</span>
                <p className="text-sm text-gray-700">
                  {new Date(bookingData.bookingDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {bookingData.bookingTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMapPin className="w-5 h-5 text-primary-600" />
              <div>
                <span className="font-semibold text-gray-900">Service Address</span>
                <p className="text-sm text-gray-700">{customerDetails.address}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The service provider will contact you to confirm the booking.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/buyer/bookings"
              className="block w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              href="/book-services"
              className="block w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Book More Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Parse service images
  let serviceImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
  try {
    const images = typeof bookingData.service.images === 'string'
      ? JSON.parse(bookingData.service.images)
      : bookingData.service.images;
    if (images && images.length > 0) {
      serviceImage = images[0];
    }
  } catch (e) {
    // Use default image
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Service Checkout</h1>
            </div>

            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-4">
              {["Details", "Payment", "Confirm"].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep > index + 1
                        ? "bg-green-500 text-white"
                        : currentStep === index + 1
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {currentStep > index + 1 ? <FiCheck className="w-4 h-4" /> : index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${currentStep >= index + 1 ? "text-gray-900" : "text-gray-500"
                      }`}
                  >
                    {step}
                  </span>
                  {index < 2 && (
                    <div className="w-12 h-0.5 bg-gray-200 mx-4">
                      <div
                        className={`h-full bg-primary-600 transition-all ${currentStep > index + 1 ? "w-full" : "w-0"
                          }`}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <FiShield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Details */}
            <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${currentStep !== 1 ? "opacity-60" : ""}`}>
              <div
                className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                onClick={() => currentStep > 1 && setCurrentStep(1)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                    {currentStep > 1 ? <FiCheck className="w-4 h-4" /> : "1"}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Your Details</h2>
                </div>
                {currentStep > 1 && (
                  <button className="text-primary-600 text-sm font-semibold hover:underline">
                    Edit
                  </button>
                )}
              </div>

              {currentStep === 1 && (
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiUser className="inline w-4 h-4 mr-1" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={customerDetails.name}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiMail className="inline w-4 h-4 mr-1" />
                          Email *
                        </label>
                        <input
                          type="email"
                          value={customerDetails.email}
                          onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                          placeholder="your@email.com"
                          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiPhone className="inline w-4 h-4 mr-1" />
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={customerDetails.phone}
                          onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          placeholder="9876543210"
                          maxLength={10}
                          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiMapPin className="inline w-4 h-4 mr-1" />
                        Service Address *
                      </label>
                      <textarea
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                        placeholder="Enter complete address where service is needed"
                        rows={3}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* Special Requests */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={customerDetails.specialRequests}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, specialRequests: e.target.value })}
                        placeholder="Any specific instructions for the service provider?"
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (validateForm()) {
                        setCurrentStep(2);
                      }
                    }}
                    className="w-full mt-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Collapsed Details Display */}
              {currentStep > 1 && (
                <div className="p-4">
                  <div className="space-y-2 text-sm">
                    <p><strong>{customerDetails.name}</strong></p>
                    <p className="text-gray-600">{customerDetails.email} • {customerDetails.phone}</p>
                    <p className="text-gray-600">{customerDetails.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${currentStep !== 2 ? "opacity-60" : ""}`}>
              <div
                className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                onClick={() => currentStep > 2 && setCurrentStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                    {currentStep > 2 ? <FiCheck className="w-4 h-4" /> : "2"}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                </div>
              </div>

              {currentStep === 2 && (
                <div className="p-6">
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === method.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <method.icon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Review Booking
                    </button>
                  </div>
                </div>
              )}

              {currentStep > 2 && (
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const method = paymentMethods.find(m => m.id === selectedPayment);
                      if (!method) return null;
                      return (
                        <>
                          <method.icon className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold text-gray-900">{method.name}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Confirm Booking */}
            <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${currentStep !== 3 ? "opacity-60" : ""}`}>
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                  3
                </div>
                <h2 className="text-lg font-bold text-gray-900">Confirm Booking</h2>
              </div>

              {currentStep === 3 && (
                <div className="p-6">
                  {/* Booking Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service</span>
                        <span className="font-medium">{bookingData.service.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Provider</span>
                        <span className="font-medium">{bookingData.service.seller.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium">
                          {new Date(bookingData.bookingDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time</span>
                        <span className="font-medium">{bookingData.bookingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{bookingData.service.duration} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      By confirming this booking, you agree to our Terms of Service and Cancellation Policy.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5" />
                          Confirm Booking - ₹{totalAmount}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>

              {/* Service Card */}
              <div className="flex gap-4 p-3 bg-gray-50 rounded-xl mb-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={serviceImage}
                    alt={bookingData.service.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {bookingData.service.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{bookingData.service.seller.name}</p>
                  {bookingData.service.seller.verified && (
                    <span className="inline-flex items-center text-xs text-green-600 mt-1">
                      <FiCheck className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FiCalendar className="w-4 h-4 text-primary-600" />
                  <span className="font-medium text-gray-900">
                    {new Date(bookingData.bookingDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                  <span className="text-gray-500">at</span>
                  <span className="font-medium text-gray-900">{bookingData.bookingTime}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Price</span>
                  <span className="font-medium">₹{servicePrice}</span>
                </div>

                {bookingData.addons && bookingData.addons.length > 0 && (
                  <>
                    {bookingData.addons.map((addon) => (
                      <div key={addon.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{addon.name}</span>
                        <span className="font-medium">₹{addon.price}</span>
                      </div>
                    ))}
                  </>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-medium">₹{taxAmount}</span>
                </div>

                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-primary-600">₹{totalAmount}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FiShield className="w-4 h-4 text-green-600" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-yellow-500" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4 text-blue-600" />
                  <span>On-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Loading component
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    </div>
  );
}

export default function ServiceCheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <ServiceCheckoutContent />
    </Suspense>
  );
}

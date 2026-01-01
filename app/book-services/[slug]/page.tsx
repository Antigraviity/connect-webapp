"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiStar,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  duration: number;
  rating: number;
  totalReviews: number;
  views: number;
  status: string;
  images: string;
  tags?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    verified: boolean;
  };
  createdAt: string;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  // Load current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchService();
    }
  }, [slug]);

  // Redirect vendor to their dashboard preview
  useEffect(() => {
    if (currentUser && service && currentUser.id === service.seller?.id) {
      router.replace(`/vendor/services/preview/${service.id}`);
    }
  }, [currentUser, service, router]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/services?slug=${slug}`);
      const data = await response.json();

      if (data.success && data.services && data.services.length > 0) {
        setService(data.services[0]);
      } else {
        setError("Service not found");
      }
    } catch (err) {
      console.error("Error fetching service:", err);
      setError("Failed to load service");
    } finally {
      setLoading(false);
    }
  };

  // Parse images from JSON string
  const getImages = (): string[] => {
    if (!service) return [];
    try {
      const images = JSON.parse(service.images || "[]");
      return images.length > 0 ? images : [];
    } catch {
      return [];
    }
  };

  // Parse tags from JSON string
  const getTags = (): string[] => {
    if (!service) return [];
    try {
      return JSON.parse(service.tags || "[]");
    } catch {
      return [];
    }
  };

  const images = getImages();
  const tags = getTags();

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return dates;
  };

  const availableDates = generateDates();

  const handleBookNow = () => {
    if (!currentUser) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time");
      return;
    }

    // Navigate to checkout
    router.push(
      `/checkout?serviceId=${service?.id}&date=${selectedDate}&time=${selectedTime}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Service Not Found
          </h1>
          <p className="text-gray-600 mb-4">{error || "The service you're looking for doesn't exist."}</p>
          <Link
            href="/book-services"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full border ${isFavorite
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <FiHeart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <button className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50">
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-80 sm:h-96">
                {images.length > 0 && images[currentImageIndex] ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="text-6xl">🔧</span>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white"
                    >
                      <FiChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white"
                    >
                      <FiChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${index === currentImageIndex
                          ? "border-primary-600"
                          : "border-transparent"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Link
                      href={`/category/${service.category?.slug}`}
                      className="hover:text-primary-600"
                    >
                      {service.category?.name}
                    </Link>
                    {service.subCategory && (
                      <>
                        <span>•</span>
                        <span>{service.subCategory.name}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {service.title}
                  </h1>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FiStar className="w-5 h-5 fill-current" />
                    <span className="font-semibold text-gray-900">
                      {service.rating?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-gray-500">
                      ({service.totalReviews || 0} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {service.views || 0} views
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 py-4 border-y border-gray-200 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiClock className="w-5 h-5" />
                  <span>{service.duration} minutes</span>
                </div>
                {service.city && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiMapPin className="w-5 h-5" />
                    <span>
                      {service.city}
                      {service.state && `, ${service.state}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  About this service
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Service Provider
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {service.seller?.image ? (
                    <img
                      src={service.seller.image}
                      alt={service.seller.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {service.seller?.name || "Service Provider"}
                    </h3>
                    {service.seller?.verified && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        <FiCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Professional Service Provider</p>
                </div>
                <Link
                  href={`/profile/${service.seller?.id}`}
                  className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{service.discountPrice || service.price}
                  </span>
                  {service.discountPrice && service.discountPrice < service.price && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{service.price}
                      </span>

                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {service.duration} minutes
                </p>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Select Date</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`flex-shrink-0 w-16 py-3 rounded-lg text-center border-2 transition-colors ${selectedDate === date.value
                          ? "border-primary-600 bg-primary-50 text-primary-600"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="text-xs text-gray-500">{date.day}</div>
                      <div className="text-lg font-semibold">{date.date}</div>
                      <div className="text-xs text-gray-500">{date.month}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Select Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-lg text-sm font-medium border-2 transition-colors ${selectedTime === time
                          ? "border-primary-600 bg-primary-50 text-primary-600"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={!selectedDate || !selectedTime}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {currentUser ? 'Book Now' : 'Login to Book'}
              </button>

              {/* Contact Options */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-4">
                  Have questions? Contact the provider
                </p>
                <div className="flex gap-3">
                  {service.seller?.phone && (
                    <a
                      href={`tel:${service.seller.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      <FiPhone className="w-4 h-4" />
                      Call
                    </a>
                  )}
                  <Link
                    href={`/buyer/messages/services?provider=${service.seller?.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <FiMail className="w-4 h-4" />
                    Message
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

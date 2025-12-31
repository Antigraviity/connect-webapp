"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/lib/useAuth";

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
  createdAt: string;
}

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REJECTED: "bg-red-100 text-red-800",
  INACTIVE: "bg-gray-100 text-gray-800",
};

const statusIcons: Record<string, string> = {
  APPROVED: "✓",
  PENDING: "⏳",
  REJECTED: "✗",
  INACTIVE: "○",
};

export default function VendorServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch services when user is available
  useEffect(() => {
    if (user?.id) {
      fetchServices();
    }
  }, [user?.id]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/services?sellerId=${user?.id}&type=SERVICE`);
      const data = await response.json();

      if (data.success) {
        setServices(data.services || []);
      } else {
        setError(data.message || "Failed to fetch services");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        showNotification("success", "Service deleted successfully");
        setServices(services.filter((s) => s.id !== serviceId));
      } else {
        showNotification("error", data.message || "Failed to delete service");
      }
    } catch (err) {
      showNotification("error", "Failed to delete service");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Parse images from JSON string
  const getServiceImage = (service: Service): string | null => {
    try {
      const images = JSON.parse(service.images || "[]");
      return images.length > 0 ? images[0] : null;
    } catch {
      return null;
    }
  };

  // Parse tags from JSON string
  const getServiceTags = (service: Service): string[] => {
    try {
      return JSON.parse(service.tags || "[]");
    } catch {
      return [];
    }
  };

  // Filter and sort services
  const filteredServices = services
    .filter((service) => {
      const matchesSearch = service.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || service.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "rating":
          return b.rating - a.rating;
        case "price-low":
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case "price-high":
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case "views":
          return b.views - a.views;
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: services.length,
    active: services.filter((s) => s.status === "APPROVED").length,
    pending: services.filter((s) => s.status === "PENDING").length,
    inactive: services.filter((s) => s.status === "INACTIVE" || s.status === "REJECTED").length,
  };

  if (authLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Login</h3>
          <p className="text-gray-600 mb-4">You need to login to view your services</p>
          <Link
            href="/auth/login"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${notification.type === "success"
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
            }`}
        >
          {notification.type === "success" ? (
            <FiCheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <FiAlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span
            className={`text-sm font-medium ${notification.type === "success" ? "text-emerald-800" : "text-red-800"
              }`}
          >
            {notification.message}
          </span>
          <button
            onClick={() => setNotification(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Service?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this service? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteService(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your service offerings
          </p>
        </div>
        <Link
          href="/vendor/services/add"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-300 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-emerald-400 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md"
        >
          <FiPlus className="w-5 h-5" />
          Add New Service
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Services</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Active</option>
            <option value="PENDING">Pending</option>
            <option value="INACTIVE">Inactive</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
            <option value="views">Most Viewed</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your services...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Services</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchServices}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Services Grid */}
      {!loading && !error && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const imageUrl = getServiceImage(service);
            const tags = getServiceTags(service);

            return (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[service.status] || statusColors.INACTIVE
                        }`}
                    >
                      {service.status}
                    </span>
                  </div>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <span className="text-4xl">🔧</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {service.category?.name || "Uncategorized"}
                    {service.subCategory && ` • ${service.subCategory.name}`}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{service.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <div className="text-gray-600">{service.views || 0} views</div>
                    <div className="text-gray-600">{service.duration} min</div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-emerald-600">
                      ₹{service.discountPrice || service.price}
                    </span>
                    {service.discountPrice && service.discountPrice < service.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{service.price}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                          +{tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/vendor/services/preview/${service.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      View
                    </Link>
                    <Link
                      href={`/vendor/services/edit/${service.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-emerald-600 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(service.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredServices.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {services.length === 0 ? (
              <FiPlus className="w-8 h-8 text-gray-400" />
            ) : (
              <FiFilter className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {services.length === 0 ? "No Services Yet" : "No services found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {services.length === 0
              ? "Start by adding your first service to reach customers"
              : "Try adjusting your filters or search criteria"}
          </p>
          {services.length === 0 ? (
            <Link
              href="/vendor/services/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Your First Service
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && filteredServices.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredServices.length} of {services.length} services
        </div>
      )}
    </div>
  );
}

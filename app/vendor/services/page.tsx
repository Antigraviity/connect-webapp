"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

// Mock services data
const mockServices = [
  {
    id: "1",
    title: "Professional AC Repair & Maintenance",
    category: "Home Services",
    subCategory: "AC Repair",
    price: 499,
    discountPrice: 399,
    duration: 60,
    rating: 4.8,
    totalBookings: 145,
    status: "APPROVED",
    image: "/api/placeholder/400/300",
    tags: ["AC", "Repair", "Maintenance", "Installation"],
  },
  {
    id: "2",
    title: "Expert Plumbing Services",
    category: "Home Services",
    subCategory: "Plumbing",
    price: 699,
    discountPrice: 599,
    duration: 90,
    rating: 4.7,
    totalBookings: 128,
    status: "APPROVED",
    image: "/api/placeholder/400/300",
    tags: ["Plumbing", "Leak Repair", "Pipe Fitting"],
  },
  {
    id: "3",
    title: "Electrical Wiring & Repair",
    category: "Home Services",
    subCategory: "Electrical",
    price: 899,
    discountPrice: 799,
    duration: 120,
    rating: 4.9,
    totalBookings: 98,
    status: "APPROVED",
    image: "/api/placeholder/400/300",
    tags: ["Electrical", "Wiring", "Repair", "Installation"],
  },
  {
    id: "4",
    title: "House Painting Service",
    category: "Home Services",
    subCategory: "Painting",
    price: 1299,
    discountPrice: 1099,
    duration: 240,
    rating: 4.6,
    totalBookings: 67,
    status: "PENDING",
    image: "/api/placeholder/400/300",
    tags: ["Painting", "Interior", "Exterior"],
  },
  {
    id: "5",
    title: "Carpentry & Furniture Repair",
    category: "Home Services",
    subCategory: "Carpentry",
    price: 799,
    discountPrice: 699,
    duration: 150,
    rating: 4.5,
    totalBookings: 54,
    status: "APPROVED",
    image: "/api/placeholder/400/300",
    tags: ["Carpentry", "Furniture", "Repair"],
  },
  {
    id: "6",
    title: "Deep Cleaning Service",
    category: "Cleaning",
    subCategory: "Home Cleaning",
    price: 999,
    discountPrice: 849,
    duration: 180,
    rating: 4.4,
    totalBookings: 89,
    status: "INACTIVE",
    image: "/api/placeholder/400/300",
    tags: ["Cleaning", "Deep Clean", "Sanitization"],
  },
];

const statusColors = {
  APPROVED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REJECTED: "bg-red-100 text-red-800",
  INACTIVE: "bg-gray-100 text-gray-800",
};

export default function VendorServicesPage() {
  const [services, setServices] = useState(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("popularity");

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
        case "popularity":
          return b.totalBookings - a.totalBookings;
        case "rating":
          return b.rating - a.rating;
        case "price-low":
          return a.discountPrice - b.discountPrice;
        case "price-high":
          return b.discountPrice - a.discountPrice;
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: services.length,
    active: services.filter((s) => s.status === "APPROVED").length,
    pending: services.filter((s) => s.status === "PENDING").length,
    inactive: services.filter((s) => s.status === "INACTIVE").length,
  };

  return (
    <div className="p-6 space-y-6">
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
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0053B0] text-white rounded-lg text-sm font-semibold hover:bg-[#003d85] transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add New Service
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Services</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.active}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {stats.inactive}
          </p>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Active</option>
            <option value="PENDING">Pending</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
              <div className="absolute top-3 right-3 z-10">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[service.status as keyof typeof statusColors]
                    }`}
                >
                  {service.status}
                </span>
              </div>
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <span className="text-4xl">🔧</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {service.category} • {service.subCategory}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{service.rating}</span>
                </div>
                <div className="text-gray-600">
                  {service.totalBookings} bookings
                </div>
                <div className="text-gray-600">{service.duration} min</div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold text-primary-600">
                  ₹{service.discountPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{service.price}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {service.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  <FiEye className="w-4 h-4" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-50">
                  <FiEdit2 className="w-4 h-4" />
                  Edit
                </button>
                <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFilter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiCamera,
  FiPackage,
  FiDollarSign,
  FiStar,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiTrendingUp,
  FiAward,
  FiShoppingBag,
} from "react-icons/fi";

export default function VendorProfilePage() {
  // Mock vendor data - replace with actual data from your backend
  const vendorData = {
    name: "John Doe",
    email: "john.doe@vendor.com",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra, India",
    joinDate: "March 2024",
    avatar: "",
    bio: "Professional service provider with 10+ years of experience in home maintenance and repairs.",
    verified: true,
    
    // Stats
    servicesOffered: 15,
    activeServices: 8,
    totalOrders: 234,
    completedOrders: 221,
    totalEarnings: "₹4,52,000",
    averageRating: 4.8,
    totalReviews: 156,
    responseTime: "2 hours",
    
    // Vendor Info
    experience: "10 years",
    specialization: "Home Maintenance & Repairs",
    serviceArea: "Mumbai, Navi Mumbai, Thane",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-1">Manage your professional information and service details</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all">
          <FiEdit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-xl relative">
          <button className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors">
            <FiCamera className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  {vendorData.avatar ? (
                    <img src={vendorData.avatar} alt={vendorData.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{vendorData.name.charAt(0)}</span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                  <FiCamera className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {/* Name and Status */}
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{vendorData.name}</h2>
                  {vendorData.verified && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-semibold">
                      <FiCheckCircle className="w-3 h-3" />
                      Verified Vendor
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{vendorData.bio}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">{vendorData.averageRating}</span>
                    <span className="text-sm text-gray-600">({vendorData.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FiClock className="w-4 h-4" />
                    <span>Responds in {vendorData.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FiMail className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{vendorData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FiPhone className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{vendorData.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FiMapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium">{vendorData.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FiCalendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-medium">{vendorData.joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{vendorData.servicesOffered}</p>
            <p className="text-sm text-gray-600 mt-1">Services Offered</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{vendorData.completedOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Completed Orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{vendorData.totalEarnings}</p>
            <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FiStar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{vendorData.averageRating}/5.0</p>
            <p className="text-sm text-gray-600 mt-1">Average Rating</p>
          </div>
        </div>
      </div>

      {/* Additional Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Professional Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg">
              <FiAward className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Experience</span>
              <span className="text-sm font-medium text-gray-900">{vendorData.experience}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Specialization</span>
              <span className="text-sm font-medium text-gray-900">{vendorData.specialization}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Service Area</span>
              <span className="text-sm font-medium text-gray-900">{vendorData.serviceArea}</span>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg">
              <FiShield className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Email Verified</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Phone Verified</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">ID Verified</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-50 rounded-lg">
            <FiClock className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 py-2">
            <div className="p-1.5 bg-green-50 rounded-lg mt-0.5">
              <FiCheckCircle className="w-3 h-3 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">Order #234 Completed</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3 py-2">
            <div className="p-1.5 bg-blue-50 rounded-lg mt-0.5">
              <FiPackage className="w-3 h-3 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">New Service Added</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3 py-2">
            <div className="p-1.5 bg-yellow-50 rounded-lg mt-0.5">
              <FiStar className="w-3 h-3 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">Received 5-Star Review</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

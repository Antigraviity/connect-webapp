"use client";

import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit2,
  FiCamera,
  FiBriefcase,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiGlobe,
  FiLinkedin,
  FiTwitter,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";

export default function CompanyProfilePage() {
  // Mock company data - replace with actual data from your backend
  const companyData = {
    name: "Tech Corp",
    email: "contact@techcorp.com",
    phone: "+91 11 4567 8900",
    location: "Gurgaon, Haryana, India",
    joinDate: "December 2023",
    logo: "",
    description: "Leading technology company specializing in innovative software solutions and digital transformation.",
    verified: true,
    website: "www.techcorp.com",
    linkedin: "linkedin.com/company/techcorp",
    twitter: "@techcorp",

    // Stats
    jobsPosted: 45,
    activeJobs: 12,
    totalApplications: 523,
    hiredCandidates: 18,
    profileViews: 2450,

    // Company Info
    founded: "2020",
    employees: "50-200",
    industry: "Information Technology",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View your company information</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-company-400 to-company-600 rounded-t-xl relative">
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-xl border-4 border-white bg-gradient-to-r from-company-400 to-company-600 flex items-center justify-center shadow-lg">
                  {companyData.logo ? (
                    <img src={companyData.logo} alt={companyData.name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{companyData.name.charAt(0)}</span>
                  )}
                </div>
              </div>

              {/* Name and Status */}
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{companyData.name}</h2>
                  {companyData.verified && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-company-50 text-company-600 rounded-full text-xs font-bold shadow-sm">
                      <FiCheckCircle className="w-3 h-3 text-company-500" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{companyData.description}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiMail className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Email</p>
                <p className="font-medium text-sm truncate max-w-[150px]">{companyData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiPhone className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Phone</p>
                <p className="font-medium text-sm truncate max-w-[150px]">{companyData.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiMapPin className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Location</p>
                <p className="font-medium text-sm truncate max-w-[150px]">{companyData.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiCalendar className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Member Since</p>
                <p className="font-medium text-sm truncate max-w-[150px]">{companyData.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiGlobe className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Website</p>
                <p className="font-medium text-company-600 hover:underline cursor-pointer">{companyData.website}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiLinkedin className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">LinkedIn</p>
                <p className="font-medium text-company-600 hover:underline cursor-pointer">{companyData.linkedin}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiTwitter className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Twitter</p>
                <p className="font-medium text-company-600 hover:underline cursor-pointer">{companyData.twitter}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-company-50 rounded-lg">
                <FiBriefcase className="w-6 h-6 text-company-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{companyData.jobsPosted}</p>
            <p className="text-sm text-gray-600 mt-1">Jobs Posted</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <FiClock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{companyData.activeJobs}</p>
            <p className="text-sm text-gray-600 mt-1">Active Jobs</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{companyData.totalApplications}</p>
            <p className="text-sm text-gray-600 mt-1">Applications</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <FiAward className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{companyData.hiredCandidates}</p>
            <p className="text-sm text-gray-600 mt-1">Hired</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{companyData.profileViews}</p>
            <p className="text-sm text-gray-600 mt-1">Profile Views</p>
          </div>
        </div>
      </div>

      {/* Additional Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-company-50 rounded-lg">
              <FiBriefcase className="w-5 h-5 text-company-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Founded</span>
              <span className="text-sm font-medium text-gray-900">{companyData.founded}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Company Size</span>
              <span className="text-sm font-medium text-gray-900">{companyData.employees} employees</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Industry</span>
              <span className="text-sm font-medium text-gray-900">{companyData.industry}</span>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-company-50 rounded-lg">
              <FiShield className="w-5 h-5 text-company-600" />
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
                <span className="text-sm text-gray-700">Company Verified</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

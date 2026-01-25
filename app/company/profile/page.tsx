"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
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
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

interface CompanyData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  bio: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  industry: string | null;
  companySize: string | null;
  linkedin: string | null;
  website: string | null;
  verified: boolean;
  createdAt: string;
}

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationsByStatus: {
    hired: number;
  };
  totalViews: number;
}

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch company profile
        const profileResponse = await fetch(`/api/company/profile?employerId=${user.id}`);
        const profileData = await profileResponse.json();

        if (profileData.success) {
          setCompanyData(profileData.data);
        } else {
          setError(profileData.message || "Failed to fetch profile");
        }

        // Fetch stats
        const statsResponse = await fetch(`/api/employer/stats?employerId=${user.id}`);
        const statsData = await statsResponse.json();

        if (statsData.success) {
          setStats(statsData.stats);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  // Format date for display
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format phone number for display
  const formatPhone = (phone: string | null) => {
    if (!phone) return "Not provided";
    return phone;
  };

  // Build location string
  const getLocation = () => {
    const parts = [
      companyData?.city,
      companyData?.state,
      companyData?.country
    ].filter(Boolean);
    
    if (parts.length === 0 && companyData?.address) {
      return companyData.address;
    }
    
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <FiLoader className="w-8 h-8 text-company-600 animate-spin" />
        <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <FiAlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Profile</h3>
            <p className="text-red-600 text-sm mt-1">{error || "Unable to load profile data"}</p>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="w-32 h-32 rounded-xl border-4 border-white bg-gradient-to-r from-company-400 to-company-600 flex items-center justify-center shadow-lg overflow-hidden">
                  {companyData.image ? (
                    <img src={companyData.image} alt={companyData.name} className="w-full h-full object-cover" />
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
                <p className="text-gray-600 mt-1">
                  {companyData.bio || "No description provided"}
                </p>
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
                <p className="font-medium text-sm truncate max-w-[200px]">{companyData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiPhone className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Phone</p>
                <p className="font-medium text-sm truncate max-w-[200px]">{formatPhone(companyData.phone)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiMapPin className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Location</p>
                <p className="font-medium text-sm truncate max-w-[200px]">{getLocation()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiCalendar className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Member Since</p>
                <p className="font-medium text-sm truncate max-w-[200px]">{formatJoinDate(companyData.createdAt)}</p>
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
                {companyData.website ? (
                  <a 
                    href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-company-600 hover:underline cursor-pointer text-sm"
                  >
                    {companyData.website}
                  </a>
                ) : (
                  <p className="font-medium text-gray-400 text-sm">Not provided</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiLinkedin className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">LinkedIn</p>
                {companyData.linkedin ? (
                  <a 
                    href={companyData.linkedin.startsWith('http') ? companyData.linkedin : `https://${companyData.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-company-600 hover:underline cursor-pointer text-sm"
                  >
                    {companyData.linkedin}
                  </a>
                ) : (
                  <p className="font-medium text-gray-400 text-sm">Not provided</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-company-50 rounded-lg">
                <FiBriefcase className="w-5 h-5 text-company-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Industry</p>
                <p className="font-medium text-sm">{companyData.industry || "Not specified"}</p>
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
            <p className="text-2xl font-bold text-gray-900">{stats?.totalJobs || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Jobs Posted</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <FiClock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.activeJobs || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Active Jobs</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalApplications || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Applications</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <FiAward className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.applicationsByStatus?.hired || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Hired</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
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
              <span className="text-sm text-gray-600">Company Size</span>
              <span className="text-sm font-medium text-gray-900">
                {companyData.companySize ? `${companyData.companySize} employees` : "Not specified"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Industry</span>
              <span className="text-sm font-medium text-gray-900">
                {companyData.industry || "Not specified"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Location</span>
              <span className="text-sm font-medium text-gray-900">{getLocation()}</span>
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
                <FiCheckCircle className={`w-4 h-4 ${companyData.email ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm text-gray-700">Email Verified</span>
              </div>
              <span className={`text-xs font-medium ${companyData.email ? "text-green-600" : "text-gray-400"}`}>
                {companyData.email ? "Active" : "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <FiCheckCircle className={`w-4 h-4 ${companyData.phone ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm text-gray-700">Phone Verified</span>
              </div>
              <span className={`text-xs font-medium ${companyData.phone ? "text-green-600" : "text-gray-400"}`}>
                {companyData.phone ? "Active" : "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <FiCheckCircle className={`w-4 h-4 ${companyData.verified ? "text-green-600" : "text-gray-400"}`} />
                <span className="text-sm text-gray-700">Company Verified</span>
              </div>
              <span className={`text-xs font-medium ${companyData.verified ? "text-green-600" : "text-gray-400"}`}>
                {companyData.verified ? "Active" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

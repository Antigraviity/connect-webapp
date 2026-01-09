"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  FiAward,
  FiShoppingBag,
  FiRefreshCw,
  FiX,
  FiUpload,
  FiTrash2,
  FiCrop,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface VendorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  bio: string;
  verified: boolean;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  joinDate: string;
}

interface VendorStats {
  servicesOffered: number;
  activeServices: number;
  totalOrders: number;
  completedOrders: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}

interface Activity {
  type: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  icon: string;
}

export default function VendorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // Image upload states
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
    city: '',
    state: '',
    country: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Please login to view your profile');
        return;
      }

      const user = JSON.parse(userData);
      const response = await fetch(`/api/vendor/profile?vendorId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setProfile(result.data.profile);
        setStats(result.data.stats);
        setRecentActivity(result.data.recentActivity || []);

        // Initialize edit form
        setEditForm({
          name: result.data.profile.name || '',
          phone: result.data.profile.phone || '',
          bio: result.data.profile.bio || '',
          city: result.data.profile.city || '',
          state: result.data.profile.state || '',
          country: result.data.profile.country || '',
        });
      } else {
        setError(result.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Upload to Cloudinary via API
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          fileName: file.name,
          fileType: file.type,
          folder: 'profiles'
        })
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success && uploadResult.file?.url) {
        // Update profile with new image
        const updateResponse = await fetch('/api/vendor/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorId: profile.id,
            image: uploadResult.file.url
          })
        });

        const updateResult = await updateResponse.json();

        if (updateResult.success) {
          // Update local state
          setProfile(prev => prev ? { ...prev, image: uploadResult.file.url } : null);

          // Update localStorage
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            user.image = uploadResult.file.url;
            localStorage.setItem('user', JSON.stringify(user));
          }

          // Dispatch custom event to update sidebar
          window.dispatchEvent(new Event('profileUpdated'));

          alert('Profile picture updated successfully!');
        } else {
          alert(updateResult.message || 'Failed to update profile');
        }
      } else {
        alert(uploadResult.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!profile) return;

    if (!confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    setUploading(true);
    setShowPhotoMenu(false);

    try {
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: profile.id,
          image: null
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setProfile(prev => prev ? { ...prev, image: null } : null);

        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.image = null;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Dispatch custom event to update sidebar
        window.dispatchEvent(new Event('profileUpdated'));

        alert('Profile photo deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete photo');
      }
    } catch (err) {
      console.error('Delete photo error:', err);
      alert('Failed to delete photo');
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setUploading(true);

    try {
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: profile.id,
          ...editForm
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          name: editForm.name,
          phone: editForm.phone,
          bio: editForm.bio,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
          location: [editForm.city, editForm.state, editForm.country].filter(Boolean).join(', ') || 'Not specified',
        } : null);

        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.name = editForm.name;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Dispatch custom event to update sidebar
        window.dispatchEvent(new Event('profileUpdated'));

        setShowEditModal(false);
        alert('Profile updated successfully!');
      } else {
        alert(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'check':
        return <FiCheckCircle className="w-3 h-3 text-green-600" />;
      case 'order':
        return <FiShoppingBag className="w-3 h-3 text-emerald-600" />;
      case 'star':
        return <FiStar className="w-3 h-3 text-yellow-600" />;
      case 'package':
        return <FiPackage className="w-3 h-3 text-purple-600" />;
      default:
        return <FiClock className="w-3 h-3 text-gray-600" />;
    }
  };

  const getActivityBgColor = (iconType: string) => {
    switch (iconType) {
      case 'check':
        return 'bg-green-50';
      case 'order':
        return 'bg-emerald-50';
      case 'star':
        return 'bg-yellow-50';
      case 'package':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="vendor" label="Loading..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleImageUpload(e, 'avatar')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={(e) => handleImageUpload(e, 'cover')}
        accept="image/*"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View your professional information and service details</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-t-xl relative">
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg overflow-hidden">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white uppercase">{profile.name.charAt(0)}</span>
                  )}
                </div>
              </div>

              {/* Name and Status */}
              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  {profile.verified && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                      <FiCheckCircle className="w-3 h-3" />
                      Verified Vendor
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  {profile.bio && !profile.bio.includes('"day":') && !profile.bio.includes('"enabled":')
                    ? profile.bio
                    : 'Professional service provider'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">{stats?.averageRating || 0}</span>
                    <span className="text-sm text-gray-600">({stats?.totalReviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FiClock className="w-4 h-4" />
                    <span>Responds in 2 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FiMail className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FiPhone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FiMapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium">{profile.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FiCalendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-medium">{profile.joinDate}</p>
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
              <div className="p-3 bg-emerald-50 rounded-lg">
                <FiPackage className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.servicesOffered || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Services Offered</p>
            {stats && stats.activeServices > 0 && (
              <p className="text-xs text-green-600 mt-1">{stats.activeServices} active</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-teal-50 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.completedOrders || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Completed Orders</p>
            {stats && stats.totalOrders > 0 && (
              <p className="text-xs text-emerald-600 mt-1">{stats.totalOrders} total orders</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalEarnings || 0)}</p>
            <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FiStar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.averageRating || 0}/5.0</p>
            <p className="text-sm text-gray-600 mt-1">Average Rating</p>
            {stats && stats.totalReviews > 0 && (
              <p className="text-xs text-emerald-600 mt-1">{stats.totalReviews} reviews</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FiShield className="w-5 h-5 text-emerald-600" />
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
                {profile.phone && profile.phone !== 'Not provided' ? (
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FiClock className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm text-gray-700">Phone Verified</span>
              </div>
              <span className={`text-xs font-medium ${profile.phone && profile.phone !== 'Not provided' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                {profile.phone && profile.phone !== 'Not provided' ? 'Active' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {profile.verified ? (
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FiClock className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm text-gray-700">ID Verified</span>
              </div>
              <span className={`text-xs font-medium ${profile.verified ? 'text-emerald-600' : 'text-yellow-600'}`}>
                {profile.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <FiAward className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/vendor/services"
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
            >
              <FiPackage className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">My Services</span>
            </Link>
            <Link
              href="/vendor/bookings"
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-teal-50 hover:border-teal-200 transition-colors"
            >
              <FiShoppingBag className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium">Bookings</span>
            </Link>
            <Link
              href="/vendor/earnings/services"
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
            >
              <FiDollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium">Earnings</span>
            </Link>
            <Link
              href="/vendor/reviews/services"
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FiStar className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">Reviews</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <FiClock className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 py-2">
                <div className={`p-1.5 ${getActivityBgColor(activity.icon)} rounded-lg mt-0.5`}>
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.subtitle} • {activity.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm">Your activity will appear here</p>
          </div>
        )}
      </div>
    </div >
  );
}

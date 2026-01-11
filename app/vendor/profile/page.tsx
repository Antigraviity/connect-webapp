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
  FiInfo,
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
    <div className="p-4 sm:p-6 lg:p-10 bg-gray-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm relative group">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
            {/* Cover photo upload trigger could go here if needed, but keeping it simple for now */}
          </div>
          <div className="px-6 sm:px-10 pb-8 sm:pb-10 -mt-12 sm:-mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
                {/* Avatar */}
                <div className="relative group/avatar">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white">
                    {profile.image ? (
                      <img src={profile.image} alt={profile.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-3xl sm:text-4xl">
                        {profile.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 bg-emerald-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95 z-20"
                  >
                    <FiCamera className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="pb-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1 sm:mb-2 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{profile.name}</h1>
                    {profile.verified && (
                      <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                        <FiCheckCircle className="w-4 h-4" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base max-w-lg">
                    {profile.bio && !profile.bio.includes('"day":') && !profile.bio.includes('"enabled":')
                      ? profile.bio
                      : 'Professional service provider'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500">
                      <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-900">{stats?.averageRating || 0}</span>
                      <span className="text-gray-400">({stats?.totalReviews || 0} reviews)</span>
                    </div>
                    <span className="w-1.5 h-1.5 bg-gray-200 rounded-full hidden sm:inline"></span>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500">
                      <FiClock className="w-4 h-4 text-emerald-400" />
                      <span>Quick response</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 pb-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-50 hover:border-emerald-200 hover:text-emerald-600 transition-all shadow-sm flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <FiMail className="w-4 h-4" />
                </div>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  { icon: FiMail, label: "Email Address", value: profile.email, color: "text-blue-500", bg: "bg-blue-50" },
                  { icon: FiPhone, label: "Phone Number", value: profile.phone, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: FiMapPin, label: "Location", value: profile.location, color: "text-rose-500", bg: "bg-rose-50" },
                  { icon: FiCalendar, label: "Joined Connect", value: profile.joinDate, color: "text-amber-500", bg: "bg-amber-50" }
                ].map((item, index) => (
                  <div key={index} className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-wider uppercase mb-1">{item.label}</p>
                        <p className="font-bold text-gray-700 text-sm sm:text-base truncate">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column could have stats or other info */}
        </div>
      </div>

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
    </div >
  );
}

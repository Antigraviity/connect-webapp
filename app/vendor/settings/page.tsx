"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiUser,
  FiBriefcase,
  FiFileText,
  FiMapPin,
  FiBell,
  FiCreditCard,
  FiLock,
  FiSave,
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiExternalLink,
  FiEdit,
  FiX,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface VendorSettingsData {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | null;
    bio: string;
    verified: boolean;
    website: string;
    wallet: number;
  };
  business: {
    businessName: string;
    businessType: string;
    serviceType: string;
    gstNumber: string;
    panNumber: string;
  };
  serviceDetails: {
    serviceCategory: string;
    serviceName: string;
  };
  documents: {
    idProof: string | null;
    idProofStatus: string;
    businessDoc: string | null;
    businessDocStatus: string;
    addressProof: string | null;
    addressProofStatus: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    serviceRadius: number;
  };
  payment: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId: string;
  };
  notifications: {
    emailOrders: boolean;
    emailMessages: boolean;
    emailReviews: boolean;
    emailPromotions: boolean;
    smsOrders: boolean;
    smsReminders: boolean;
    pushOrders: boolean;
    pushMessages: boolean;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
  };
}

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<VendorSettingsData>({
    profile: {
      id: "",
      name: "",
      email: "",
      phone: "",
      image: null,
      bio: "",
      verified: false,
      website: "",
      wallet: 0,
    },
    business: {
      businessName: "",
      businessType: "Individual",
      serviceType: "Service",
      gstNumber: "",
      panNumber: "",
    },
    serviceDetails: {
      serviceCategory: "",
      serviceName: "",
    },
    documents: {
      idProof: null,
      idProofStatus: "Pending",
      businessDoc: null,
      businessDocStatus: "Pending",
      addressProof: null,
      addressProofStatus: "Pending",
    },
    location: {
      address: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      serviceRadius: 10,
    },
    payment: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      upiId: "",
    },
    notifications: {
      emailOrders: true,
      emailMessages: true,
      emailReviews: true,
      emailPromotions: false,
      smsOrders: true,
      smsReminders: true,
      pushOrders: true,
      pushMessages: true,
    },
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Deactivation State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Password Strength State
  const [passwordStrength, setPasswordStrength] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
  });

  const settingsTabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "business", label: "Business Info", icon: FiBriefcase },
    { id: "serviceDetails", label: "Service Details", icon: FiFileText },
    { id: "location", label: "Location", icon: FiMapPin },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "payment", label: "Payment", icon: FiCreditCard },
    { id: "security", label: "Security", icon: FiLock },
  ];

  // Get vendor ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setVendorId(user.id);
      } catch {
        setError("Failed to get user info");
        setLoading(false);
      }
    } else {
      setError("Please login to view settings");
      setLoading(false);
    }
  }, []);

  // Fetch settings from API
  const fetchSettings = async () => {
    if (!vendorId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/vendor/settings?vendorId=${vendorId}`);
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.message || "Failed to load settings");
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchSettings();
    }
  }, [vendorId]);

  // Save settings to API
  const saveSection = async (section: string, data: any) => {
    if (!vendorId) return false;

    try {
      const response = await fetch("/api/vendor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, section, data }),
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error("Error saving settings:", err);
      return false;
    }
  };



  const sendOtp = async (email: string) => {
    try {
      setOtpTimer(60);
      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const response = await fetch("/api/otp/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send OTP");
    }
  };

  const handleVerifyEmailUpdate = async () => {
    if (!otp || otp.length !== 6) return;

    setVerifyingOtp(true);
    setError(null);

    try {
      const response = await fetch("/api/vendor/settings/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          email: pendingEmail,
          otp
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Email updated successfully!");
        setShowOtpModal(false);
        setIsEditing(false);
        setOtp("");

        // Update local storage
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          user.email = pendingEmail;
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Update local state
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, email: pendingEmail }
        }));
      } else {
        setError(result.message || "Failed to verify OTP");
      }
    } catch (err) {
      console.error("Error verifying email update:", err);
      setError("An error occurred during verification");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    let success = false;

    // Check if email has changed
    const emailChanged = settings.profile.email !== (JSON.parse(localStorage.getItem("user") || "{}").email || "");

    // If email changed, we handle it separately after other saves
    if (emailChanged) {
      setPendingEmail(settings.profile.email);
    }

    try {
      switch (activeTab) {
        case "profile":
          // Save profile data (excluding email which is now handled securely)
          success = await saveSection("profile", {
            name: settings.profile.name,
            phone: settings.profile.phone,
            bio: settings.profile.bio,
            image: settings.profile.image,
            website: settings.profile.website,
            ...settings.socialMedia,
          });

          if (success) {
            // Update local storage for non-email fields
            const userData = localStorage.getItem("user");
            if (userData) {
              const user = JSON.parse(userData);
              user.name = settings.profile.name;
              user.image = settings.profile.image;
              localStorage.setItem("user", JSON.stringify(user));
            }

            // Trigger OTP flow if email changed
            if (emailChanged) {
              await sendOtp(settings.profile.email);
              setShowOtpModal(true);
              return; // Don't close edit mode yet
            } else {
              setIsEditing(false);
            }
          }
          break;

        case "business":
          success = await saveSection("business", settings.business);
          break;

        case "serviceDetails":
          success = await saveSection("serviceDetails", settings.serviceDetails);
          break;

        case "location":
          success = await saveSection("location", settings.location);
          break;

        case "payment":
          success = await saveSection("payment", settings.payment);
          break;

        case "notifications":
          success = await saveSection("notifications", settings.notifications);
          break;

        default:
          success = true;
      }

      if (success) {
        setSuccessMessage("Settings saved successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError("Failed to save settings");
      }
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (confirmDeleteText.toLowerCase() !== 'delete') return;

    setDeactivating(true);
    setError(null);

    try {
      const response = await fetch(`/api/vendor/settings?vendorId=${vendorId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Clear session and redirect
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        setError(result.message || 'Failed to deactivate account');
        setDeactivating(false);
      }
    } catch (err) {
      console.error('Deactivation error:', err);
      setError('Failed to deactivate account');
      setDeactivating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/vendor/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setError("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    setUploading("profile");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profiles");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSettings({
          ...settings,
          profile: { ...settings.profile, image: data.file.url },
        });
        setSuccessMessage("Photo uploaded! Click Save to apply changes.");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert("Failed to upload image: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: "idProof" | "businessDoc" | "addressProof"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(docType);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "documents");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSettings({
          ...settings,
          documents: { ...settings.documents, [docType]: data.file.url },
        });

        // Auto-save document
        await saveSection("documents", {
          ...settings.documents,
          [docType]: data.file.url,
        });

        setSuccessMessage("Document uploaded successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert("Failed to upload document: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload document");
    } finally {
      setUploading(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Verified: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="vendor" label="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <FiCheck className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <FiAlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <nav className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsEditing(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                    ? "bg-emerald-50 text-emerald-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                // EDIT MODE
                <>
                  {/* Profile Photo */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {settings.profile.image ? (
                        <img
                          src={settings.profile.image}
                          alt={settings.profile.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-lg">
                          <span className="text-white text-3xl font-bold uppercase">
                            {getInitials(settings.profile.name || "V")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading === "profile"}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-colors"
                      >
                        {uploading === "profile" ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <FiUpload className="w-4 h-4" />
                        )}
                        Upload Photo
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            profile: { ...settings.profile, name: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉</span>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              profile: { ...settings.profile, email: e.target.value },
                            })
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                        <input
                          type="tel"
                          value={settings.profile.phone}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              profile: { ...settings.profile, phone: e.target.value },
                            })
                          }
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🌐</span>
                        <input
                          type="url"
                          value={settings.profile.website}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              profile: { ...settings.profile, website: e.target.value },
                            })
                          }
                          placeholder="https://example.com"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Description</label>
                    <textarea
                      value={settings.profile.bio}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          profile: { ...settings.profile, bio: e.target.value },
                        })
                      }
                      rows={4}
                      maxLength={500}
                      placeholder="Tell customers about yourself and your services..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{settings.profile.bio?.length || 0}/500 characters</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all font-bold"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // VIEW MODE
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Profile Photo View */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        {settings.profile.image ? (
                          <img
                            src={settings.profile.image}
                            alt={settings.profile.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                            <span className="text-white text-4xl font-bold uppercase">
                              {getInitials(settings.profile.name || "V")}
                            </span>
                          </div>
                        )}
                        {settings.profile.verified && (
                          <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified Vendor">
                            <FiCheck className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                          <p className="text-lg font-medium text-gray-900">{settings.profile.name || "Not set"}</p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Username</label>
                          <p className="text-lg font-medium text-gray-900">{settings.profile.email?.split("@")[0] || "Not set"}</p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                          <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <span className="text-gray-400">✉</span> {settings.profile.email}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                          <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <span className="text-gray-400">📞</span> {settings.profile.phone || "Not set"}
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Website</label>
                          {settings.profile.website ? (
                            <a href={settings.profile.website} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-emerald-600 hover:underline flex items-center gap-2">
                              <span className="text-gray-400">🌐</span> {settings.profile.website}
                            </a>
                          ) : (
                            <p className="text-lg text-gray-400 italic">No website added</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bio / Description</label>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {settings.profile.bio || <span className="text-gray-400 italic">No bio description added yet.</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Business Info Tab */}
          {activeTab === "business" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit Business Info
                  </button>
                )}
              </div>

              {isEditing ? (
                // EDIT MODE
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={settings.business.businessName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: { ...settings.business, businessName: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                      <select
                        value={settings.business.businessType}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: { ...settings.business, businessType: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      >
                        <option value="Individual">Individual</option>
                        <option value="Company">Company</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Proprietorship">Proprietorship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service/Product Type</label>
                      <select
                        value={settings.business.serviceType}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: { ...settings.business, serviceType: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      >
                        <option value="Service">Service</option>
                        <option value="Product">Product</option>
                        <option value="Both">Both</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">From registration form</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Number (Optional)</label>
                      <input
                        type="text"
                        value={settings.business.gstNumber}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: { ...settings.business, gstNumber: e.target.value.toUpperCase() },
                          })
                        }
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                      <input
                        type="text"
                        value={settings.business.panNumber}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: { ...settings.business, panNumber: e.target.value.toUpperCase() },
                          })
                        }
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Note:</strong> Business documents are required for verification. Upload them in the Service Details section.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all font-bold"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // VIEW MODE
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Business Name</label>
                      <p className="text-lg font-medium text-gray-900">{settings.business.businessName || "Not set"}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Business Type</label>
                      <p className="text-lg font-medium text-gray-900">{settings.business.businessType || "Not set"}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service/Product Type</label>
                      <p className="text-lg font-medium text-gray-900">{settings.business.serviceType || "Not set"}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">GST Number</label>
                      <p className="text-lg font-medium text-gray-900 font-mono">{settings.business.gstNumber || "Not set"}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">PAN Number</label>
                      <p className="text-lg font-medium text-gray-900 font-mono">{settings.business.panNumber || "Not set"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Service Details Tab */}
          {activeTab === "serviceDetails" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Service Details</h2>
                  <p className="text-gray-600">Information collected during registration</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit Service Details
                  </button>
                )}
              </div>

              {isEditing ? (
                // EDIT MODE
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Category</label>
                      <input
                        type="text"
                        value={settings.serviceDetails.serviceCategory || "Home Services"}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Category selected during registration</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                      <input
                        type="text"
                        value={settings.serviceDetails.serviceName || "Plumbing Services"}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Service selected during registration</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Business Documents</h3>

                    {/* Document Upload Card */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Document Type</p>
                          <p className="font-medium">GST Certificate</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(settings.documents.businessDocStatus)}`}>
                            {settings.documents.businessDocStatus}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Upload Date</p>
                          <p className="font-medium">{settings.documents.businessDoc ? "Uploaded" : "Not uploaded"}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <input
                          type="file"
                          onChange={(e) => handleDocumentUpload(e, "businessDoc")}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          id="businessDoc"
                        />
                        <label
                          htmlFor="businessDoc"
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm cursor-pointer hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          {uploading === "businessDoc" ? (
                            <LoadingSpinner size="sm" color="white" />
                          ) : (
                            <FiUpload className="w-4 h-4" />
                          )}
                          {settings.documents.businessDoc ? "Re-upload Document" : "Upload Document"}
                        </label>
                        {settings.documents.businessDoc && (
                          <a
                            href={settings.documents.businessDoc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            View
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Upload new version if needed (PDF, JPG, PNG - Max 5MB)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-emerald-800 text-sm">
                      <strong>Info:</strong> To change your service category or service name, please contact support. These fields are locked to prevent accidental changes.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all font-bold"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // VIEW MODE
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Category</label>
                        <p className="text-lg font-medium text-gray-900">{settings.serviceDetails.serviceCategory || "Home Services"}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Name</label>
                        <p className="text-lg font-medium text-gray-900">{settings.serviceDetails.serviceName || "Plumbing Services"}</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 pt-4 border-t border-gray-200">Business Documents</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Document View Card */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-white flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">GST Certificate</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(settings.documents.businessDocStatus)}`}>
                            {settings.documents.businessDocStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {settings.documents.businessDoc ? "Document uploaded" : "No document uploaded"}
                        </p>
                      </div>

                      {settings.documents.businessDoc && (
                        <a
                          href={settings.documents.businessDoc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium border border-transparent hover:border-emerald-100"
                        >
                          <FiEye className="w-4 h-4" />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location Tab */}
          {activeTab === "location" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-gray-900">Service Location</h2>
                  <p className="text-gray-600">This is where you provide your services</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit Location
                  </button>
                )}
              </div>

              {isEditing ? (
                // EDIT MODE
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={settings.location.address}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            location: { ...settings.location, address: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={settings.location.city}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            location: { ...settings.location, city: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={settings.location.state}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            location: { ...settings.location, state: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={settings.location.pincode}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            location: { ...settings.location, pincode: e.target.value },
                          })
                        }
                        maxLength={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={settings.location.country}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Radius (km)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={settings.location.serviceRadius}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              location: { ...settings.location, serviceRadius: parseInt(e.target.value) },
                            })
                          }
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <span className="w-20 text-center px-3 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-lg">
                          {settings.location.serviceRadius} km
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Maximum distance you are willing to travel for service</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all font-bold"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // VIEW MODE
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Address</label>
                      <div className="flex items-start gap-3">
                        <FiMapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <p className="text-lg text-gray-900 leading-snug">
                          {settings.location.address ? (
                            <>
                              {settings.location.address}<br />
                              {settings.location.city}, {settings.location.state} - {settings.location.pincode}<br />
                              {settings.location.country}
                            </>
                          ) : (
                            <span className="text-gray-400 italic">No address set</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Service Radius</label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <FiMapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{settings.location.serviceRadius} km</p>
                          <p className="text-sm text-gray-500">Maximum travel distance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: "emailOrders", label: "New Orders", desc: "Get notified when you receive a new order" },
                      { key: "emailMessages", label: "Messages", desc: "Get notified when customers message you" },
                      { key: "emailReviews", label: "Reviews", desc: "Get notified when customers leave reviews" },
                      { key: "emailPromotions", label: "Promotions", desc: "Receive promotional offers and updates" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, [item.key]: e.target.checked },
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0053B0]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SMS & Push Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: "smsOrders", label: "SMS - Order Alerts" },
                      { key: "smsReminders", label: "SMS - Reminders" },
                      { key: "pushOrders", label: "Push - Order Updates" },
                      { key: "pushMessages", label: "Push - New Messages" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, [item.key]: e.target.checked },
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0053B0]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all font-bold"
              >
                {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment Settings</h2>
                  <p className="text-gray-600">Manage your bank account and payment details</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
                  >
                    <FiEdit className="w-4 h-4" />
                    Edit Payment Info
                  </button>
                )}
              </div>

              {isEditing ? (
                // EDIT MODE
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                      <input
                        type="text"
                        value={settings.payment.accountHolderName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, accountHolderName: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={settings.payment.bankName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, bankName: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={settings.payment.accountNumber}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, accountNumber: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        value={settings.payment.ifscCode}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, ifscCode: e.target.value.toUpperCase() },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                      <input
                        type="text"
                        value={settings.payment.upiId}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, upiId: e.target.value },
                          })
                        }
                        placeholder="username@upi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all font-bold"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-4 h-4" />}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // VIEW MODE
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FiCreditCard className="w-5 h-5 text-emerald-600" />
                        Bank Account Details
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Account Holder</label>
                      <p className="text-lg font-medium text-gray-900">{settings.payment.accountHolderName || "Not set"}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bank Name</label>
                      <p className="text-lg font-medium text-gray-900">{settings.payment.bankName || "Not set"}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Account Number</label>
                      <p className="text-lg font-medium text-gray-900 font-mono">
                        {settings.payment.accountNumber
                          ? `••••${settings.payment.accountNumber.slice(-4)}`
                          : "Not set"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">IFSC Code</label>
                      <p className="text-lg font-medium text-gray-900 font-mono">{settings.payment.ifscCode || "Not set"}</p>
                    </div>

                    <div className="md:col-span-2 pt-4 border-t border-gray-200">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">UPI ID</label>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded border border-gray-200">
                          <span className="font-mono text-emerald-600 font-medium">{settings.payment.upiId || "Not set"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPasswordData({ ...passwordData, newPassword: val });
                          setPasswordStrength({
                            hasLowercase: /[a-z]/.test(val),
                            hasUppercase: /[A-Z]/.test(val),
                            hasNumber: /\d/.test(val),
                            hasSpecial: /[@$!%*?&]/.test(val),
                            hasMinLength: val.length >= 6,
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                      {passwordData.newPassword && (
                        <div className="mt-2 space-y-1">
                          <PasswordStrengthIndicator
                            label="Lowercase letter"
                            isValid={passwordStrength.hasLowercase}
                          />
                          <PasswordStrengthIndicator
                            label="Uppercase letter"
                            isValid={passwordStrength.hasUppercase}
                          />
                          <PasswordStrengthIndicator
                            label="Number"
                            isValid={passwordStrength.hasNumber}
                          />
                          <PasswordStrengthIndicator
                            label="Special character (@$!%*?&)"
                            isValid={passwordStrength.hasSpecial}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                      {passwordData.confirmPassword && (
                        <div className="mt-2">
                          <PasswordStrengthIndicator
                            label="Passwords match"
                            isValid={passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== ""}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleUpdatePassword}
                    disabled={saving}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all font-bold disabled:opacity-50"
                  >
                    {saving ? <LoadingSpinner size="sm" color="white" /> : "Update Password"}
                  </button>
                </div>



                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="font-medium text-red-800">Deactivate Account</p>
                    <p className="text-sm text-red-600 mb-4">Once deactivated, your account and all data will be permanently deleted.</p>
                    <button
                      onClick={() => setShowDeactivateModal(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Deactivate Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* OTP Modal */}
          {showOtpModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl transform transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Verify New Email</h3>
                <p className="text-sm text-gray-600 mb-5">
                  We sent a verification code to <span className="font-semibold text-emerald-600">{pendingEmail}</span>.
                  Please enter the code below.
                </p>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-2 text-center text-xl tracking-[0.5em] font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:tracking-normal placeholder:text-gray-300"
                      maxLength={6}
                    />
                  </div>

                  {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                  <button
                    onClick={handleVerifyEmailUpdate}
                    disabled={verifyingOtp || otp.length !== 6}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {verifyingOtp ? <LoadingSpinner size="sm" color="white" /> : "Verify & Update Email"}
                  </button>

                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="w-full py-1.5 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => sendOtp(pendingEmail)}
                      disabled={otpTimer > 0}
                      className="text-xs text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 font-medium"
                    >
                      {otpTimer > 0 ? `Resend code in ${otpTimer}s` : "Resend code"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Deactivation Modal */}
          {showDeactivateModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl transform transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Deactivate Account</h3>
                <p className="text-sm text-gray-600 mb-5">
                  Wait! This action is <span className="font-semibold text-red-600">permanent</span>. All your data, products, and bookings will be deleted.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Type <span className="font-bold text-gray-700 select-none">delete</span> to confirm</p>
                    <input
                      type="text"
                      value={confirmDeleteText}
                      onChange={(e) => setConfirmDeleteText(e.target.value)}
                      placeholder="Type delete"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeactivateModal(false);
                        setConfirmDeleteText("");
                      }}
                      className="flex-1 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeactivateAccount}
                      disabled={deactivating || confirmDeleteText.toLowerCase() !== 'delete'}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      {deactivating ? <LoadingSpinner size="sm" color="white" /> : "Deactivate"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}

function PasswordStrengthIndicator({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${isValid ? "bg-green-500" : "bg-gray-300"
          }`}
      >
        {isValid && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span className={`text-xs transition-colors duration-300 ${isValid ? "text-green-600 font-medium" : "text-gray-500"
        }`}>
        {label}
      </span>
    </div>
  );
}

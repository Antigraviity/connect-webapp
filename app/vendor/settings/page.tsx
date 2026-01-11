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
  FiTrash2,
  FiCrop,
  FiCamera,
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
  const [originalSettings, setOriginalSettings] = useState<VendorSettingsData | null>(null);

  // New Cropping State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
        setOriginalSettings(data.data);
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
      if (result.success) {
        // Refresh settings to ensure originalSettings and settings are in sync with server
        await fetchSettings();
      }
      return result.success;
    } catch (err) {
      console.error("Error saving settings:", err);
      return false;
    }
  };

  const handleCancel = () => {
    if (originalSettings) {
      setSettings(originalSettings);
    }
    setIsEditing(false);
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

  const handleDeleteImage = () => {
    if (window.confirm("Are you sure you want to delete your profile photo?")) {
      setSettings({
        ...settings,
        profile: { ...settings.profile, image: null },
      });
    }
  };

  // Handle profile image selection for cropping
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setIsCropModalOpen(true);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropSave = async () => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set desired output size (300x300 for profile picture)
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    const image = imageRef.current;
    const scale = size / 256; // Scale up from the 256px visual area

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(zoom * scale, zoom * scale);
    ctx.translate(pan.x / scale, pan.y / scale);
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
    ctx.restore();

    // Convert canvas to blob for upload
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setIsCropModalOpen(false);
      setUploading("profile");

      try {
        const formData = new FormData();
        formData.append("file", blob, "profile.jpg");
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
        setSelectedImage(null);
      }
    }, 'image/jpeg', 0.9);
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
        <LoadingSpinner size="lg" color="vendor" label="Loading..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account and preferences</p>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl">
        {successMessage && (
          <div className="p-4 mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-4 duration-300">
            <FiCheck className="w-5 h-5" />
            <span className="text-sm font-bold">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4 duration-300">
            <FiAlertCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Mobile Tabs */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 lg:p-4 sticky top-6">
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0 gap-1 lg:gap-2">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleCancel();
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal ${activeTab === tab.id
                      ? "bg-emerald-50 text-emerald-600 font-bold scale-[1.02]"
                      : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                      }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
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
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <div className="relative group">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-1 ring-emerald-100">
                        {settings.profile.image ? (
                          <img
                            src={settings.profile.image}
                            alt={settings.profile.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <span className="text-white text-4xl font-black uppercase tracking-tighter">
                            {getInitials(settings.profile.name || "V")}
                          </span>
                        )}
                      </div>
                      <label
                        className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-2xl border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer group-hover:scale-110 active:scale-90"
                        title="Upload New Photo"
                      >
                        <FiCamera className="w-5 h-5 text-emerald-600" />
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all active:scale-95"
                        >
                          {uploading === "profile" ? <LoadingSpinner size="sm" color="white" /> : "Upload Photo"}
                        </button>
                        {settings.profile.image && (
                          <button
                            onClick={handleDeleteImage}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100 active:scale-95"
                            title="Delete Photo"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest">JPG, PNG or GIF • Max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            profile: { ...settings.profile, name: e.target.value },
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              profile: { ...settings.profile, email: e.target.value },
                            })
                          }
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                      <div className="relative">
                        <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input
                          type="tel"
                          value={settings.profile.phone}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              profile: { ...settings.profile, phone: e.target.value.replace(/\D/g, "").slice(0, 10) },
                            })
                          }
                          maxLength={10}
                          placeholder="9876543210"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Website (Optional)</label>
                      <div className="relative">
                        <FiExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
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
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Bio / Description</label>
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
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 resize-none"
                    />
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{settings.profile.bio?.length || 0}/500 characters</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all font-black text-sm uppercase tracking-widest"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-5 h-5" />}
                      Save Profile
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold text-sm uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // VIEW MODE
                // VIEW MODE
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                    {/* Profile Photo View */}
                    <div className="relative group shrink-0">
                      {settings.profile.image ? (
                        <img
                          src={settings.profile.image}
                          alt={settings.profile.name}
                          className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl ring-1 ring-emerald-100 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl ring-1 ring-emerald-100">
                          <span className="text-white text-4xl font-black uppercase tracking-tighter">
                            {getInitials(settings.profile.name || "V")}
                          </span>
                        </div>
                      )}
                      {settings.profile.verified && (
                        <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg" title="Verified Vendor">
                          <FiCheck className="w-5 h-5 font-black" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                          <p className="text-base font-bold text-gray-900">{settings.profile.name || "Not set"}</p>
                        </div>

                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Username</label>
                          <p className="text-base font-bold text-gray-900">{settings.profile.email?.split("@")[0] || "Not set"}</p>
                        </div>

                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-emerald-600">Email Address</label>
                          <p className="text-base font-bold text-gray-900 truncate">{settings.profile.email}</p>
                        </div>

                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-emerald-600">Phone Number</label>
                          <p className="text-base font-bold text-gray-900">{settings.profile.phone || "Not set"}</p>
                        </div>
                      </div>

                      {settings.profile.website && (
                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-blue-600">Website</label>
                          <a href={settings.profile.website} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-blue-600 hover:underline flex items-center gap-2">
                            {settings.profile.website} <FiExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Bio / Description</label>
                    <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-line">
                      {settings.profile.bio || <span className="text-gray-400 italic">No bio description added yet.</span>}
                    </p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Business Name</label>
                      <input
                        type="text"
                        value={settings.business.businessName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: { ...settings.business, businessName: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Business Type</label>
                      <select
                        value={settings.business.businessType}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: { ...settings.business, businessType: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem]"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                      >
                        <option value="Individual">Individual</option>
                        <option value="Company">Company</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Proprietorship">Proprietorship</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Service/Product Type</label>
                      <select
                        value={settings.business.serviceType}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            business: { ...settings.business, serviceType: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900 appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem]"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                      >
                        <option value="Service">Service</option>
                        <option value="Product">Product</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">GST Number (Optional)</label>
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
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">PAN Number</label>
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
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-4">
                    <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-xs font-bold leading-relaxed">
                      NOTE: Business documents are required for verification. Upload them in the Service Details section.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all font-black text-sm uppercase tracking-widest"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-5 h-5" />}
                      Save Business Info
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold text-sm uppercase tracking-widest"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Service Category</label>
                      <input
                        type="text"
                        value={settings.serviceDetails.serviceCategory || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            serviceDetails: { ...settings.serviceDetails, serviceCategory: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                      <p className="text-[10px] font-bold text-gray-400 mt-2 px-1 uppercase tracking-widest italic">Category selected during registration</p>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Service Name</label>
                      <input
                        type="text"
                        value={settings.serviceDetails.serviceName || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            serviceDetails: { ...settings.serviceDetails, serviceName: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                      <p className="text-[10px] font-bold text-gray-400 mt-2 px-1 uppercase tracking-widest italic">Service selected during registration</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                      Business Documents
                    </h3>

                    {/* Document Upload Card */}
                    <div className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Document Type</p>
                          <p className="text-base font-bold text-gray-900">GST Certificate</p>
                        </div>

                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(settings.documents.businessDocStatus)}`}>
                            {settings.documents.businessDocStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <input
                          type="file"
                          onChange={(e) => handleDocumentUpload(e, "businessDoc")}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          id="businessDoc"
                        />
                        <label
                          htmlFor="businessDoc"
                          className="flex items-center gap-3 px-6 py-2.5 bg-white border border-gray-100 text-emerald-600 rounded-xl text-sm font-bold cursor-pointer hover:bg-emerald-50 transition-all active:scale-95"
                        >
                          {uploading === "businessDoc" ? (
                            <LoadingSpinner size="sm" color="vendor" />
                          ) : (
                            <FiUpload className="w-4 h-4" />
                          )}
                          {settings.documents.businessDoc ? "Replace Document" : "Upload Document"}
                        </label>
                        {settings.documents.businessDoc && (
                          <a
                            href={settings.documents.businessDoc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-2.5 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all active:scale-95"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            View
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-widest italic px-1">PDF, JPG, PNG • Max 5MB</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all font-black text-sm uppercase tracking-widest"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-5 h-5" />}
                      Save Service Details
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold text-sm uppercase tracking-widest"
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
                        <p className="text-lg font-medium text-gray-900">{settings.serviceDetails.serviceCategory || <span className="text-gray-400 italic">Not provided</span>}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Name</label>
                        <p className="text-lg font-medium text-gray-900">{settings.serviceDetails.serviceName || <span className="text-gray-400 italic">Not provided</span>}</p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Street Address</label>
                      <input
                        type="text"
                        value={settings.location.address}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            location: { ...settings.location, address: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">City</label>
                      <input
                        type="text"
                        value={settings.location.city}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            location: { ...settings.location, city: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">State</label>
                      <input
                        type="text"
                        value={settings.location.state}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            location: { ...settings.location, state: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Pincode</label>
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
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Country</label>
                      <input
                        type="text"
                        value={settings.location.country}
                        disabled
                        className="w-full px-5 py-3.5 bg-gray-100 border-none rounded-2xl text-gray-400 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Service Radius (km)</label>
                      <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
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
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="shrink-0 text-center px-6 py-2 bg-emerald-600 text-white font-black rounded-2xl">
                          {settings.location.serviceRadius} km
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-3 px-1 uppercase tracking-widest italic">Maximum distance you are willing to travel for service</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all font-black text-sm uppercase tracking-widest"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-5 h-5" />}
                      Save Location
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold text-sm uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // VIEW MODE
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FiMapPin className="text-emerald-500 w-4 h-4" />
                        Service Address
                      </label>
                      <p className="text-lg font-bold text-gray-900 leading-relaxed">
                        {settings.location.address ? (
                          <>
                            {settings.location.address}<br />
                            <span className="text-gray-400">{settings.location.city}, {settings.location.state} - {settings.location.pincode}</span><br />
                            <span className="text-emerald-600 text-sm">{settings.location.country}</span>
                          </>
                        ) : (
                          <span className="text-gray-300 italic">No address set</span>
                        )}
                      </p>
                    </div>

                    <div className="sm:col-span-2 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Service Radius</label>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                          <FiMapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-gray-900 tracking-tighter">{settings.location.serviceRadius} KM</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Maximum travel coverage</p>
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

              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    Email Notifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "emailOrders", label: "New Orders", desc: "Order placement alerts" },
                      { key: "emailMessages", label: "Messages", desc: "Customer inquiry alerts" },
                      { key: "emailReviews", label: "Reviews", desc: "New feedback alerts" },
                      { key: "emailPromotions", label: "Promotions", desc: "Offers & marketing" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-3xl transition-all hover:bg-emerald-50/30 group">
                        <div className="min-w-0 pr-4">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{item.label}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    SMS & Push Alerts
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "smsOrders", label: "SMS Alerts", desc: "Instant mobile updates" },
                      { key: "pushOrders", label: "Push Alerts", desc: "Real-time app alerts" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-3xl transition-all hover:bg-emerald-50/30 group">
                        <div className="min-w-0 pr-4">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{item.label}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-gray-50">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all font-black text-sm uppercase tracking-widest"
                >
                  {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-5 h-5" />}
                  Save Preferences
                </button>
              </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={settings.payment.accountHolderName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, accountHolderName: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Bank Name</label>
                      <input
                        type="text"
                        value={settings.payment.bankName}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, bankName: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Account Number</label>
                      <input
                        type="text"
                        value={settings.payment.accountNumber}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, accountNumber: e.target.value },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">IFSC Code</label>
                      <input
                        type="text"
                        value={settings.payment.ifscCode}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, ifscCode: e.target.value.toUpperCase() },
                          })
                        }
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono font-bold text-gray-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">UPI ID</label>
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
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono font-bold text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all font-black text-sm uppercase tracking-widest"
                    >
                      {saving ? <LoadingSpinner size="sm" color="current" /> : <FiSave className="w-5 h-5" />}
                      Save Payment Info
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold text-sm uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // VIEW MODE
                <div className="space-y-8">
                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <FiCreditCard className="w-5 h-5 text-emerald-600" />
                      Bank Account Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Holder</label>
                        <p className="text-base font-bold text-gray-900">{settings.payment.accountHolderName || "Not set"}</p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bank Name</label>
                        <p className="text-base font-bold text-gray-900">{settings.payment.bankName || "Not set"}</p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Number</label>
                        <p className="text-base font-bold text-gray-900 font-mono tracking-wider">
                          {settings.payment.accountNumber
                            ? `••••${settings.payment.accountNumber.slice(-4)}`
                            : "Not set"}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">IFSC Code</label>
                        <p className="text-base font-bold text-gray-900 font-mono">{settings.payment.ifscCode || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">UPI ID</label>
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <span className="font-mono text-emerald-600 font-black tracking-wider uppercase text-lg">{settings.payment.upiId || "Not set"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-gray-900">Account Security</h2>
                <p className="text-gray-600">Protect your account with a strong password</p>
              </div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    Change Password
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">New Password</label>
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
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                      {passwordData.newPassword && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
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
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900"
                      />
                      {passwordData.confirmPassword && (
                        <div className="mt-4">
                          <PasswordStrengthIndicator
                            label="Passwords match"
                            isValid={passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== ""}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all font-black text-sm uppercase tracking-widest"
                    >
                      {saving ? <LoadingSpinner size="sm" color="vendor" /> : <FiLock className="w-5 h-5" />}
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="border-t border-red-50 pt-12">
                  <h3 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                    Danger Zone
                  </h3>
                  <div className="p-6 border border-red-100 rounded-3xl bg-red-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <p className="text-sm font-black text-red-900 uppercase tracking-widest">Deactivate Account</p>
                      <p className="text-xs font-bold text-red-600/60 uppercase tracking-widest mt-1">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={() => setShowDeactivateModal(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 active:scale-95"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isCropModalOpen && selectedImage && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiCrop className="text-emerald-500" />
                    Adjust Profile Picture
                  </h3>
                  <button
                    onClick={() => {
                      setIsCropModalOpen(false);
                      setSelectedImage(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden select-none">
                  <div
                    className="w-64 h-64 rounded-full border-4 border-white shadow-2xl overflow-hidden relative flex items-center justify-center active:cursor-grabbing cursor-grab"
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <img
                      ref={imageRef}
                      src={selectedImage}
                      alt="Crop Preview"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                      }}
                      className="max-w-none max-h-none pointer-events-none select-none"
                      draggable={false}
                    />
                    <div className="absolute inset-0 border-[40px] border-black/10 pointer-events-none rounded-full" />
                  </div>

                  <div className="mt-8 w-full max-w-xs">
                    <div className="flex items-center justify-between mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.01"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <p className="mt-4 text-xs text-gray-400 font-medium">Drag the image to reposition</p>
                </div>

                <div className="p-6 bg-white border-t border-gray-100 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setIsCropModalOpen(false);
                      setSelectedImage(null);
                    }}
                    className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropSave}
                    className="px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                  >
                    Set
                  </button>
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
                      className="w-full px-4 py-2 text-center text-xl tracking-[0.5em] font-bold border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:tracking-normal placeholder:text-gray-300"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm font-medium"
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

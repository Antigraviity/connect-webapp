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
  FiLoader,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiExternalLink,
} from "react-icons/fi";

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

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    let success = false;

    try {
      switch (activeTab) {
        case "profile":
          success = await saveSection("profile", {
            name: settings.profile.name,
            phone: settings.profile.phone,
            bio: settings.profile.bio,
            image: settings.profile.image,
            website: settings.profile.website,
            ...settings.socialMedia,
          });
          // Update localStorage
          if (success) {
            const userData = localStorage.getItem("user");
            if (userData) {
              const user = JSON.parse(userData);
              user.name = settings.profile.name;
              user.image = settings.profile.image;
              localStorage.setItem("user", JSON.stringify(user));
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
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin text-[#0053B0] mx-auto mb-3" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-[#0053B0]"
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
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>

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
                    <div className="w-24 h-24 bg-gradient-to-br from-[#0053B0] to-blue-600 rounded-full flex items-center justify-center border-4 border-gray-100">
                      <span className="text-white text-3xl font-bold">
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
                    className="flex items-center gap-2 px-4 py-2 bg-[#0053B0] text-white rounded-lg text-sm hover:bg-[#003d85] disabled:opacity-50"
                  >
                    {uploading === "profile" ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={settings.profile.email?.split("@")[0] || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉</span>
                    <input
                      type="email"
                      value={settings.profile.email}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      disabled
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{settings.profile.bio?.length || 0}/500 characters</p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85] disabled:opacity-50"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}

          {/* Business Info Tab */}
          {activeTab === "business" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Business documents are required for verification. Upload them in the Service Details section.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85] disabled:opacity-50"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}

          {/* Service Details Tab */}
          {activeTab === "serviceDetails" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Service Details</h2>
              <p className="text-gray-600">Information collected during registration</p>

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
                      className="flex items-center gap-2 px-4 py-2 bg-[#0053B0] text-white rounded-lg text-sm cursor-pointer hover:bg-[#003d85]"
                    >
                      {uploading === "businessDoc" ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
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

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Info:</strong> To change your service category or service name, please contact support. These fields are locked to prevent accidental changes.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85] disabled:opacity-50"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === "location" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Service Location</h2>
              <p className="text-gray-600">This is where you provide your services</p>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={settings.location.country}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        location: { ...settings.location, country: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Radius (km)</label>
                  <input
                    type="number"
                    value={settings.location.serviceRadius}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        location: { ...settings.location, serviceRadius: parseInt(e.target.value) || 10 },
                      })
                    }
                    min={1}
                    max={100}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum distance you can travel to provide services</p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85] disabled:opacity-50"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Changes
              </button>
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
                className="flex items-center gap-2 px-6 py-3 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85] disabled:opacity-50"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Payment Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Account Details</h3>
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
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                        placeholder="1234567890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                        placeholder="SBIN0001234"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
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
                        placeholder="State Bank of India"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">UPI Details (Optional)</h3>
                  <div>
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
                      placeholder="yourname@paytm"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Payout Schedule:</strong> Earnings are transferred every Monday. Minimum payout amount is ₹500.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85] disabled:opacity-50"
              >
                {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Changes
              </button>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0053B0] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button className="mt-4 px-6 py-2 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85]">
                    Update Password
                  </button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Enable 2FA</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      Enable
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <p className="font-medium text-red-800">Deactivate Account</p>
                    <p className="text-sm text-red-600 mb-4">Once deactivated, your account and all data will be permanently deleted.</p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                      Deactivate Account
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

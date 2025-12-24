"use client";

import { useState } from "react";
import {
  FiUser,
  FiBell,
  FiLock,
  FiCreditCard,
  FiMapPin,
  FiSettings,
  FiSave,
  FiUpload,
  FiMail,
  FiPhone,
  FiGlobe,
  FiInstagram,
  FiFacebook,
  FiTwitter,
} from "react-icons/fi";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    // Basic Profile
    username: "johndoe123",
    businessName: "John's Services",
    ownerName: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
    website: "",
    description: "Professional service provider with 10+ years of experience",
    
    // Business Information
    businessType: "Individual", // Individual/Proprietorship/Partnership/LLP/Private Limited
    serviceType: "Service", // Service/Product/Both (from registration)
    category: "Home Services", // From registration Step 2
    serviceName: "Plumbing Services", // From registration Step 2
    gstNumber: "",
    panNumber: "",
    
    // Documents
    documentType: "GST Certificate", // From registration
    documentStatus: "Verified",
    documentUploadDate: "2024-01-15",
  });

  const [address, setAddress] = useState({
    street: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001", // Changed from zipCode to pincode
    country: "India",
    serviceRadius: 10, // Added from registration concept
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMessages: true,
    emailReviews: true,
    emailPromotions: false,
    smsOrders: true,
    smsReminders: true,
    pushOrders: true,
    pushMessages: true,
  });

  const [socialMedia, setSocialMedia] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "business", label: "Business Info", icon: FiSettings },
    { id: "services", label: "Service Details", icon: FiSettings },
    { id: "location", label: "Location", icon: FiMapPin },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "payment", label: "Payment", icon: FiCreditCard },
    { id: "security", label: "Security", icon: FiLock },
  ];

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-600"
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
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Profile Information
                  </h2>
                </div>

                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">JD</span>
                  </div>
                  <div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
                      <FiUpload className="w-4 h-4" />
                      Upload Photo
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({ ...profileData, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Username cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.ownerName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, ownerName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website (Optional)
                    </label>
                    <div className="relative">
                      <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) =>
                          setProfileData({ ...profileData, website: e.target.value })
                        }
                        placeholder="https://example.com"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Description
                  </label>
                  <textarea
                    value={profileData.description}
                    onChange={(e) =>
                      setProfileData({ ...profileData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Tell customers about your services..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profileData.description.length}/500 characters
                  </p>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Social Media Links
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <FiInstagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
                      <input
                        type="url"
                        value={socialMedia.instagram}
                        onChange={(e) =>
                          setSocialMedia({ ...socialMedia, instagram: e.target.value })
                        }
                        placeholder="Instagram profile URL"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="relative">
                      <FiFacebook className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                      <input
                        type="url"
                        value={socialMedia.facebook}
                        onChange={(e) =>
                          setSocialMedia({ ...socialMedia, facebook: e.target.value })
                        }
                        placeholder="Facebook page URL"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="relative">
                      <FiTwitter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                      <input
                        type="url"
                        value={socialMedia.twitter}
                        onChange={(e) =>
                          setSocialMedia({ ...socialMedia, twitter: e.target.value })
                        }
                        placeholder="Twitter profile URL"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Info Tab */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Business Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={profileData.businessName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select
                      value={profileData.businessType}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">LLP</option>
                      <option value="Private Limited">Private Limited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service/Product Type
                    </label>
                    <select
                      value={profileData.serviceType}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          serviceType: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Service">Service</option>
                      <option value="Product">Product</option>
                      <option value="Both">Both</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      From registration form
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={profileData.gstNumber}
                      onChange={(e) =>
                        setProfileData({ ...profileData, gstNumber: e.target.value })
                      }
                      placeholder="22AAAAA0000A1Z5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={profileData.panNumber}
                      onChange={(e) =>
                        setProfileData({ ...profileData, panNumber: e.target.value })
                      }
                      placeholder="ABCDE1234F"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Business documents are required for
                    verification. Upload them in the Documents section.
                  </p>
                </div>
              </div>
            )}

            {/* Service Details Tab - NEW */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Service Details
                  </h2>
                  <p className="text-sm text-gray-600">
                    Information collected during registration
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Category
                    </label>
                    <input
                      type="text"
                      value={profileData.category}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Category selected during registration
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={profileData.serviceName}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Service selected during registration
                    </p>
                  </div>
                </div>

                {/* Document Information */}
                <div className="mt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Business Documents
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Document Type
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {profileData.documentType || "Not uploaded"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Status
                        </label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          profileData.documentStatus === "Verified"
                            ? "bg-green-100 text-green-800"
                            : profileData.documentStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {profileData.documentStatus}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Upload Date
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {profileData.documentUploadDate}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
                        <FiUpload className="w-4 h-4" />
                        Re-upload Document
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Upload new version if needed (PDF, JPG, PNG - Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Info:</strong> To change your service category or service name, 
                    please contact support. These fields are locked to prevent accidental changes.
                  </p>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === "location" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Service Location
                  </h2>
                  <p className="text-sm text-gray-600">
                    This is where you provide your services
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) =>
                          setAddress({ ...address, state: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={address.pincode}
                        onChange={(e) =>
                          setAddress({ ...address, pincode: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        maxLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={address.country}
                        onChange={(e) =>
                          setAddress({ ...address, country: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Radius (km)
                    </label>
                    <input
                      type="number"
                      defaultValue={10}
                      min={1}
                      max={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum distance you can travel to provide services
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: "emailOrders", label: "New orders and bookings" },
                        { key: "emailMessages", label: "New customer messages" },
                        { key: "emailReviews", label: "New reviews and ratings" },
                        { key: "emailPromotions", label: "Promotions and updates" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      SMS Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: "smsOrders", label: "Order confirmations" },
                        { key: "smsReminders", label: "Booking reminders" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: "pushOrders", label: "New orders" },
                        { key: "pushMessages", label: "New messages" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                          <span className="text-sm text-gray-700">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) =>
                              setNotifications({
                                ...notifications,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Payment Settings
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Bank Account */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      Bank Account Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number
                          </label>
                          <input
                            type="text"
                            placeholder="1234567890"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            IFSC Code
                          </label>
                          <input
                            type="text"
                            placeholder="SBIN0001234"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          placeholder="State Bank of India"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* UPI */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      UPI Details (Optional)
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@paytm"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Payout Schedule:</strong> Earnings are transferred
                      every Monday. Minimum payout amount is ₹500.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Security Settings
                  </h2>
                </div>

                {/* Change Password */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Enable 2FA</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Deactivation */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">
                    Danger Zone
                  </h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-medium text-red-900">Deactivate Account</p>
                    <p className="text-sm text-red-700 mt-1">
                      Temporarily disable your vendor account
                    </p>
                    <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                      Deactivate Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
              >
                <FiSave className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

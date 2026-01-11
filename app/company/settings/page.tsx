"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { toast } from "react-hot-toast";
import {
  FiSave,
  FiUpload,
  FiUser,
  FiBell,
  FiChevronRight,
  FiEdit2,
  FiBriefcase,
  FiMapPin,
  FiLock,
  FiMail,
  FiPhone,
  FiGlobe,
  FiLinkedin,
  FiCheck,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiCamera,
  FiX,
  FiTrash2,
  FiCrop
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [securityView, setSecurityView] = useState("overview");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [deactivateConfirm, setDeactivateConfirm] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
  });

  // Image upload states
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [zoom, setZoom] = useState(1.25);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    username: "",
    industry: "Information Technology",
    companySize: "100-500",
    website: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    description: "",
    image: "",
    preferences: {
      newApps: true,
      messages: true,
      interviews: true,
    }
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/company/profile?employerId=${user?.id}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setCompanyInfo({
          name: data.name || "",
          username: data.username || user?.email?.split('@')[0] || "",
          industry: data.industry || "Information Technology",
          companySize: data.companySize || "100-500",
          website: data.website || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          linkedin: data.linkedin || "",
          description: data.bio || "",
          image: data.image || "",
          preferences: data.preferences || {
            newApps: true,
            messages: true,
            interviews: true,
          }
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const response = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employerId: user.id,
          name: companyInfo.name,
          phone: companyInfo.phone,
          bio: companyInfo.description,
          address: companyInfo.address,
          industry: companyInfo.industry,
          companySize: companyInfo.companySize,
          linkedin: companyInfo.linkedin,
          website: companyInfo.website,
          image: companyInfo.image,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Settings updated successfully");
        setIsEditing(false);
      } else {
        toast.error(result.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setCompanyInfo({ ...companyInfo, [name]: value });
  };

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!user?.id) return;

    const newPreferences = {
      ...(companyInfo.preferences as any || {}),
      [key]: value,
    };

    setCompanyInfo({
      ...companyInfo,
      preferences: newPreferences
    });

    try {
      const response = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employerId: user.id,
          preferences: newPreferences,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        toast.error("Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("An error occurred while saving preferences");
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("All fields are required");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const isStrengthValid =
      passwordStrength.hasLowercase &&
      passwordStrength.hasUppercase &&
      passwordStrength.hasNumber &&
      passwordStrength.hasSpecial &&
      passwordStrength.hasMinLength;

    if (!isStrengthValid) {
      toast.error("New password does not meet strength requirements");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password updated successfully");
        setPasswords({ current: "", new: "", confirm: "" });
        setPasswordStrength({
          hasLowercase: false,
          hasUppercase: false,
          hasNumber: false,
          hasSpecial: false,
          hasMinLength: false,
        });
        setSecurityView("overview");
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (deactivateConfirm !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/users/deactivate?userId=${user?.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Account deactivated");
        window.location.href = "/";
      } else {
        toast.error(result.message || "Failed to deactivate account");
      }
    } catch (error) {
      console.error("Deactivation error:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };


  // Image upload handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmUpload = () => {
    if (tempImage) {
      setCompanyInfo(prev => ({ ...prev, image: tempImage }));
      setTempImage(null);
      setZoom(1.25);
      setImageOffset({ x: 0, y: 0 });
    }
  };

  const handleCancelUpload = () => {
    setTempImage(null);
    setZoom(1.25);
    setImageOffset({ x: 0, y: 0 });
  };

  const handleDeleteImage = () => {
    setCompanyInfo(prev => ({ ...prev, image: "" }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - imageOffset.x, y: e.clientY - imageOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setImageOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "security", label: "Security", icon: FiLock },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Desktop Sticky, Mobile Horizontal Scroll */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-3 sticky top-24 overflow-x-auto no-scrollbar">
            <nav className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                      setSecurityView("overview");
                    }}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 group lg:w-full ${active
                      ? "bg-company-50 text-company-600 shadow-sm ring-1 ring-company-100"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${active ? "text-company-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-8 min-h-[500px]">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Profile Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-company-600 px-3 py-1.5 bg-company-50 rounded-lg text-xs font-bold hover:bg-company-100 transition-all active:scale-95"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                    <LoadingSpinner size="lg" color="company" className="mb-4" />
                    <p className="text-gray-500 font-medium">Loading your profile info...</p>
                  </div>
                ) : isEditing ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 border-b border-gray-50 text-center sm:text-left">
                      <div className="relative group">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl sm:rounded-3xl flex items-center justify-center border-4 border-white shadow-md overflow-hidden ring-1 ring-gray-100">
                          {tempImage ? (
                            <img src={tempImage} alt="Preview" className="w-full h-full object-cover opacity-60" />
                          ) : companyInfo.image ? (
                            <img src={companyInfo.image} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-company-600 font-bold text-2xl sm:text-3xl">
                              {companyInfo.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "TC"}
                            </span>
                          )}

                          {!tempImage && (
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                              <FiCamera className="text-white w-6 h-6" />
                              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                          )}
                        </div>

                        {companyInfo.image && !tempImage && (
                          <div className="absolute -bottom-1 -right-1 flex gap-1 items-center z-20">
                            <button
                              onClick={() => {
                                setTempImage(companyInfo.image);
                                setIsCropping(true);
                              }}
                              className="p-1.5 bg-white rounded-xl shadow-md border-2 border-white text-gray-700 hover:text-company-600 transition-all active:scale-90"
                              title="Crop Image"
                            >
                              <FiCrop className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleDeleteImage}
                              className="p-1.5 bg-red-500 text-white rounded-xl shadow-md border-2 border-white hover:bg-red-600 transition-all active:scale-90"
                              title="Delete Image"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base sm:text-lg">Company Logo</h4>
                        <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider">Update your company's visual identity</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={companyInfo.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={companyInfo.username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={companyInfo.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={companyInfo.phone}
                          onChange={handleInputChange}
                          maxLength={10}
                          className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Website</label>
                        <input
                          type="url"
                          name="website"
                          value={companyInfo.website}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">LinkedIn Profile</label>
                        <input
                          type="url"
                          name="linkedin"
                          value={companyInfo.linkedin}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Industry</label>
                        <select
                          name="industry"
                          value={companyInfo.industry}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30 cursor-pointer appearance-none"
                        >
                          <option>Information Technology</option>
                          <option>Healthcare</option>
                          <option>Finance</option>
                          <option>Education</option>
                          <option>Manufacturing</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Company Size</label>
                        <select
                          name="companySize"
                          value={companyInfo.companySize}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30 cursor-pointer appearance-none"
                        >
                          <option>1-10</option>
                          <option>11-50</option>
                          <option>51-100</option>
                          <option>100-500</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 ml-1">Full Address</label>
                      <input
                        type="text"
                        name="address"
                        value={companyInfo.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 sm:py-2.5 border border-gray-100 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all bg-gray-50/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 ml-1">Bio / Description</label>
                      <textarea
                        name="description"
                        value={companyInfo.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-company-500 outline-none text-sm font-medium resize-none transition-all bg-gray-50/30"
                      />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 bg-gray-50 -mx-5 -mb-5 sm:-mx-8 sm:-mb-8 p-5 rounded-b-2xl sm:rounded-b-3xl border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfile(); // Revert changes including image
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-2.5 bg-company-600 text-white font-bold rounded-xl hover:bg-company-700 shadow-md shadow-company-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        {saving ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode (Compact Card Style) */
                  <div className="border border-gray-100 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 bg-gray-50/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-company-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-12 relative z-10">
                      {/* Left: Avatar/Logo */}
                      <div className="relative flex-shrink-0">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center shadow-md border border-white overflow-hidden ring-1 ring-gray-100">
                          {companyInfo.image ? (
                            <img src={companyInfo.image} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-company-600 font-bold text-3xl sm:text-4xl">
                              {companyInfo.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "TC"}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg sm:rounded-xl border-2 sm:border-[3px] border-white flex items-center justify-center shadow-sm">
                          <FiCheck className="text-white w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                        </div>
                      </div>

                      {/* Right: Info Grid */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-12 text-center sm:text-left">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Full Name</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{companyInfo.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Username</p>
                          <p className="text-base sm:text-lg font-bold text-company-600 leading-tight">@{companyInfo.username}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Email Address</p>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <FiMail className="text-gray-400 w-3.5 h-3.5" />
                            <p className="text-sm sm:text-lg font-bold text-gray-700 truncate">{companyInfo.email}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Phone Number</p>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <FiPhone className="text-gray-400 w-3.5 h-3.5" />
                            <p className="text-sm sm:text-lg font-bold text-gray-700">{companyInfo.phone || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Industry</p>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <FiBriefcase className="text-gray-400 w-3.5 h-3.5" />
                            <p className="text-sm sm:text-lg font-bold text-gray-700">{companyInfo.industry}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Company Size</p>
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <FiUser className="text-gray-400 w-3.5 h-3.5" />
                            <p className="text-sm sm:text-lg font-bold text-gray-700">{companyInfo.companySize} employees</p>
                          </div>
                        </div>
                        <div className="space-y-1 md:col-span-2 pt-4 border-t border-gray-100">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Bio / Description</p>
                          <p className="text-sm sm:text-base font-medium text-gray-600 leading-relaxed italic">
                            {companyInfo.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="pb-4 border-b border-gray-50">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">Control your communication and alert preferences</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {[
                    { id: "newApps", label: "New Applications", desc: "Instantly get notified when a candidate applies to your job posts" },
                    { id: "messages", label: "Direct Messages", desc: "Receive real-time alerts for new messages from potential hires" },
                    { id: "interviews", label: "Interview Reminders", desc: "Automated schedule reminders for your upcoming interviews" },
                  ].map((pref) => (
                    <label key={pref.id} className="flex items-center justify-between p-4 sm:p-6 rounded-2xl border border-gray-100 hover:bg-gray-50/50 hover:border-company-100 transition-all cursor-pointer group">
                      <div className="space-y-0.5 sm:space-y-1 pr-4">
                        <p className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-company-700 transition-colors">{pref.label}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 max-w-md">{pref.desc}</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={(companyInfo.preferences as any)?.[pref.id] ?? true}
                          onChange={(e) => handlePreferenceChange(pref.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-company-600"></div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="pb-4 border-b border-gray-50">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Security & Access</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">Keep your account secure by managing passwords and access</p>
                </div>
                {securityView === "overview" ? (
                  <div className="max-w-md space-y-3 sm:space-y-4">
                    <div
                      onClick={() => setSecurityView("change-password")}
                      className="p-4 sm:p-6 border border-gray-100 rounded-2xl bg-gray-50/30 group cursor-pointer hover:border-company-100 hover:bg-white transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:text-company-600 transition-colors">
                            <FiLock className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm sm:text-base text-gray-900">Change Password</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Update your account password regularly</p>
                          </div>
                        </div>
                        <FiChevronRight className="text-gray-300 group-hover:text-company-500 transition-colors w-4.5 h-4.5 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    <div
                      onClick={() => setSecurityView("deactivate")}
                      className="p-4 sm:p-6 border border-red-100 bg-red-50/50 rounded-2xl group cursor-pointer hover:bg-red-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-red-100">
                            <FiAlertCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-red-500" />
                          </div>
                          <div>
                            <p className="font-bold text-sm sm:text-base text-red-600">Deactivate Account</p>
                            <p className="text-[10px] sm:text-xs text-red-500/60">Permanently delete your company account</p>
                          </div>
                        </div>
                        <FiChevronRight className="text-red-300 w-4.5 h-4.5 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </div>
                ) : securityView === "change-password" ? (
                  <div className="max-w-md space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 text-gray-400 mb-4 hover:text-gray-600 cursor-pointer w-fit" onClick={() => setSecurityView("overview")}>
                      <FiChevronRight className="rotate-180" />
                      <span className="text-sm font-medium">Back to Security</span>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Current Password</label>
                        <input
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">New Password</label>
                        <input
                          type="password"
                          value={passwords.new}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPasswords({ ...passwords, new: val });
                            setPasswordStrength({
                              hasLowercase: /[a-z]/.test(val),
                              hasUppercase: /[A-Z]/.test(val),
                              hasNumber: /\d/.test(val),
                              hasSpecial: /[@$!%*?&]/.test(val),
                              hasMinLength: val.length >= 6,
                            });
                          }}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-company-500 outline-none text-sm font-medium transition-all"
                        />
                        {passwords.new && (
                          <div className="mt-3 space-y-1.5 px-1">
                            <PasswordStrengthIndicator
                              label="At least 6 characters"
                              isValid={passwordStrength.hasMinLength}
                            />
                            <PasswordStrengthIndicator
                              label="One lowercase letter"
                              isValid={passwordStrength.hasLowercase}
                            />
                            <PasswordStrengthIndicator
                              label="One uppercase letter"
                              isValid={passwordStrength.hasUppercase}
                            />
                            <PasswordStrengthIndicator
                              label="One number"
                              isValid={passwordStrength.hasNumber}
                            />
                            <PasswordStrengthIndicator
                              label="One special character (@$!%*?&)"
                              isValid={passwordStrength.hasSpecial}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 ml-1">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className={`w-full px-4 py-2.5 border rounded-xl outline-none text-sm font-medium transition-all ${passwords.confirm
                              ? passwords.new === passwords.confirm
                                ? "border-green-200 focus:border-green-500 bg-green-50/10"
                                : "border-red-200 focus:border-red-500 bg-red-50/10"
                              : "border-gray-200 focus:border-company-500"
                              }`}
                          />
                          {passwords.confirm && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {passwords.new === passwords.confirm ? (
                                <FiCheckCircle className="text-green-500 w-4 h-4" />
                              ) : (
                                <FiXCircle className="text-red-500 w-4 h-4" />
                              )}
                            </div>
                          )}
                        </div>
                        {passwords.confirm && (
                          <div className="mt-3 px-1">
                            <PasswordStrengthIndicator
                              label="Passwords match"
                              isValid={passwords.new === passwords.confirm && passwords.confirm !== ""}
                            />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="w-full py-3 bg-company-600 text-white font-bold rounded-xl hover:bg-company-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {saving ? <LoadingSpinner size="sm" color="white" /> : <FiSave />}
                        Update Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 text-gray-400 mb-4 hover:text-gray-600 cursor-pointer w-fit" onClick={() => setSecurityView("overview")}>
                      <FiChevronRight className="rotate-180" />
                      <span className="text-sm font-medium">Back to Security</span>
                    </div>
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                      <div className="flex items-center gap-3 text-red-600">
                        <FiAlertCircle className="w-6 h-6" />
                        <h3 className="font-bold">Are you absolutely sure?</h3>
                      </div>
                      <p className="text-sm text-red-700/80 leading-relaxed">
                        This action is permanent and cannot be undone. All your job posts, applications, and company data will be permanently deleted.
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-red-800">Please type <span className="underline">DELETE</span> to confirm</p>
                        <input
                          type="text"
                          value={deactivateConfirm}
                          onChange={(e) => setDeactivateConfirm(e.target.value)}
                          placeholder="Type DELETE"
                          className="w-full px-4 py-2.5 border-2 border-red-200 rounded-xl focus:border-red-500 outline-none text-sm font-bold transition-all uppercase"
                        />
                      </div>
                      <button
                        onClick={handleDeactivate}
                        disabled={saving || deactivateConfirm !== "DELETE"}
                        className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {saving ? <LoadingSpinner size="sm" color="white" /> : null}
                        Permanently Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {
        isCropping && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiCrop className="text-company-500" />
                  Adjust Profile Picture
                </h3>
                <button
                  onClick={() => {
                    setIsCropping(false);
                    handleCancelUpload();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 bg-gray-50 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden select-none">
                <div
                  className="w-64 h-64 rounded-full border-4 border-white shadow-2xl overflow-hidden relative active:cursor-grabbing cursor-grab"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {(tempImage || companyInfo.image) && (
                    <img
                      src={tempImage || companyInfo.image}
                      alt="To crop"
                      className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                      style={{
                        transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${zoom})`,
                      }}
                    />
                  )}
                  {/* Circular Mask Overlay */}
                  <div className="absolute inset-0 border-[40px] border-black/10 pointer-events-none rounded-full" />
                </div>

                <div className="mt-8 w-full max-w-xs">
                  <div className="flex items-center justify-between mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Zoom</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-company-500"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                  />
                </div>

                <p className="mt-4 text-xs text-gray-400 font-medium">Drag the image to reposition</p>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsCropping(false);
                    handleCancelUpload();
                  }}
                  className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (tempImage) {
                      handleConfirmUpload();
                    }
                    setIsCropping(false);
                  }}
                  className="px-8 py-2.5 bg-company-600 text-white font-bold rounded-xl hover:bg-company-700 transition-all"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

function PasswordStrengthIndicator({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${isValid ? "bg-green-500 scale-110" : "bg-gray-200"
          }`}
      >
        {isValid && (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${isValid ? "text-green-600" : "text-gray-400"
        }`}>
        {label}
      </span>
    </div>
  );
}

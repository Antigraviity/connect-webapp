"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useTab } from "../layout"; // Import tab context
import {
  FiUser,
  FiBriefcase,
  FiTarget,
  FiAward,
  FiGlobe,
  FiLinkedin,
  FiGithub,
  FiMapPin,
  FiClock,
  FiMessageSquare,
  FiShield,
  FiSettings,
  FiInfo,
  FiTarget as FiTargetIcon,
  FiDollarSign,
  FiFileText,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiEdit,
  FiPlus,
  FiSave,
  FiLoader,
  FiEdit3,
  FiTrash2,
  FiPlusCircle,
  FiTruck,
  FiTag,
  FiPackage,
  FiBox,
  FiCalendar,
  FiAlertCircle,
  FiArrowLeft
} from "react-icons/fi";

const jobTypes = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REMOTE", label: "Remote" },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Actively looking for jobs", color: "green" },
  { value: "OPEN_TO_OFFERS", label: "Open to offers", color: "blue" },
  { value: "EMPLOYED", label: "Employed but open", color: "yellow" },
  { value: "NOT_LOOKING", label: "Not looking right now", color: "gray" },
];

const noticePeriods = [
  "Immediate",
  "1 Week",
  "2 Weeks",
  "1 Month",
  "2 Months",
  "3 Months",
];

const remotePreferences = [
  { value: "remote", label: "Remote Only" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site Only" },
  { value: "any", label: "Any (Flexible)" },
];

export default function JobSeekerProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { activeTab } = useTab(); // Get active tab
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Default to editing mode for new users

  // Note: This page is specifically for job seeker profiles.
  // For general settings, users should go to /buyer/settings

  // Form data
  const [formData, setFormData] = useState({
    headline: "",
    summary: "",
    currentRole: "",
    currentCompany: "",
    totalExperience: "",
    status: "AVAILABLE",
    noticePeriod: "",
    remotePreference: "any",
    expectedSalaryMin: "",
    expectedSalaryMax: "",
    salaryPeriod: "yearly",
    willingToRelocate: false,
    resume: "",
    portfolio: "",
    linkedIn: "",
    github: "",
    website: "",
    isPublic: true,
    showEmail: false,
    showPhone: false,
    showSalary: false,
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [preferredJobTypes, setPreferredJobTypes] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [isEditingService, setIsEditingService] = useState(false);
  const [isEditingBuyer, setIsEditingBuyer] = useState(false);

  // Service Profile State
  const [serviceAddress, setServiceAddress] = useState({
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001"
  });
  const [servicePreferences, setServicePreferences] = useState({
    weekdays: true,
    weekends: false
  });

  // Buyer Profile State
  const [deliveryInstructions, setDeliveryInstructions] = useState("Leave at front desk, code is 1234...");

  // Work Experience
  const [experiences, setExperiences] = useState<Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>>([]);

  // Education
  const [education, setEducation] = useState<Array<{
    degree: string;
    institution: string;
    year: string;
    field: string;
  }>>([]);

  // Multiple Addresses State
  const [shippingAddresses, setShippingAddresses] = useState<Array<{
    id: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    type: "home" | "work" | "other";
    isDefault: boolean;
  }>>([]);

  // Load addresses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedAddresses');
    if (saved) {
      try {
        setShippingAddresses(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved addresses:", e);
      }
    }
  }, []);

  // Save to localStorage whenever addresses change
  const saveAddresses = (addresses: any[]) => {
    localStorage.setItem('savedAddresses', JSON.stringify(addresses));
  };

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    type: "home" as const,
    isDefault: false,
  });

  const handleAddNewAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      // Basic validation could be improved
      return;
    }

    const updatedAddresses = [
      ...shippingAddresses,
      {
        ...newAddress,
        id: Date.now().toString(),
        isDefault: shippingAddresses.length === 0 || newAddress.isDefault,
      }
    ];

    setShippingAddresses(updatedAddresses);
    saveAddresses(updatedAddresses);

    // Reset form and view
    setNewAddress({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      type: "home",
      isDefault: false,
    });
    setIsAddingAddress(false);
  };

  const deleteAddress = (id: string) => {
    const updated = shippingAddresses.filter(addr => addr.id !== id);
    setShippingAddresses(updated);
    saveAddresses(updated);
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/job-seeker?userId=${user.id}`);
      const data = await response.json();

      if (data.success && data.profile) {
        setHasProfile(true);
        const profile = data.profile;

        setFormData({
          headline: profile.headline || "",
          summary: profile.summary || "",
          currentRole: profile.currentRole || "",
          currentCompany: profile.currentCompany || "",
          totalExperience: profile.totalExperience?.toString() || "",
          status: profile.status || "AVAILABLE",
          noticePeriod: profile.noticePeriod || "",
          remotePreference: profile.remotePreference || "any",
          expectedSalaryMin: profile.expectedSalaryMin?.toString() || "",
          expectedSalaryMax: profile.expectedSalaryMax?.toString() || "",
          salaryPeriod: profile.salaryPeriod || "yearly",
          willingToRelocate: profile.willingToRelocate || false,
          resume: profile.resume || "",
          portfolio: profile.portfolio || "",
          linkedIn: profile.linkedIn || "",
          github: profile.github || "",
          website: profile.website || "",
          isPublic: profile.isPublic ?? true,
          showEmail: profile.showEmail || false,
          showPhone: profile.showPhone || false,
          showSalary: profile.showSalary || false,
        });

        // Parse JSON fields
        if (profile.skills) {
          try { setSkills(JSON.parse(profile.skills)); } catch { setSkills([]); }
        }
        if (profile.tags) {
          try { setTags(JSON.parse(profile.tags)); } catch { setTags([]); }
        }
        if (profile.preferredJobTypes) {
          try { setPreferredJobTypes(JSON.parse(profile.preferredJobTypes)); } catch { setPreferredJobTypes([]); }
        }
        if (profile.preferredLocations) {
          try { setPreferredLocations(JSON.parse(profile.preferredLocations)); } catch { setPreferredLocations([]); }
        }
        if (profile.experience) {
          try { setExperiences(JSON.parse(profile.experience)); } catch { setExperiences([]); }
        }
        if (profile.education) {
          try { setEducation(JSON.parse(profile.education)); } catch { setEducation([]); }
        }
        setIsEditing(false); // Found a profile, show view mode first
      } else {
        setIsEditing(true); // No profile, stay in editing mode
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleAddTag = () => {
    const tag = newTag.trim().startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;
    if (tag.length > 1 && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !preferredLocations.includes(newLocation.trim())) {
      setPreferredLocations(prev => [...prev, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setPreferredLocations(prev => prev.filter(l => l !== loc));
  };

  const toggleJobType = (type: string) => {
    setPreferredJobTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAddExperience = () => {
    setExperiences(prev => [...prev, {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    setExperiences(prev => prev.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    ));
  };

  const handleAddEducation = () => {
    setEducation(prev => [...prev, {
      degree: "",
      institution: "",
      year: "",
      field: "",
    }]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setEducation(prev => prev.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError("Please sign in to save your profile");
      return;
    }

    if (!formData.headline.trim()) {
      setError("Please add a headline (e.g., 'Senior Frontend Developer')");
      return;
    }

    if (skills.length === 0) {
      setError("Please add at least one skill");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const profileData = {
        userId: user.id,
        ...formData,
        totalExperience: formData.totalExperience ? parseInt(formData.totalExperience) : null,
        expectedSalaryMin: formData.expectedSalaryMin ? parseFloat(formData.expectedSalaryMin) : null,
        expectedSalaryMax: formData.expectedSalaryMax ? parseFloat(formData.expectedSalaryMax) : null,
        skills,
        primarySkills: skills.slice(0, 5),
        tags,
        preferredJobTypes,
        preferredLocations,
        experience: experiences.filter(e => e.title && e.company),
        education: education.filter(e => e.degree && e.institution),
        source: hasProfile ? undefined : "Direct",
      };

      const response = await fetch('/api/job-seeker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setHasProfile(true);
        setIsEditing(false); // Back to view mode on success
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("An error occurred while saving your profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <FiAlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">Sign in to create or update your job seeker profile.</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Render different content based on active tab
  if (activeTab === "services") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {isEditingService ? (
            <button
              onClick={() => setIsEditingService(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link
              href="/buyer/services"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditingService ? "Edit Service Profile" : "My Service Profile"}
            </h1>
            <p className="text-gray-600">
              {isEditingService ? "Update your service preferences and address" : "Manage your service preferences and address"}
            </p>
          </div>
          {!isEditingService && (
            <button
              onClick={() => setIsEditingService(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-semibold"
            >
              <FiEdit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditingService ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-blue-600" />
                Service Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={serviceAddress.street}
                    onChange={(e) => setServiceAddress({ ...serviceAddress, street: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={serviceAddress.city}
                    onChange={(e) => setServiceAddress({ ...serviceAddress, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={serviceAddress.state}
                    onChange={(e) => setServiceAddress({ ...serviceAddress, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={serviceAddress.zipCode}
                    onChange={(e) => setServiceAddress({ ...serviceAddress, zipCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-blue-600" />
                Preferred Service Times
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={servicePreferences.weekdays}
                    onChange={(e) => setServicePreferences({ ...servicePreferences, weekdays: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Weekdays (9 AM - 6 PM)</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={servicePreferences.weekends}
                    onChange={(e) => setServicePreferences({ ...servicePreferences, weekends: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Weekends (10 AM - 4 PM)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsEditingService(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSaving(true);
                  setTimeout(() => {
                    setSaving(false);
                    setIsEditingService(false);
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                  }, 1000);
                }}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-bold"
              >
                {saving ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Service View Mode */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden px-8 py-8 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Service Location</h3>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <FiMapPin className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{serviceAddress.street}</p>
                      <p className="text-gray-600">{serviceAddress.city}, {serviceAddress.state} {serviceAddress.zipCode}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Availability Preferences</h3>
                  <div className="space-y-3">
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${servicePreferences.weekdays ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${servicePreferences.weekdays ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "products") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {isEditingBuyer ? (
            <button
              onClick={() => setIsEditingBuyer(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <Link
              href="/buyer/products"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditingBuyer ? "Edit Buyer Profile" : "My Buyer Profile"}
            </h1>
            <p className="text-gray-600">
              {isEditingBuyer ? "Manage your shipping details and shopping preferences" : "Manage your shipping details and shopping preferences"}
            </p>
          </div>
          {!isEditingBuyer && (
            <button
              onClick={() => setIsEditingBuyer(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-semibold"
            >
              <FiEdit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditingBuyer ? (
          <div className="space-y-6">
            {/* Shipping Addresses Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FiTruck className="w-5 h-5 text-blue-600" />
                  Shipping Addresses
                </h2>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md transition-all text-sm font-medium"
                  >
                    <FiPlusCircle className="w-4 h-4" />
                    Add New Address
                  </button>
                )}
              </div>

              {!isAddingAddress ? (
                <div className="grid grid-cols-1 gap-4">
                  {shippingAddresses.map((addr) => (
                    <div key={addr.id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-start hover:border-blue-300 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{addr.name}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Default</span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase rounded-full">{addr.type}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-gray-600 text-sm">{addr.addressLine2}</p>}
                        <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.pincode}</p>
                        {addr.phone && <p className="text-gray-500 text-xs mt-1">Phone: {addr.phone}</p>}
                      </div>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Address"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {shippingAddresses.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No addresses saved yet.</p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Add New Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="1234567890"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                      <input
                        type="text"
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="123 Shopping Blvd"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Apt 4B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                      <select
                        value={newAddress.type}
                        onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Set as default shipping address</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNewAddress}
                      className="px-4 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-lg hover:from-primary-400 hover:to-primary-600 shadow-md transition-all font-medium"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiBox className="w-5 h-5 text-blue-600" />
                Delivery Instructions
              </h2>
              <textarea
                rows={3}
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., Leave at front desk, code is 1234..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsEditingBuyer(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSaving(true);
                  setTimeout(() => {
                    setSaving(false);
                    setIsEditingBuyer(false);
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 3000);
                  }, 1000);
                }}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-bold"
              >
                {saving ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Buyer View Mode */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Shipping Summary</h3>
                  <p className="text-gray-500">Your saved addresses and delivery preferences</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-2xl">
                  <FiPackage className="w-6 h-6 text-orange-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Default Address</h4>
                  {shippingAddresses.find(a => a.isDefault) ? (
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900">{shippingAddresses.find(a => a.isDefault)?.name}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">Primary</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {shippingAddresses.find(a => a.isDefault)?.addressLine1}<br />
                        {shippingAddresses.find(a => a.isDefault)?.addressLine2 && <>{shippingAddresses.find(a => a.isDefault)?.addressLine2}<br /></>}
                        {shippingAddresses.find(a => a.isDefault)?.city}, {shippingAddresses.find(a => a.isDefault)?.state} {shippingAddresses.find(a => a.isDefault)?.pincode}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No default address set.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Delivery Instructions</h4>
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 min-h-[100px]">
                    <div className="flex gap-3">
                      <FiMessageSquare className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                      <p className="text-gray-600 text-sm italic">{deliveryInstructions || "No special instructions provided."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 font-primary">Other Saved Addresses</h3>
              <div className="flex flex-wrap gap-4">
                {shippingAddresses.filter(a => !a.isDefault).map(addr => (
                  <div key={addr.id} className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{addr.city}</p>
                      <p className="text-xs text-gray-500">{addr.addressLine1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Jobs Tab (Default Job Seeker Profile)
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {isEditing && hasProfile ? (
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <Link
            href="/buyer/jobs"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing
              ? (hasProfile ? "Edit Your Profile" : "Create Job Seeker Profile")
              : "Your Professional Profile"
            }
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? (hasProfile
                ? "Update your skills, experience, and preferences"
                : "Register your skills and experience to get discovered by employers")
              : "How your profile appears to potential employers"
            }
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-semibold"
          >
            <FiEdit3 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <FiCheck className="w-5 h-5 text-green-500" />
          <p className="text-green-700">Profile saved successfully! Employers can now find you in the talent pool.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {/* Status & Availability */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTarget className="w-5 h-5 text-blue-600" />
              Job Search Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statusOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData.status === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-3 h-3 rounded-full bg-${option.color}-500`} />
                  <span className="font-medium text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="w-5 h-5 text-blue-600" />
              Professional Summary
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g., Senior Frontend Developer with 5 years of React experience"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Role
                  </label>
                  <input
                    type="text"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleChange}
                    placeholder="e.g., Frontend Developer"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Company
                  </label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleChange}
                    placeholder="e.g., Tech Solutions Pvt Ltd"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Experience (years)
                </label>
                <input
                  type="number"
                  name="totalExperience"
                  value={formData.totalExperience}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="0"
                  max="50"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About You
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiAward className="w-5 h-5 text-blue-600" />
              Skills <span className="text-red-500">*</span>
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill (e.g., React, Python, Figma)"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-blue-900">
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Add your technical and soft skills</p>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTag className="w-5 h-5 text-blue-600" />
              Tags (Help employers find you)
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag (e.g., #ReactExpert, #RemoteReady)"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-gray-900">
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Job Preferences */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiBriefcase className="w-5 h-5 text-blue-600" />
              Job Preferences
            </h2>

            <div className="space-y-6">
              {/* Preferred Job Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Job Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleJobType(type.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${preferredJobTypes.includes(type.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remote Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Mode Preference
                </label>
                <select
                  name="remotePreference"
                  value={formData.remotePreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {remotePreferences.map(pref => (
                    <option key={pref.value} value={pref.value}>{pref.label}</option>
                  ))}
                </select>
              </div>

              {/* Preferred Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Locations
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                    placeholder="Add a city (e.g., Bangalore, Mumbai)"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="px-4 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
                {preferredLocations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferredLocations.map((loc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm"
                      >
                        <FiMapPin className="w-3 h-3" />
                        {loc}
                        <button type="button" onClick={() => handleRemoveLocation(loc)} className="hover:text-green-900">
                          <FiX className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notice Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Period
                  </label>
                  <select
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select notice period</option>
                    {noticePeriods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="willingToRelocate"
                      checked={formData.willingToRelocate}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Willing to relocate</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Expectations */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiDollarSign className="w-5 h-5 text-blue-600" />
              Salary Expectations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum (₹)
                </label>
                <input
                  type="number"
                  name="expectedSalaryMin"
                  value={formData.expectedSalaryMin}
                  onChange={handleChange}
                  placeholder="e.g., 1000000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum (₹)
                </label>
                <input
                  type="number"
                  name="expectedSalaryMax"
                  value={formData.expectedSalaryMax}
                  onChange={handleChange}
                  placeholder="e.g., 1500000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <select
                  name="salaryPeriod"
                  value={formData.salaryPeriod}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                  <option value="hourly">Per Hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiGlobe className="w-5 h-5 text-blue-600" />
              Links & Resume
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiFileText className="w-4 h-4 inline mr-1" />
                  Resume URL
                </label>
                <input
                  type="url"
                  name="resume"
                  value={formData.resume}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/your-resume"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiGlobe className="w-4 h-4 inline mr-1" />
                  Portfolio
                </label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiLinkedin className="w-4 h-4 inline mr-1" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiGithub className="w-4 h-4 inline mr-1" />
                  GitHub
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {formData.isPublic ? <FiEye className="w-5 h-5 text-blue-600" /> : <FiEyeOff className="w-5 h-5 text-gray-600" />}
              Privacy Settings
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Show my profile in Talent Pool</span>
                  <p className="text-xs text-gray-500">Employers can discover your profile when searching for candidates</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showEmail"
                  checked={formData.showEmail}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show my email to employers</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showPhone"
                  checked={formData.showPhone}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show my phone number to employers</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showSalary"
                  checked={formData.showSalary}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Show my salary expectations</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
            {hasProfile && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </button>
            )}
            {!hasProfile && (
              <Link
                href="/buyer/jobs"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-primary-300 to-primary-500 text-white font-medium rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  {hasProfile ? "Update Profile" : "Create Profile"}
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-lg text-primary-600 font-medium italic">{formData.headline}</p>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  {formData.currentRole && (
                    <div className="flex items-center gap-1.5">
                      <FiBriefcase className="w-4 h-4 text-gray-400" />
                      <span>{formData.currentRole} at {formData.currentCompany}</span>
                    </div>
                  )}
                  {formData.totalExperience && (
                    <div className="flex items-center gap-1.5">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <span>{formData.totalExperience} Years Experience</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full bg-${statusOptions.find(o => o.value === formData.status)?.color || 'blue'}-500`} />
                    <span className="font-medium text-gray-700">
                      {statusOptions.find(o => o.value === formData.status)?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.resume && (
                  <a href={formData.resume} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium border border-gray-200">
                    <FiFileText className="w-4 h-4" />
                    Resume
                  </a>
                )}
                {formData.linkedIn && (
                  <a href={formData.linkedIn} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-50 transition-all border border-gray-200">
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                )}
                {formData.github && (
                  <a href={formData.github} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition-all border border-gray-200">
                    <FiGithub className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {formData.summary && (
              <div className="mt-8 pt-8 border-t border-gray-50">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{formData.summary}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Skills */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-primary-500" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium border border-primary-100/50">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiTag className="w-5 h-5 text-primary-500" />
                  Profile Tags
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Preferences */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiTarget className="w-5 h-5 text-primary-500" />
                  Preferences
                </h3>

                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Job Types</p>
                    <div className="flex flex-wrap gap-2">
                      {preferredJobTypes.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                          {jobTypes.find(jt => jt.value === t)?.label || t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {preferredLocations.map(l => (
                        <span key={l} className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                          <FiMapPin className="w-3 h-3" />
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Work Mode</p>
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
                      {remotePreferences.find(p => p.value === formData.remotePreference)?.label}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Notice Period</p>
                    <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-semibold">
                      {formData.noticePeriod || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5 text-primary-500" />
                  Expectations
                </h3>
                <div>
                  {formData.expectedSalaryMin ? (
                    <p className="text-xl font-bold text-gray-900">
                      ₹{parseInt(formData.expectedSalaryMin).toLocaleString()}
                      {formData.expectedSalaryMax && ` - ₹${parseInt(formData.expectedSalaryMax).toLocaleString()}`}
                      <span className="text-sm text-gray-500 font-normal"> /{formData.salaryPeriod}</span>
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Not specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

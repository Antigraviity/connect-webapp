"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useTab } from "../layout"; // Import tab context
import {
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiGlobe,
  FiLinkedin,
  FiGithub,
  FiFileText,
  FiSave,
  FiLoader,
  FiPlus,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiEdit3,
  FiAward,
  FiBook,
  FiTarget,
  FiTag,
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/buyer/jobs"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {hasProfile ? "Edit Your Profile" : "Create Job Seeker Profile"}
          </h1>
          <p className="text-gray-600">
            {hasProfile 
              ? "Update your skills, experience, and preferences"
              : "Register your skills and experience to get discovered by employers"
            }
          </p>
        </div>
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
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  formData.status === option.value
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      preferredJobTypes.includes(type.value)
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Link
            href="/buyer/jobs"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
    </div>
  );
}

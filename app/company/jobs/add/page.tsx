"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiArrowLeft,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiFileText,
  FiTag,
  FiCalendar,
  FiSave,
  FiEye,
  FiPlus,
  FiX,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const jobTypes = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REMOTE", label: "Remote" },
];

const experienceLevels = [
  { value: "Entry Level", label: "Entry Level (0-2 years)" },
  { value: "Mid Level", label: "Mid Level (2-5 years)" },
  { value: "Senior Level", label: "Senior Level (5-8 years)" },
  { value: "Lead/Manager", label: "Lead/Manager (8+ years)" },
  { value: "Executive", label: "Executive (10+ years)" },
];

const salaryPeriods = [
  { value: "yearly", label: "Per Year" },
  { value: "monthly", label: "Per Month" },
  { value: "hourly", label: "Per Hour" },
];

export default function AddJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const errorSectionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    jobType: "FULL_TIME",
    category: "",
    experienceLevel: "",
    minExperience: "",
    maxExperience: "",
    education: "",
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "yearly",
    showSalary: true,
    location: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    isRemote: false,
    status: "ACTIVE",
    featured: false,
    urgent: false,
    deadline: "",
    companyName: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();

    if (!user?.id) {
      setError("Please sign in to post a job");
      return;
    }

    // Validate required fields
    const errors: Record<string, boolean> = {};

    if (!formData.title.trim()) {
      errors.title = true;
    }

    if (!formData.description.trim()) {
      errors.description = true;
    }

    if (!formData.jobType) {
      errors.jobType = true;
    }

    if (!formData.category) {
      errors.category = true;
    }

    if (!formData.companyName.trim()) {
      errors.companyName = true;
    }

    if (!formData.experienceLevel) {
      errors.experienceLevel = true;
    }

    if (!formData.salaryMin) {
      errors.salaryMin = true;
    }

    if (!formData.city.trim()) {
      errors.city = true;
    }

    if (!formData.country.trim()) {
      errors.country = true;
    }

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError("Enter the mandatory fields"); // User requested specific error message

      // Scroll to top error section
      if (errorSectionRef.current) {
        errorSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const jobData = {
        ...formData,
        skills: skills,
        minExperience: formData.minExperience ? parseInt(formData.minExperience) : null,
        maxExperience: formData.maxExperience ? parseInt(formData.maxExperience) : null,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        status: saveAsDraft ? "DRAFT" : formData.status,
        employerId: user.id,
        companyName: formData.companyName || user.name,
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/company/jobs');
        }, 1500);
      } else {
        // Log the full error for debugging
        console.error("Job creation failed:", data);

        // Parse error message to highlight specific fields
        const errorMessage = data.message || "Failed to create job";
        const errors: Record<string, boolean> = {};

        // Check if error message mentions specific fields
        if (errorMessage.toLowerCase().includes('title')) {
          errors.title = true;
        }
        if (errorMessage.toLowerCase().includes('description')) {
          errors.description = true;
        }

        // Set validation errors if any fields were identified
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);

          // Scroll to top error section
          if (errorSectionRef.current) {
            errorSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }

        if (errorMessage.toLowerCase() !== "failed to create job" &&
          !errorMessage.toLowerCase().includes("title") &&
          !errorMessage.toLowerCase().includes("description")) {
          setError(errorMessage);
        } else {
          setError("Enter the mandatory fields");
        }
      }
    } catch (err) {
      console.error("Error creating job:", err);
      setError("An error occurred while creating the job. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-600">Redirecting to your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6" ref={errorSectionRef}>
        <Link
          href="/company/jobs"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post Job</h1>
          <p className="text-gray-600">Create a new job posting to attract candidates</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiBriefcase className="w-5 h-5 text-company-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior React Developer"
                className={`w-full px-4 py-1.5 border rounded-lg transition-all outline-none ${validationErrors.title
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Job title is required
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your company name"
                className={`w-full px-4 py-1.5 border rounded-lg transition-all outline-none ${validationErrors.companyName
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              />
              {validationErrors.companyName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Company Name is required
                </p>
              )}
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className={`w-full px-4 py-1.5 border rounded-lg transition-all outline-none ${validationErrors.jobType
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {validationErrors.jobType && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Job type is required
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-1.5 border rounded-lg transition-all outline-none ${validationErrors.category
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              >
                <option value="">Select Category</option>
                <option value="IT & Software">IT & Software</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Analytics">Analytics</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Operations">Operations</option>
                <option value="Customer Support">Customer Support</option>
              </select>
              {validationErrors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Category is required
                </p>
              )}
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className={`w-full px-4 py-1.5 border rounded-lg transition-all outline-none ${validationErrors.experienceLevel
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              >
                <option value="">Select experience level</option>
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              {validationErrors.experienceLevel && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Experience Level is required
                </p>
              )}
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Required
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g., Bachelor's in Computer Science"
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-company-600" />
            Job Description
          </h2>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the job role, responsibilities, and what you're looking for..."
                className={`w-full px-4 py-2.5 border rounded-lg transition-all resize-none outline-none ${validationErrors.description
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Job description is required
                </p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                placeholder="List the qualifications, skills, and experience required..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all focus:border-transparent resize-none outline-none"
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Responsibilities
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                placeholder="List the main responsibilities and duties..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all focus:border-transparent resize-none outline-none"
              />
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits & Perks
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={3}
                placeholder="Health insurance, flexible hours, remote work options..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all focus:border-transparent resize-none outline-none"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiTag className="w-5 h-5 text-company-600" />
            Required Skills
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add a skill (e.g., React, Python)"
              className="flex-1 px-4 py-1.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white rounded-xl transition-all shadow-md active:scale-95"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-company-50 text-company-700 rounded-full text-sm font-medium shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-company-900 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiMapPin className="w-5 h-5 text-company-600" />
            Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
                className={`w-full px-4 py-1.5 border rounded-lg transition-all outline-none ${validationErrors.city
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              />
              {validationErrors.city && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  City is required
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g., Karnataka"
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g., India"
                className={`w-full px-4 py-1.5 border rounded-lg transition-all outline-none ${validationErrors.country
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              />
              {validationErrors.country && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Country is required
                </p>
              )}
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-company-600 focus:ring-company-500 transition-all cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">This is a remote position</span>
              </label>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiDollarSign className="w-5 h-5 text-company-600" />
            Compensation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                placeholder="e.g., 1000000"
                className={`w-full px-4 py-1.5 border rounded-lg transition-all outline-none ${validationErrors.salaryMin
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-gray-300 focus:border-company-500'
                  }`}
              />
              {validationErrors.salaryMin && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  Min Salary is required
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Salary (₹)
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                placeholder="e.g., 2000000"
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Period
              </label>
              <select
                name="salaryPeriod"
                value={formData.salaryPeriod}
                onChange={handleChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all outline-none"
              >
                {salaryPeriods.map(period => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="showSalary"
                checked={formData.showSalary}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-company-600 focus:ring-company-500 transition-all cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Display salary on job listing</span>
            </label>
          </div>
        </div>

        {/* Posting Options */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-company-600" />
            Posting Options
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:border-company-500 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-company-600 focus:ring-company-500 transition-all cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">Feature this job (highlighted in listings)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-company-600 focus:ring-company-500 transition-all cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">Mark as urgent hiring</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Link
            href="/company/jobs"
            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className="px-4 py-2 border border-company-500 text-company-600 font-bold rounded-xl hover:bg-company-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiSave className="w-5 h-5" />
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="current" className="mr-2" />
                Publishing...
              </>
            ) : (
              <>
                <FiCheck className="w-5 h-5" />
                Publish Job
              </>
            )}
          </button>
        </div>
      </form >
    </div >
  );
}

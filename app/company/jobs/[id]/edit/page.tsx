"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

const jobStatuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "CLOSED", label: "Closed" },
];

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const jobId = params.id as string;

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

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    setLoading(true);
    setError(null);

    try {
      // Skip view increment for edit page
      const response = await fetch(`/api/jobs/${jobId}?skipView=true`);
      const data = await response.json();

      if (data.success && data.job) {
        const job = data.job;
        setFormData({
          title: job.title || "",
          description: job.description || "",
          requirements: job.requirements || "",
          responsibilities: job.responsibilities || "",
          benefits: job.benefits || "",
          jobType: job.jobType || "FULL_TIME",
          category: job.category || "",
          experienceLevel: job.experienceLevel || "",
          minExperience: job.minExperience?.toString() || "",
          maxExperience: job.maxExperience?.toString() || "",
          education: job.education || "",
          salaryMin: job.salaryMin?.toString() || "",
          salaryMax: job.salaryMax?.toString() || "",
          salaryPeriod: job.salaryPeriod || "yearly",
          showSalary: job.showSalary ?? true,
          location: job.location || "",
          city: job.city || "",
          state: job.state || "",
          country: job.country || "India",
          zipCode: job.zipCode || "",
          isRemote: job.isRemote || false,
          status: job.status || "ACTIVE",
          featured: job.featured || false,
          urgent: job.urgent || false,
          deadline: job.deadline ? job.deadline.split('T')[0] : "",
          companyName: job.companyName || "",
        });

        // Parse skills
        if (job.skills) {
          try {
            const parsedSkills = JSON.parse(job.skills);
            setSkills(Array.isArray(parsedSkills) ? parsedSkills : []);
          } catch {
            setSkills(job.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
          }
        }
      } else {
        setError(data.message || "Failed to fetch job");
      }
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Failed to load job details");
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

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Job title is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Job description is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const jobData = {
        ...formData,
        skills: skills,
        minExperience: formData.minExperience ? parseInt(formData.minExperience) : null,
        maxExperience: formData.maxExperience ? parseInt(formData.maxExperience) : null,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        deadline: formData.deadline || null,
      };

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/company/jobs/${jobId}`);
        }, 1500);
      } else {
        setError(data.message || "Failed to update job");
      }
    } catch (err) {
      console.error("Error updating job:", err);
      setError("An error occurred while updating the job");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner size="lg" label="Loading..." className="min-h-[400px]" />;
  }

  if (success) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Updated Successfully!</h2>
          <p className="text-gray-600">Redirecting to job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/company/jobs/${jobId}`}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-gray-600">Update your job posting details</p>
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

      <form onSubmit={handleSubmit}>
        {/* Status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Job Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {jobStatuses.map(status => (
              <label
                key={status.value}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${formData.status === status.value
                  ? 'border-company-500 bg-company-50 text-company-700 shadow-sm font-bold'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status.value}
                  checked={formData.status === status.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-medium">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

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
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your company name"
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
              />
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
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
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
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
              >
                <option value="">Select experience level</option>
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
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
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all resize-none outline-none"
                required
              />
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all resize-none outline-none"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all resize-none outline-none"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all resize-none outline-none"
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
              className="flex-1 px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-company-50 text-company-700 rounded-full text-sm font-bold shadow-sm"
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
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
              />
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
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g., India"
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
              />
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
                Minimum Salary (₹)
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                placeholder="e.g., 1000000"
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
              />
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
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
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
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
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
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all outline-none"
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
            href={`/company/jobs/${jobId}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" color="current" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

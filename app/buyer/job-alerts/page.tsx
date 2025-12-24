"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiBell,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiX,
  FiSave,
  FiPause,
  FiPlay,
} from "react-icons/fi";

// TypeScript interfaces
interface JobAlert {
  id: string;
  userId: string;
  title: string;
  keywords: string | null;
  location: string | null;
  jobTypes: string | null;
  experienceMin: number | null;
  experienceMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  frequency: "INSTANT" | "DAILY" | "WEEKLY";
  isActive: boolean;
  matchesFound: number;
  lastNotified: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AlertFormData {
  title: string;
  keywords: string[];
  location: string;
  jobTypes: string[];
  experienceMin: number | string;
  experienceMax: number | string;
  salaryMin: number | string;
  salaryMax: number | string;
  frequency: "INSTANT" | "DAILY" | "WEEKLY";
}

const jobTypeOptions = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REMOTE", label: "Remote" },
];

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState("");
  
  const [formData, setFormData] = useState<AlertFormData>({
    title: "",
    keywords: [],
    location: "",
    jobTypes: [],
    experienceMin: "",
    experienceMax: "",
    salaryMin: "",
    salaryMax: "",
    frequency: "DAILY",
  });

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      const response = await fetch(`/api/job-alerts?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts);
        console.log("✅ Fetched job alerts:", data.alerts.length);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAlert(null);
    setFormData({
      title: "",
      keywords: [],
      location: "",
      jobTypes: [],
      experienceMin: "",
      experienceMax: "",
      salaryMin: "",
      salaryMax: "",
      frequency: "DAILY",
    });
    setShowModal(true);
  };

  const openEditModal = (alert: JobAlert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      keywords: alert.keywords ? JSON.parse(alert.keywords) : [],
      location: alert.location || "",
      jobTypes: alert.jobTypes ? JSON.parse(alert.jobTypes) : [],
      experienceMin: alert.experienceMin || "",
      experienceMax: alert.experienceMax || "",
      salaryMin: alert.salaryMin || "",
      salaryMax: alert.salaryMax || "",
      frequency: alert.frequency,
    });
    setShowModal(true);
  };

  const handleSaveAlert = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert("Please log in to create alerts");
        return;
      }
      
      const user = JSON.parse(userStr);

      // Validate required fields
      if (!formData.title.trim()) {
        alert("Please enter a title for your alert");
        return;
      }

      const payload = {
        userId: user.id,
        title: formData.title,
        keywords: formData.keywords.length > 0 ? formData.keywords : null,
        location: formData.location || null,
        jobTypes: formData.jobTypes.length > 0 ? formData.jobTypes : null,
        experienceMin: formData.experienceMin ? Number(formData.experienceMin) : null,
        experienceMax: formData.experienceMax ? Number(formData.experienceMax) : null,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        frequency: formData.frequency,
      };

      let response;
      if (editingAlert) {
        // Update existing alert
        response = await fetch('/api/job-alerts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId: editingAlert.id, ...payload }),
        });
      } else {
        // Create new alert
        response = await fetch('/api/job-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchAlerts();
        setShowModal(false);
        console.log("✅ Alert saved successfully");
      } else {
        alert(data.message || "Failed to save alert");
      }
    } catch (error) {
      console.error("Error saving alert:", error);
      alert("Failed to save alert");
    }
  };

  const handleToggleActive = async (alertId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/job-alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, isActive: !currentStatus }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchAlerts();
        console.log(`✅ Alert ${!currentStatus ? 'activated' : 'paused'}`);
      }
    } catch (error) {
      console.error("Error toggling alert:", error);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      const response = await fetch(`/api/job-alerts?alertId=${alertId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchAlerts();
        console.log("✅ Alert deleted");
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && !formData.keywords.includes(currentKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, currentKeyword.trim()],
      });
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword),
    });
  };

  const toggleJobType = (type: string) => {
    if (formData.jobTypes.includes(type)) {
      setFormData({
        ...formData,
        jobTypes: formData.jobTypes.filter(t => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        jobTypes: [...formData.jobTypes, type],
      });
    }
  };

  const activeAlerts = alerts.filter(a => a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);
  const totalMatches = alerts.reduce((sum, a) => sum + a.matchesFound, 0);

  const getFrequencyLabel = (frequency: string) => {
    return frequency.charAt(0) + frequency.slice(1).toLowerCase();
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "INSTANT": return "bg-red-100 text-red-700 border-red-200";
      case "DAILY": return "bg-blue-100 text-blue-700 border-blue-200";
      case "WEEKLY": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const parseKeywords = (keywords: string | null): string[] => {
    if (!keywords) return [];
    try {
      return JSON.parse(keywords);
    } catch {
      return [];
    }
  };

  const parseJobTypes = (jobTypes: string | null): string[] => {
    if (!jobTypes) return [];
    try {
      return JSON.parse(jobTypes);
    } catch {
      return [];
    }
  };

  const formatJobTypes = (types: string[]): string => {
    return types.map(type => 
      jobTypeOptions.find(opt => opt.value === type)?.label || type
    ).join(", ");
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Alerts</h1>
          <p className="text-gray-600 mt-1">
            {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''} monitoring job postings for you
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{alerts.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiBell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{activeAlerts.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Matches</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalMatches}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FiBriefcase className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {activeAlerts.filter(a => ['DAILY', 'INSTANT'].includes(a.frequency)).length * 7}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <FiMail className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <div className="flex gap-3">
          <FiBell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">How Job Alerts Work</h4>
            <p className="text-sm text-blue-800">
              We'll automatically search for jobs matching your criteria and notify you via email and dashboard notifications. 
              You can set the frequency for each alert and pause them anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const keywords = parseKeywords(alert.keywords);
              const jobTypes = parseJobTypes(alert.jobTypes);
              
              return (
                <div
                  key={alert.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Alert Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getFrequencyColor(alert.frequency)}`}>
                              {getFrequencyLabel(alert.frequency)}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                              Active
                            </span>
                          </div>

                          {/* Keywords */}
                          {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {keywords.map((keyword, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                            {alert.location && (
                              <div className="flex items-center gap-2">
                                <FiMapPin className="w-4 h-4 text-blue-600" />
                                <span>{alert.location}</span>
                              </div>
                            )}
                            {jobTypes.length > 0 && (
                              <div className="flex items-center gap-2">
                                <FiBriefcase className="w-4 h-4 text-blue-600" />
                                <span>{formatJobTypes(jobTypes)}</span>
                              </div>
                            )}
                            {(alert.experienceMin !== null || alert.experienceMax !== null) && (
                              <div className="flex items-center gap-2">
                                <FiClock className="w-4 h-4 text-blue-600" />
                                <span>
                                  {alert.experienceMin || 0}-{alert.experienceMax || '∞'} years
                                </span>
                              </div>
                            )}
                            {(alert.salaryMin !== null || alert.salaryMax !== null) && (
                              <div className="flex items-center gap-2">
                                <FiDollarSign className="w-4 h-4 text-blue-600" />
                                <span>
                                  ₹{alert.salaryMin || 0}-{alert.salaryMax || '∞'} LPA
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-sm">
                            <div className="flex items-center gap-2">
                              <FiBriefcase className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                <span className="font-semibold text-blue-600">{alert.matchesFound}</span> new matches
                              </span>
                            </div>
                            {alert.lastNotified && (
                              <div className="flex items-center gap-2">
                                <FiMail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  Last sent {new Date(alert.lastNotified).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Created {new Date(alert.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => handleToggleActive(alert.id, alert.isActive)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                      >
                        <FiPause className="w-4 h-4" />
                        Pause
                      </button>
                      <button 
                        onClick={() => openEditModal(alert)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Alerts */}
      {inactiveAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Paused Alerts</h2>
          <div className="space-y-4">
            {inactiveAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 opacity-75"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="text-lg font-semibold text-gray-700">{alert.title}</h3>
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                        Paused
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Last active: {alert.lastNotified ? new Date(alert.lastNotified).toLocaleDateString() : 'Never'} • {alert.matchesFound} matches found
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(alert.id, alert.isActive)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      <FiPlay className="w-4 h-4" />
                      Activate
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBell className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Job Alerts Yet</h3>
            <p className="text-gray-600 mb-6">
              Create custom job alerts to get notified when new positions matching your preferences are posted. 
              Stay ahead in your job search without constantly checking for new listings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <FiPlus className="w-5 h-5" />
                Create Your First Alert
              </button>
              <Link
                href="/buyer/jobs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                <FiBriefcase className="w-5 h-5" />
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="flex gap-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Alert Tips</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Use specific keywords to get more relevant matches</li>
                <li>• Set realistic salary ranges to avoid missing opportunities</li>
                <li>• Instant alerts are best for high-demand roles</li>
                <li>• Review and update your alerts monthly for best results</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAlert ? 'Edit Job Alert' : 'Create Job Alert'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alert Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., React Developer - Remote"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add a keyword and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Bangalore, Remote, Anywhere"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Job Types */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Types
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {jobTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleJobType(option.value)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        formData.jobTypes.includes(option.value)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience (Years)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={formData.experienceMin}
                      onChange={(e) => setFormData({ ...formData, experienceMin: e.target.value })}
                      placeholder="Min"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.experienceMax}
                      onChange={(e) => setFormData({ ...formData, experienceMax: e.target.value })}
                      placeholder="Max"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Salary (LPA)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      placeholder="Min (₹)"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      placeholder="Max (₹)"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notification Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="INSTANT">Instant (Get notified immediately)</option>
                  <option value="DAILY">Daily (Once per day)</option>
                  <option value="WEEKLY">Weekly (Once per week)</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAlert}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <FiSave className="w-4 h-4" />
                {editingAlert ? 'Update Alert' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

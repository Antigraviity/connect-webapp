"use client";

import { useState } from "react";
import { FiSave, FiUpload } from "react-icons/fi";

export default function CompanySettingsPage() {
  const [companyInfo, setCompanyInfo] = useState({
    name: "Tech Corp",
    industry: "Information Technology",
    size: "100-500",
    website: "https://techcorp.com",
    email: "hr@techcorp.com",
    phone: "+91 80 1234 5678",
    address: "123 Tech Park, Bangalore, Karnataka 560001, India",
    description:
      "Tech Corp is a leading technology company specializing in innovative software solutions.",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCompanyInfo({
      ...companyInfo,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your company profile and preferences
        </p>
      </div>

      {/* Company Logo */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Company Logo</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-r from-company-400 to-company-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-3xl">TC</span>
          </div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95">
              <FiUpload className="w-4 h-4" />
              Upload New Logo
            </button>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG or SVG. Max size 2MB. Recommended: 400x400px
            </p>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Company Information
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={companyInfo.name}
                onChange={handleInputChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                name="industry"
                value={companyInfo.industry}
                onChange={handleInputChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-company-500 focus:border-transparent cursor-pointer transition-all"
              >
                <option>Information Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Education</option>
                <option>Manufacturing</option>
                <option>Retail</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select
                name="size"
                value={companyInfo.size}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-company-500 focus:border-transparent cursor-pointer transition-all"
              >
                <option>1-10</option>
                <option>11-50</option>
                <option>51-100</option>
                <option>100-500</option>
                <option>500-1000</option>
                <option>1000+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={companyInfo.website}
                onChange={handleInputChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={companyInfo.email}
                onChange={handleInputChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={companyInfo.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={companyInfo.address}
              onChange={handleInputChange}
              className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Description
            </label>
            <textarea
              name="description"
              value={companyInfo.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-company-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Notification Preferences
        </h2>
        <div className="space-y-3">
          {[
            { id: "newApps", label: "New Applications", checked: true },
            { id: "messages", label: "New Messages", checked: true },
            { id: "interviews", label: "Interview Reminders", checked: true },
            { id: "expiry", label: "Job Post Expiry Alerts", checked: true },
            { id: "weekly", label: "Weekly Reports", checked: false },
          ].map((pref) => (
            <label
              key={pref.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                defaultChecked={pref.checked}
                className="w-5 h-5 text-company-600 border-gray-300 rounded focus:ring-company-500 transition-all cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">
                {pref.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95">
          <FiSave className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

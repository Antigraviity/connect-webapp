"use client";

import Link from "next/link";
import { useTab } from "../layout";
import {
  FiArrowLeft,
  FiUser,
  FiBell,
  FiShield,
  FiBriefcase,
  FiMapPin,
  FiPackage,
  FiTarget
} from "react-icons/fi";

export default function SettingsPage() {
  const { activeTab } = useTab();

  // Common settings available in all contexts
  const accountSettings = {
    title: "Account Settings",
    description: "Change your email or delete your account",
    icon: FiShield,
    href: "/buyer/settings/account"
  };

  // Define settings for each context
  const getSettings = () => {
    switch (activeTab) {
      case "jobs":
        return [
          {
            title: "Job Seeker Profile",
            description: "Manage your resume, experience, and skills",
            icon: FiBriefcase,
            href: "/buyer/settings/edit-profile/jobs"
          },
          {
            title: "Career Preferences",
            description: "Visibility, alerts, and job search priorities",
            icon: FiTarget,
            href: "/buyer/settings/jobs"
          },
          {
            title: "Notification Settings",
            description: "Application updates and job alerts",
            icon: FiBell,
            href: "/buyer/settings/notifications/jobs"
          },
          accountSettings
        ];
      case "products":
        return [
          {
            title: "Shopper Profile",
            description: "Manage your personal details and preferences",
            icon: FiUser,
            href: "/buyer/settings/edit-profile/products"
          },
          {
            title: "Shopping Preferences",
            description: "Delivery defaults, notifications, and privacy",
            icon: FiPackage,
            href: "/buyer/settings/products"
          },
          {
            title: "Notification Settings",
            description: "Order updates and promotional emails",
            icon: FiBell,
            href: "/buyer/settings/notifications/products"
          },
          accountSettings
        ];
      case "services":
      default:
        return [
          {
            title: "Service Profile",
            description: "Manage your contact info and service preferences",
            icon: FiUser,
            href: "/buyer/settings/edit-profile/services"
          },
          {
            title: "Service Preferences",
            description: "Booking defaults, location settings, and safety",
            icon: FiBriefcase,
            href: "/buyer/settings/services"
          },
          {
            title: "Notification Settings",
            description: "Booking updates and messages",
            icon: FiBell,
            href: "/buyer/settings/notifications/services"
          },
          accountSettings
        ];
    }
  };

  const settingsOptions = getSettings();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/buyer/dashboard"
          className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'jobs' ? 'Job Settings' :
              activeTab === 'products' ? 'Shopping Settings' :
                'Service Settings'}
          </h1>
          <p className="text-gray-500 text-sm">Manage your account and preferences</p>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-3">
        {settingsOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Link
              key={`${option.href}-${index}`}
              href={option.href}
              className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                  <Icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

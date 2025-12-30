"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    FiArrowLeft,
    FiUser,
    FiBell,
    FiShield,
    FiBriefcase,
    FiMapPin,
    FiPackage
} from "react-icons/fi";

export default function ContextSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const section = params.section as string;

    // Validate section
    useEffect(() => {
        if (section && !['services', 'products', 'jobs'].includes(section)) {
            router.replace('/buyer/settings/services');
        }
    }, [section, router]);

    // Common settings available in all contexts
    const accountSettings = {
        title: "Account Settings",
        description: "Change your email or delete your account",
        icon: FiShield,
        href: "/buyer/settings/account"
    };

    // Define settings for each context
    const getSettings = () => {
        switch (section) {
            case "jobs":
                return [
                    {
                        title: "Job Seeker Profile",
                        description: "Manage your resume, experience, and skills",
                        icon: FiBriefcase,
                        href: "/buyer/profile"
                    },
                    {
                        title: "Job Alerts",
                        description: "Configure your job search preferences and alerts",
                        icon: FiBell,
                        href: "/buyer/job-alerts"
                    },
                    accountSettings
                ];
            case "products":
                return [
                    {
                        title: "Shopper Profile",
                        description: "Manage your personal details and preferences",
                        icon: FiUser,
                        href: "/buyer/profile"
                    },
                    {
                        title: "Saved Addresses",
                        description: "Manage your delivery addresses",
                        icon: FiMapPin,
                        href: "/buyer/profile" // Profile page handles addresses
                    },
                    {
                        title: "Notification Settings",
                        description: "Order updates and promotional emails",
                        icon: FiBell,
                        href: "/buyer/settings/notifications"
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
                        href: "/buyer/profile"
                    },
                    {
                        title: "Notification Settings",
                        description: "Booking updates and messages",
                        icon: FiBell,
                        href: "/buyer/settings/notifications"
                    },
                    accountSettings
                ];
        }
    };

    const settingsOptions = getSettings();
    const title = section === 'jobs' ? 'Job Settings' :
        section === 'products' ? 'Shopping Settings' :
            'Service Settings';

    // Determine back link
    const backLink = section === 'jobs' ? '/buyer/jobs' :
        section === 'products' ? '/buyer/products' :
            '/buyer/services';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={backLink}
                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {title}
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

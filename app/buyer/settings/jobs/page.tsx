"use client";

import { useState } from "react";
import {
    FiSave,
    FiBriefcase,
    FiEye,
    FiGlobe,
    FiBell,
    FiDollarSign,
    FiTarget,
    FiShield,
    FiArrowLeft,
    FiChevronDown
} from "react-icons/fi";
import Link from "next/link";

export default function JobsSettings() {
    const [jobSettings, setJobSettings] = useState({
        resumeVisibility: "Public",
        jobAlertsFrequency: "Daily",
        profileDiscovery: true,
        remoteOnly: false,
        minSalaryDisplay: true,
        industryFocus: "Technology",
        relocationStatus: "Open to Relocation"
    });

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/buyer/settings"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-primary">Career Preferences</h1>
                    <p className="text-gray-500 mt-1">Refine your job search visibility, alert frequencies, and career goals.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Section: Visibility */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Profile Visibility & Reach</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiEye className="text-blue-500" /> Resume Visibility
                            </label>
                            <div className="relative group">
                                <select
                                    value={jobSettings.resumeVisibility}
                                    onChange={(e) => setJobSettings({ ...jobSettings, resumeVisibility: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option value="Public">Open to Recruiters</option>
                                    <option value="Private">Hidden (Applied only)</option>
                                    <option value="Limited">Only to Top-Rated Employers</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-100 transition-all">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">AI Profile Discovery</h4>
                                <p className="text-[10px] text-gray-500">Allow matching engine to suggest you for roles.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={jobSettings.profileDiscovery}
                                    onChange={(e) => setJobSettings({ ...jobSettings, profileDiscovery: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Section: Job Preferences */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Search Priorities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiGlobe className="text-indigo-500" /> Work Preference
                            </label>
                            <div className="relative group">
                                <select
                                    value={jobSettings.remoteOnly ? "Remote" : "Hybrid"}
                                    onChange={(e) => setJobSettings({ ...jobSettings, remoteOnly: e.target.value === "Remote" })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option value="Hybrid">Hybrid / On-site</option>
                                    <option value="Remote">Remote Only</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiTarget className="text-red-500" /> Relocation
                            </label>
                            <div className="relative group">
                                <select
                                    value={jobSettings.relocationStatus}
                                    onChange={(e) => setJobSettings({ ...jobSettings, relocationStatus: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option>Open to Relocation</option>
                                    <option>Local Only</option>
                                    <option>Warm Climates Only</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Alerts & Privacy */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Alerts & Privacy</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiBell className="text-yellow-500" /> Alert Frequency
                            </label>
                            <div className="relative group">
                                <select
                                    value={jobSettings.jobAlertsFrequency}
                                    onChange={(e) => setJobSettings({ ...jobSettings, jobAlertsFrequency: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option value="Instant">Instant (As posted)</option>
                                    <option value="Daily">Daily Digest</option>
                                    <option value="Weekly">Weekly Summary</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                                    <FiDollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Show Salary Estimates</h4>
                                    <p className="text-xs text-gray-500">Show estimated salary if not provided.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={jobSettings.minSalaryDisplay}
                                    onChange={(e) => setJobSettings({ ...jobSettings, minSalaryDisplay: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50 text-right">
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:shadow-lg shadow-md transition-all font-bold text-sm active:scale-95">
                        <FiSave className="w-5 h-5" />
                        Update Career Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import {
    FiSave,
    FiMapPin,
    FiClock,
    FiStar,
    FiShield,
    FiMessageCircle,
    FiArrowLeft,
    FiChevronDown
} from "react-icons/fi";
import Link from "next/link";

export default function ServiceSettings() {
    const [serviceSettings, setServiceSettings] = useState({
        defaultLocation: "Home Address",
        autoConfirm: true,
        preferredRadius: "Within 10 km",
        minProviderRating: 4.5,
        allowWeekends: true,
        preferredTimeSlot: "Mornings (8am - 12pm)",
        etaNotifications: true,
        postServiceReport: false,
        genderPreference: "No Preference",
        communicationLanguage: "English"
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
                    <h1 className="text-2xl font-bold text-gray-900 font-primary">Service Preferences</h1>
                    <p className="text-gray-500 mt-1">Configure your default locations and booking behavior for services.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Section: General Booking */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Booking Defaults</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiMapPin className="text-blue-500" /> Default Service Location
                            </label>
                            <div className="relative group">
                                <select
                                    value={serviceSettings.defaultLocation}
                                    onChange={(e) => setServiceSettings({ ...serviceSettings, defaultLocation: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option value="Home Address">Home Address (Saved)</option>
                                    <option value="Office">Office Location</option>
                                    <option value="Current">Current Location</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiStar className="text-amber-500" /> Minimum Provider Rating
                            </label>
                            <div className="relative group">
                                <select
                                    value={serviceSettings.minProviderRating}
                                    onChange={(e) => setServiceSettings({ ...serviceSettings, minProviderRating: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option value="3.0">3.0+ Stars</option>
                                    <option value="4.0">4.0+ Stars</option>
                                    <option value="4.5">4.5+ Stars (Recommended)</option>
                                    <option value="4.8">4.8+ Stars (Elite only)</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional Gender Preference</label>
                            <div className="relative group">
                                <select
                                    value={serviceSettings.genderPreference}
                                    onChange={(e) => setServiceSettings({ ...serviceSettings, genderPreference: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option>No Preference</option>
                                    <option>Female Professional</option>
                                    <option>Male Professional</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Communication Language</label>
                            <div className="relative group">
                                <select
                                    value={serviceSettings.communicationLanguage}
                                    onChange={(e) => setServiceSettings({ ...serviceSettings, communicationLanguage: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Availability */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Scheduling & Availability</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiClock className="text-indigo-500" /> Preferred Time Window
                            </label>
                            <div className="relative group">
                                <select
                                    value={serviceSettings.preferredTimeSlot}
                                    onChange={(e) => setServiceSettings({ ...serviceSettings, preferredTimeSlot: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option>Early Mornings (6am - 9am)</option>
                                    <option>Mornings (8am - 12pm)</option>
                                    <option>Afternoons (12pm - 4pm)</option>
                                    <option>Evenings (4pm - 8pm)</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Allow Weekend Bookings</h4>
                                <p className="text-[10px] text-gray-500">Enable providers to suggest Saturday/Sunday slots.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={serviceSettings.allowWeekends}
                                    onChange={(e) => setServiceSettings({ ...serviceSettings, allowWeekends: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Section: Visibility & Communication */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Communication Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                                    <FiMessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Real-time ETA Alerts</h4>
                                    <p className="text-xs text-gray-500">Notify me when the provider is 15 mins away.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={serviceSettings.etaNotifications}
                                    onChange={(e) => setServiceSettings({ ...serviceSettings, etaNotifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-gray-900">Auto-Confirm Trusted</h4>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={serviceSettings.autoConfirm}
                                        onChange={(e) => setServiceSettings({ ...serviceSettings, autoConfirm: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">Skip confirmation for providers with 5+ stars you've booked before.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50 text-right">
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:shadow-lg shadow-md transition-all font-bold text-sm active:scale-95">
                        <FiSave className="w-5 h-5" />
                        Update Service Styles
                    </button>
                </div>
            </div>
        </div>
    );
}

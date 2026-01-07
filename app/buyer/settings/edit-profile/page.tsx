"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiCamera } from "react-icons/fi";

export default function EditProfilePage() {
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 98765 43210",
        location: "New Delhi, India",
        bio: "Passionate professional looking for opportunities in tech"
    });

    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            alert("Profile updated successfully!");
        }, 1000);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/buyer/settings"
                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                    <p className="text-gray-500 text-sm">Change your name, description and profile photo</p>
                </div>
            </div>

            {/* Profile Photo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Photo</h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {profile.name.charAt(0)}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            <FiCamera className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                    <div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                            Upload Photo
                        </button>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiUser className="inline w-4 h-4 mr-2" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiMail className="inline w-4 h-4 mr-2" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiPhone className="inline w-4 h-4 mr-2" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            maxLength={10}
                            placeholder="9876543210"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiMapPin className="inline w-4 h-4 mr-2" />
                            Location
                        </label>
                        <input
                            type="text"
                            value={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio / Description
                        </label>
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Link
                    href="/buyer/settings"
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                    Cancel
                </Link>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all font-bold disabled:opacity-50"
                >
                    <FiSave className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}

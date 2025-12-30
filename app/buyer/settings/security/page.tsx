"use client";

import { useState } from "react";
import {
    FiEye,
    FiEyeOff,
    FiShield
} from "react-icons/fi";

export default function SecuritySettings() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-primary">Security & Authentication</h1>
                <p className="text-gray-500 mt-1">Manage your password and protect your account with two-factor authentication.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Update Password</h2>

                <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                        <h3 className="font-bold text-gray-900">Update Password</h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Current Password"
                                    className="w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl focus:border-blue-500 transition-all outline-none font-medium"
                                />
                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            <input
                                type="password"
                                placeholder="New Password"
                                className="w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl focus:border-blue-500 transition-all outline-none font-medium"
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                className="w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl focus:border-blue-500 transition-all outline-none font-medium"
                            />
                        </div>
                        <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all">
                            Update Securely
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-6 border border-gray-100 rounded-3xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <FiShield className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Two-Factor Authentication</h4>
                                <p className="text-sm text-gray-500">Currently Disabled. Protect your wallet with SMS verification.</p>
                            </div>
                        </div>
                        <button className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
                            Enable Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

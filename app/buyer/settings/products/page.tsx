"use client";

import { useState } from "react";
import {
    FiSave,
    FiMapPin,
    FiPackage,
    FiCreditCard,
    FiBell,
    FiShield,
    FiTruck,
    FiEyeOff,
    FiArrowLeft,
    FiChevronDown
} from "react-icons/fi";
import Link from "next/link";

export default function ProductsSettings() {
    const [productSettings, setProductSettings] = useState({
        defaultShipping: "Home Address",
        defaultPayment: "Credit Card ending in 4242",
        deliveryInstructions: "Leave at front door",
        giftOptions: false,
        ecoFriendly: true,
        orderUpdates: true,
        promotionalEmails: false,
        priceDropAlerts: true,
        stockAlerts: true,
        allowPersonalization: true,
        searchHistory: true
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
                    <h1 className="text-2xl font-bold text-gray-900 font-primary">Shopping Preferences</h1>
                    <p className="text-gray-500 mt-1">Customize your shopping experience, delivery options, and notifications.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* Section: Checkout Defaults */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Checkout Defaults</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiMapPin className="text-blue-500" /> Default Shipping Address
                            </label>
                            <div className="relative group">
                                <select
                                    value={productSettings.defaultShipping}
                                    onChange={(e) => setProductSettings({ ...productSettings, defaultShipping: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option value="Home Address">Home Address (Saved)</option>
                                    <option value="Office">Office Location</option>
                                    <option value="Parents">Parents' House</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiCreditCard className="text-purple-500" /> Default Payment Method
                            </label>
                            <div className="relative group">
                                <select
                                    value={productSettings.defaultPayment}
                                    onChange={(e) => setProductSettings({ ...productSettings, defaultPayment: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option value="Credit Card ending in 4242">Credit Card ending in 4242</option>
                                    <option value="PayPal">PayPal</option>
                                    <option value="Apple Pay">Apple Pay</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Delivery Preferences */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Delivery Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <FiTruck className="text-indigo-500" /> Delivery Instructions
                            </label>
                            <div className="relative group">
                                <select
                                    value={productSettings.deliveryInstructions}
                                    onChange={(e) => setProductSettings({ ...productSettings, deliveryInstructions: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium appearance-none"
                                >
                                    <option>Leave at front door</option>
                                    <option>Hand to me directly</option>
                                    <option>Leave with neighbor</option>
                                    <option>Leave in package locker</option>
                                </select>
                                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 pointer-events-none w-5 h-5 transition-colors" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-green-100 transition-all">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Eco-Friendly Packaging</h4>
                                <p className="text-[10px] text-gray-500">Reduce plastic waste where possible.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={productSettings.ecoFriendly}
                                    onChange={(e) => setProductSettings({ ...productSettings, ecoFriendly: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                        </div>
                    </div>
                </div>


                {/* Section: Privacy */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Privacy & Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Save Search History</h4>
                                <p className="text-[10px] text-gray-500">Improve recommendations based on history.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={productSettings.searchHistory}
                                    onChange={(e) => setProductSettings({ ...productSettings, searchHistory: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-slate-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Allow Personalization</h4>
                                <p className="text-[10px] text-gray-500">Show products based on interests.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={productSettings.allowPersonalization}
                                    onChange={(e) => setProductSettings({ ...productSettings, allowPersonalization: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-slate-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-50 text-right">
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:shadow-lg shadow-md transition-all font-bold text-sm active:scale-95">
                        <FiSave className="w-5 h-5" />
                        Update Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import {
    FiPackage,
    FiShoppingCart,
    FiInfo
} from "react-icons/fi";
import Link from "next/link";

export default function HelpSettings() {
    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-primary">Help & Support</h1>
                <p className="text-gray-500 mt-1">Get assistance with your orders, bookings, and account.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Support & Assistance</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/buyer/support/services"
                        className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:shadow-blue-50 transition-all group"
                    >
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <FiPackage className="w-6 h-6" />
                        </div>
                        <h4 className="font-primary font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Service Assistance</h4>
                        <p className="text-sm text-gray-500 mt-2">Bookings, provider issues, or scheduling help.</p>
                    </Link>

                    <Link
                        href="/buyer/support/products"
                        className="p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:shadow-indigo-50 transition-all group"
                    >
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <FiShoppingCart className="w-6 h-6" />
                        </div>
                        <h4 className="font-primary font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Product Support</h4>
                        <p className="text-sm text-gray-500 mt-2">Delivery status, returns, or broken items.</p>
                    </Link>
                </div>

                <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
                    <FiInfo className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 rotate-12" />
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Need immediate human help?</h3>
                        <p className="text-white/60 text-sm mb-6">Our priority support team is available 24/7 for premium members.</p>
                        <Link href="/buyer/support" className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all inline-block">
                            Open Live Chat
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

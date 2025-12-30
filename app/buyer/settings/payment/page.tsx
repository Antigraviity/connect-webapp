"use client";

import {
    FiPlus,
    FiTrash2
} from "react-icons/fi";

export default function PaymentSettings() {
    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-primary">Payment & Billing</h1>
                <p className="text-gray-500 mt-1">Manage your saved credit cards and billing information.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900 font-primary">Saved Payment Methods</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all">
                        <FiPlus />
                        Add New
                    </button>
                </div>

                <div className="space-y-4">
                    {[
                        { type: "Visa", last4: "4242", expiry: "12/26", isDefault: true },
                        { type: "Mastercard", last4: "8890", expiry: "05/25", isDefault: false }
                    ].map((card, i) => (
                        <div key={i} className="flex items-center justify-between p-6 border border-gray-100 rounded-3xl hover:border-blue-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-black text-[10px] text-gray-400">
                                    {card.type}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">•••• •••• •••• {card.last4}</p>
                                    <p className="text-xs text-gray-500">Expires {card.expiry}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {card.isDefault && <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">Primary</span>}
                                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

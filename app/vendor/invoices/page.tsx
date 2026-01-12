"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiBell, FiDownload, FiEye, FiFileText, FiSearch } from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    createdAt: string;
    planId: string;
}

export default function VendorInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchInvoices = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                try {
                    const response = await fetch(`/api/vendor/invoices?vendorId=${user.id}`);
                    const data = await response.json();
                    if (data.success) {
                        setInvoices(data.data);
                    }
                } catch (error) {
                    console.error("Error fetching invoices:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.planId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" color="vendor" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-1">View and download your subscription invoices</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by invoice number or plan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-0 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filteredInvoices.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FiFileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Invoices Found</h3>
                        <p className="text-gray-500">You haven't generated any invoices yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold text-gray-700">Invoice Number</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Plan</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {invoice.invoiceNumber}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 capitalize">
                                            {invoice.planId} Plan
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ₹{invoice.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'PAID'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/vendor/invoices/${invoice.id}`}
                                                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-colors bg-emerald-50/50"
                                            >
                                                <FiEye className="w-4 h-4" />
                                                View / Download
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

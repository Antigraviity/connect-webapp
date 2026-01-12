"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

export default function InvoiceDetailPage() {
    const params = useParams(); // params might be a promise in next 15 but this hook usually handles it, verifying usage
    // Actually in Next 15 client components useParams returns params directly or it's a hook, checking recent docs... 
    // useParams is correct for client components.
    const router = useRouter();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // params.id might be string or array, safely handle it
            const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

            if (!id) return;

            try {
                const response = await fetch(`/api/vendor/invoices/${id}?vendorId=${user.id}`);
                const data = await response.json();
                if (data.success) {
                    setInvoice(data.data);
                } else {
                    toast.error(data.message);
                    router.push('/vendor/invoices');
                }
            } catch (error) {
                console.error("Error fetching invoice:", error);
                toast.error("Failed to load invoice");
            } finally {
                setLoading(false);
            }
        };

        if (params?.id) {
            fetchInvoice();
        }
    }, [params?.id, router]);

    const handlePrint = () => {
        if (invoice) {
            const originalTitle = document.title;
            const planName = invoice.planId.charAt(0).toUpperCase() + invoice.planId.slice(1);
            document.title = `${invoice.invoiceNumber} - ${planName} Plan - Forge India Connect Pvt Ltd`;
            window.print();
            // Restore title after a short delay so the print dialog captures it
            setTimeout(() => {
                document.title = originalTitle;
            }, 100);
        } else {
            window.print();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" color="vendor" />
            </div>
        );
    }

    if (!invoice) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6 print:p-0 print:bg-white">
            {/* Header / Actions - Hidden in Print */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Back to Invoices
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
                >
                    <FiDownload className="w-5 h-5" />
                    Download PDF
                </button>
            </div>

            {/* Invoice Container - A4 constrained */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:w-full">
                {/* Print Styles */}
                <style jsx global>{`
                    @media print {
                        @page { margin: 0; size: auto; }
                        body { background: white; }
                        nav, aside, header, footer { display: none !important; }
                        /* Hide any layout wrappers if they exist by generic checks, but manual hiding via print:hidden is safer */
                    }
                `}</style>

                <div className="p-10 md:p-12 print:p-10">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="relative w-48 h-12 mb-4">
                                <Image
                                    src="/assets/img/logo.webp"
                                    alt="Forge India Connect"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                                Forge India Connect Pvt Ltd.<br />
                                No 10-I KNT Manickam Road, New bus stand<br />
                                Krishnagiri - 635001<br />
                                GSTIN: 33AAGCF4763Q1Z3<br />
                                Contact: +91 63694-06416
                            </p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-light text-gray-900 mb-2 uppercase tracking-wide">Tax Invoice</h1>
                            <p className="text-emerald-600 font-bold mb-1"># {invoice.invoiceNumber}</p>
                            <p className="text-gray-500 text-sm">Date: {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <div className="mt-4 inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase rounded tracking-wider">
                                {invoice.status}
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-12 pt-8 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Bill To</h3>
                        <div className="text-gray-800">
                            <p className="font-bold text-lg mb-1">{invoice.vendor?.businessName || invoice.vendor?.name}</p>
                            <p>{invoice.vendor?.email}</p>
                            <p>{invoice.vendor?.phone}</p>
                            {invoice.vendor?.address && (
                                <p className="text-gray-600 mt-1 max-w-sm">
                                    {invoice.vendor.address}, {invoice.vendor.city}<br />
                                    {invoice.vendor.state} - {invoice.vendor.zipCode}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-12">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-100">
                                    <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr>
                                    <td className="py-4">
                                        <p className="font-bold text-gray-900 capitalize">{invoice.planId} Plan Subscription</p>
                                        <p className="text-sm text-gray-500 capitalize">{invoice.billingCycle} Billing Cycle</p>
                                    </td>
                                    <td className="py-4 text-right font-medium text-gray-900">
                                        ₹{invoice.amount.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{invoice.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>GST (18%)</span>
                                <span>₹{invoice.taxAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                                <span>Total</span>
                                <span>₹{invoice.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
                        <p className="mb-2">Thank you for your business!</p>
                        <p className="text-xs">If you have any questions about this invoice, please contact support@forgeindiaconnect.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

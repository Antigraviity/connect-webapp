"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiChevronLeft, FiShield, FiFileText } from "react-icons/fi";

function LegalContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "privacy") {
            setActiveTab("privacy");
        } else {
            setActiveTab("terms");
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Legal Information</h1>
                    <p className="text-gray-600 mt-2">Please read our terms and policies carefully.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("terms")}
                            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "terms"
                                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <FiFileText className="w-4 h-4" />
                            Terms of Service
                        </button>
                        <button
                            onClick={() => setActiveTab("privacy")}
                            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === "privacy"
                                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <FiShield className="w-4 h-4" />
                            Privacy Policy
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === "terms" ? (
                            <div className="prose prose-emerald max-w-none">
                                <h2>Terms of Service</h2>
                                <p className="text-gray-600 mb-6">Last updated: January 2026</p>

                                <h3>1. Acceptance of Terms</h3>
                                <p>
                                    By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                                </p>

                                <h3>2. Service Description</h3>
                                <p>
                                    We provide a platform for vendors to list and sell their services and products. We reserve the right to modify, suspend, or discontinue any aspect of our service at any time.
                                </p>

                                <h3>3. User Responsibilities</h3>
                                <p>
                                    You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
                                </p>

                                <h3>4. Subscription and Payments</h3>
                                <p>
                                    Subscription fees are billed in advance on a monthly or yearly basis. All payments are non-refundable unless otherwise stated in our refund policy.
                                </p>

                                <h3>5. Termination</h3>
                                <p>
                                    We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                </p>
                            </div>
                        ) : (
                            <div className="prose prose-emerald max-w-none">
                                <h2>Privacy Policy</h2>
                                <p className="text-gray-600 mb-6">Last updated: January 2026</p>

                                <h3>1. Information Collection</h3>
                                <p>
                                    We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, phone number, and payment information.
                                </p>

                                <h3>2. Use of Information</h3>
                                <p>
                                    We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to send you related information, including confirmations and invoices.
                                </p>

                                <h3>3. Information Sharing</h3>
                                <p>
                                    We do not share your personal information with third parties except as described in this policy. We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                                </p>

                                <h3>4. Data Security</h3>
                                <p>
                                    We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                                </p>

                                <h3>5. Cookies</h3>
                                <p>
                                    We use cookies and similar technologies to collect information about your activity, browser, and device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LegalPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        }>
            <LegalContent />
        </Suspense>
    );
}


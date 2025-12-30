"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiMail, FiShield, FiTrash2, FiAlertCircle, FiSave } from "react-icons/fi";

export default function AccountSettingsPage() {
    const [email, setEmail] = useState("john.doe@example.com");
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [saving, setSaving] = useState(false);

    const handleEmailChange = () => {
        if (!newEmail || !password) {
            alert("Please fill in all fields");
            return;
        }
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setEmail(newEmail);
            setNewEmail("");
            setPassword("");
            alert("Email updated successfully!");
        }, 1000);
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText === "Delete") {
            alert("Account deletion initiated. You will receive a confirmation email.");
            setShowDeleteConfirm(false);
            setDeleteConfirmText("");
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteConfirmText("");
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
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 text-sm">Change your email or delete your account</p>
                </div>
            </div>

            {/* Change Email */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <FiMail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Change Email Address</h2>
                        <p className="text-sm text-gray-500">Update the email associated with your account</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Email</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email address"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password to confirm"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    <div className="pt-2 text-right">
                        <button
                            onClick={handleEmailChange}
                            disabled={saving || !newEmail || !password}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl hover:shadow-lg shadow-md transition-all font-bold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                        >
                            <FiSave className="w-4 h-4" />
                            {saving ? "Updating..." : "Update Email"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <div className="flex gap-3">
                    <FiShield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-blue-900 mb-1">Security Notice</h3>
                        <p className="text-sm text-blue-700">
                            Changing your email will require verification. We'll send a confirmation link to your new email address.
                        </p>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border-2 border-red-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-50 rounded-xl">
                        <FiAlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
                        <p className="text-sm text-red-600">Irreversible actions - proceed with caution</p>
                    </div>
                </div>

                {!showDeleteConfirm ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                            <h3 className="font-bold text-gray-900 mb-2">Delete Account</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Once you delete your account, there is no going back. All your data, bookings, orders, and job applications will be permanently deleted.
                            </p>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                            >
                                <FiTrash2 className="w-4 h-4" />
                                Delete My Account
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-6 bg-red-50 rounded-xl border-2 border-red-300">
                            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                                <FiAlertCircle className="w-5 h-5" />
                                Are you absolutely sure?
                            </h3>
                            <p className="text-sm text-red-700 mb-4">
                                This will permanently delete your account and all associated data. This action <strong>cannot be undone</strong>.
                            </p>

                            {/* Confirmation Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-red-900 mb-2">
                                    Type <span className="font-bold bg-red-200 px-2 py-0.5 rounded">Delete</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="Type 'Delete' here"
                                    className="w-full px-4 py-3 bg-white border-2 border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-none text-gray-900"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== "Delete"}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                    Yes, Delete Forever
                                </button>
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

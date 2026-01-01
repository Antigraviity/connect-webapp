"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowLeft, FiMail, FiShield, FiTrash2, FiAlertCircle, FiSave, FiCheckCircle, FiClock } from "react-icons/fi";

export default function AccountSettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpStep, setShowOtpStep] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [saving, setSaving] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [emailSuccess, setEmailSuccess] = useState("");

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Password Strength State
    const [passwordStrength, setPasswordStrength] = useState({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecial: false,
        hasMinLength: false,
    });

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            const userDataString = localStorage.getItem("user");
            if (userDataString) {
                try {
                    const userData = JSON.parse(userDataString);
                    setUser(userData);
                    setEmail(userData.email);
                } catch (e) {
                    console.error("Error parsing user data from localStorage", e);
                }
            }
        };
        fetchUserData();
    }, []);

    // Countdown timer for OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleRequestOtp = async () => {
        setEmailError("");
        setEmailSuccess("");

        if (!newEmail) {
            setEmailError("Please enter a new email address");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        if (newEmail.toLowerCase() === email.toLowerCase()) {
            setEmailError("New email must be different from the current one");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/otp/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newEmail }),
            });

            const data = await response.json();

            if (data.success) {
                setShowOtpStep(true);
                setCountdown(60); // 1 minute resend limit
                setEmailSuccess(`Verification code sent to ${newEmail}`);

                // For development convenience, if OTP is returned in response, log it
                if (data.otp) {
                    console.log("DEV: OTP is", data.otp);
                }
            } else {
                setEmailError(data.message || "Failed to send OTP");
            }
        } catch (error) {
            console.error("Request OTP error:", error);
            setEmailError("An error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyOtp = async () => {
        setEmailError("");
        setEmailSuccess("");

        if (!otp) {
            setEmailError("Please enter the verification code");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch("/api/users/update-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    email: newEmail,
                    otp: otp
                }),
            });

            const data = await response.json();

            if (data.success) {
                setEmailSuccess(data.message);
                setEmail(newEmail);

                // Update local storage
                const updatedUser = { ...user, email: newEmail };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);

                // Reset fields
                setNewEmail("");
                setPassword("");
                setOtp("");
                setShowOtpStep(false);
            } else {
                setEmailError(data.message || "Failed to update email");
            }
        } catch (error) {
            console.error("Verify OTP error:", error);
            setEmailError("An error occurred. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmText === "Delete") {
            alert("Account deletion initiated. You will receive a confirmation email.");
            setShowDeleteConfirm(false);
            setDeleteConfirmText("");
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("Please fill in all password fields");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        const isStrengthValid =
            passwordStrength.hasLowercase &&
            passwordStrength.hasUppercase &&
            passwordStrength.hasNumber &&
            passwordStrength.hasSpecial &&
            passwordStrength.hasMinLength;

        if (!isStrengthValid) {
            setPasswordError("New password does not meet strength requirements");
            return;
        }

        setSaving(true);
        try {
            const userData = localStorage.getItem("user");
            const userId = userData ? JSON.parse(userData).id : null;

            if (!userId) {
                setPasswordError("User not found. Please log in again.");
                return;
            }

            const response = await fetch("/api/users/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setPasswordSuccess("Password updated successfully!");
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                setPasswordError(data.message || "Failed to update password");
            }
        } catch (error) {
            console.error("Change password error:", error);
            setPasswordError("An error occurred. Please try again.");
        } finally {
            setSaving(false);
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
                    {emailError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                            <FiAlertCircle className="w-4 h-4" />
                            {emailError}
                        </div>
                    )}
                    {emailSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                            <FiCheckCircle className="w-4 h-4" />
                            {emailSuccess}
                        </div>
                    )}

                    {!showOtpStep ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
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

                            <div className="pt-2 text-right">
                                <button
                                    onClick={handleRequestOtp}
                                    disabled={saving || !newEmail}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl transition-all font-bold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Processing..." : "Verify & Update"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                                <p className="text-sm text-blue-800">
                                    We've sent a 6-digit verification code to <strong>{newEmail}</strong>.
                                    Please enter it below to confirm your new email address.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code (OTP)</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-center text-2xl tracking-[1em] font-bold placeholder:text-sm placeholder:tracking-normal"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <button
                                    onClick={() => {
                                        setShowOtpStep(false);
                                        setOtp("");
                                        setEmailError("");
                                        setEmailSuccess("");
                                    }}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Change email address
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={saving || countdown > 0}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 font-medium text-sm hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiClock className="w-4 h-4" />
                                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                                    </button>

                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={saving || otp.length !== 6}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl transition-all font-bold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiCheckCircle className="w-4 h-4" />
                                        {saving ? "Verifying..." : "Verify & Update"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <FiShield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                        <p className="text-sm text-gray-500">Update your account security</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {passwordError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                            <FiAlertCircle className="w-4 h-4" />
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                            <FiSave className="w-4 h-4" />
                            {passwordSuccess}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => {
                                const val = e.target.value;
                                setPasswordData({ ...passwordData, newPassword: val });
                                setPasswordStrength({
                                    hasLowercase: /[a-z]/.test(val),
                                    hasUppercase: /[A-Z]/.test(val),
                                    hasNumber: /\d/.test(val),
                                    hasSpecial: /[@$!%*?&]/.test(val),
                                    hasMinLength: val.length >= 6,
                                });
                            }}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                        {passwordData.newPassword && (
                            <div className="mt-3 space-y-1.5 px-1">
                                <PasswordStrengthIndicator
                                    label="At least 6 characters"
                                    isValid={passwordStrength.hasMinLength}
                                />
                                <PasswordStrengthIndicator
                                    label="One lowercase letter"
                                    isValid={passwordStrength.hasLowercase}
                                />
                                <PasswordStrengthIndicator
                                    label="One uppercase letter"
                                    isValid={passwordStrength.hasUppercase}
                                />
                                <PasswordStrengthIndicator
                                    label="One number"
                                    isValid={passwordStrength.hasNumber}
                                />
                                <PasswordStrengthIndicator
                                    label="One special character (@$!%*?&)"
                                    isValid={passwordStrength.hasSpecial}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                        {passwordData.confirmPassword && (
                            <div className="mt-3 px-1">
                                <PasswordStrengthIndicator
                                    label="Passwords match"
                                    isValid={passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== ""}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-2 text-right">
                        <button
                            onClick={handlePasswordChange}
                            disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white rounded-xl transition-all font-bold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiSave className="w-4 h-4" />
                            {saving ? "Updating..." : "Update Password"}
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

function PasswordStrengthIndicator({ label, isValid }: { label: string; isValid: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${isValid ? "bg-green-500 scale-110" : "bg-gray-200"
                    }`}
            >
                {isValid && (
                    <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={4}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </div>
            <span className={`text-xs transition-colors duration-300 ${isValid ? "text-green-600 font-medium" : "text-gray-500"
                }`}>
                {label}
            </span>
        </div>
    );
}

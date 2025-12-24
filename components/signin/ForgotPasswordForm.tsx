"use client";

import { useState } from "react";
import Link from "next/link";

type Step = 1 | 2 | 3;
type ResetMethod = "email" | "phone";

export default function ForgotPasswordForm() {
  const [resetMethod, setResetMethod] = useState<ResetMethod>("email");
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value;

    // Format phone number - only digits, max 10
    if (name === "phone") {
      val = value.replace(/\D/g, "");
      if (val.length > 10) val = val.slice(0, 10);
    }

    // Update password strength indicators
    if (name === "newPassword") {
      setPasswordStrength({
        hasLowercase: /[a-z]/.test(val),
        hasUppercase: /[A-Z]/.test(val),
        hasNumber: /\d/.test(val),
        hasSpecial: /[@$!%*?&]/.test(val),
        hasMinLength: val.length >= 6,
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhone = () => {
    const newErrors: Record<string, string> = {};

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordReset = () => {
    const newErrors: Record<string, string> = {};

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must include uppercase, lowercase, number & special character";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on reset method
    const isValid = resetMethod === "email" ? validateEmail() : validatePhone();
    if (!isValid) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // TODO: Add actual OTP sending API call here
      console.log("Sending OTP via:", resetMethod);
      console.log("To:", resetMethod === "email" ? formData.email : formData.phone);
      
      setOtpSent(true);
      setSuccessMessage(
        resetMethod === "email"
          ? `OTP sent successfully to ${formData.email}`
          : `OTP sent successfully to +91 ${formData.phone}`
      );
      setIsLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter valid 6-digit OTP" }));
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // TODO: Add actual OTP verification API call here
      console.log("Verifying OTP:", otp);

      setSuccessMessage("OTP verified successfully!");
      setIsLoading(false);
      
      // Move to password reset step
      setTimeout(() => {
        setSuccessMessage("");
        setCurrentStep(2);
      }, 1500);
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordReset()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // TODO: Add actual password reset API call here
      console.log("Resetting password");

      setSuccessMessage("Password reset successful! Redirecting to sign in...");
      setIsLoading(false);
      setCurrentStep(3);

      // TODO: Redirect to sign in page after 2 seconds
      setTimeout(() => {
        // window.location.href = "/auth/login";
      }, 2000);
    }, 1000);
  };

  const handleResendOtp = async () => {
    setOtp("");
    setErrors((prev) => ({ ...prev, otp: "" }));
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // TODO: Add actual OTP resend API call here
      console.log("Resending OTP");
      
      setSuccessMessage(
        resetMethod === "email"
          ? `OTP resent to ${formData.email}`
          : `OTP resent to +91 ${formData.phone}`
      );
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-gradient-to-br from-primary-500 to-primary-500 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Forgot Password Form */}
            <div className="p-8 lg:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-md">
              {/* Back to Sign In Link */}
              <div className="mb-8">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  <span className="mr-2">←</span> Back to sign in
                </Link>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {currentStep === 3 ? "Password Reset" : "Forgot Password"}
                </h1>
                <p className="text-gray-600">
                  {currentStep === 3
                    ? "Your password has been successfully reset"
                    : currentStep === 2
                    ? "Enter your new password"
                    : "We'll send you a code to reset your password"}
                </p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-green-800 font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Success State - Step 3 */}
              {currentStep === 3 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    You can now sign in with your new password
                  </p>
                  <Link
                    href="/auth/login"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg"
                  >
                    Go to Sign In
                  </Link>
                </div>
              )}

              {/* Step 1: Request OTP */}
              {currentStep === 1 && (
                <form
                  onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                  className="space-y-5"
                >
                  {/* Reset Method Toggle */}
                  {!otpSent && (
                    <div className="mb-6 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setResetMethod("email")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                          resetMethod === "email"
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetMethod("phone")}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                          resetMethod === "phone"
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Phone
                      </button>
                    </div>
                  )}

                  {/* Email or Phone Input */}
                  {resetMethod === "email" ? (
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        disabled={otpSent || isLoading}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                          errors.email
                            ? "border-red-500 focus:ring-red-400"
                            : "border-gray-300 focus:ring-primary-300"
                        } ${otpSent || isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-700 select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          disabled={otpSent || isLoading}
                          className={`flex-1 px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                            errors.phone
                              ? "border-red-500 focus:ring-red-400"
                              : "border-gray-300 focus:ring-primary-300"
                          } ${otpSent || isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>
                  )}

                  {/* OTP Input */}
                  {otpSent && (
                    <div>
                      <label
                        htmlFor="otp"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          if (val.length <= 6) {
                            setOtp(val);
                            if (errors.otp) {
                              setErrors((prev) => ({ ...prev, otp: "" }));
                            }
                            if (successMessage) {
                              setSuccessMessage("");
                            }
                          }
                        }}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        disabled={isLoading}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 text-center text-lg tracking-widest ${
                          errors.otp
                            ? "border-red-500 focus:ring-red-400"
                            : "border-gray-300 focus:ring-primary-300"
                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      {errors.otp && (
                        <p className="text-xs text-red-500 mt-1">{errors.otp}</p>
                      )}
                      <div className="flex justify-between items-center mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                            setErrors({});
                            setSuccessMessage("");
                          }}
                          disabled={isLoading}
                          className="text-gray-600 text-sm hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Change {resetMethod === "email" ? "Email" : "Phone Number"}
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-blue-600 text-sm hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg flex items-center justify-center gap-2 ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>{otpSent ? "Verifying..." : "Sending..."}</span>
                      </>
                    ) : (
                      <>{otpSent ? "Verify OTP" : "Send OTP"}</>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Reset Password */}
              {currentStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                        errors.newPassword
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-primary-300"
                      } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                    {errors.newPassword && (
                      <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
                    )}
                    
                    {/* Password Strength Indicators */}
                    {formData.newPassword && (
                      <div className="mt-3 space-y-2">
                        <PasswordStrengthIndicator
                          label="Lowercase letter"
                          isValid={passwordStrength.hasLowercase}
                        />
                        <PasswordStrengthIndicator
                          label="Uppercase letter"
                          isValid={passwordStrength.hasUppercase}
                        />
                        <PasswordStrengthIndicator
                          label="Number"
                          isValid={passwordStrength.hasNumber}
                        />
                        <PasswordStrengthIndicator
                          label="Special character (@$!%*?&)"
                          isValid={passwordStrength.hasSpecial}
                        />
                        <PasswordStrengthIndicator
                          label="Minimum 6 characters"
                          isValid={passwordStrength.hasMinLength}
                        />
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter new password"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-primary-300"
                      } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg flex items-center justify-center gap-2 ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              )}

              {/* Back to Sign In Link - Footer */}
              {currentStep !== 3 && (
                <div className="mt-8 text-center text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Right Side - Mock Illustration */}
            <div className="hidden lg:flex relative bg-gradient-to-br from-yellow-400 to-orange-500 items-center justify-center p-12">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="2" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Mock Illustration - Password Reset */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                {/* Large Lock Illustration */}
                <div className="mb-8 relative">
                  <div className="w-48 h-48 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
                    <svg
                      className="w-32 h-32 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  
                  {/* Floating Key Icon */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                    <svg
                      className="w-12 h-12 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Text Content */}
                <h2 className="text-3xl font-bold text-white mb-4">
                  Secure Password Reset
                </h2>
                <p className="text-white/90 text-lg max-w-md">
                  Don't worry! We'll help you recover your account securely and quickly.
                </p>

                {/* Decorative Elements */}
                <div className="mt-8 flex gap-4">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-100"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Password Strength Indicator Component */
function PasswordStrengthIndicator({
  label,
  isValid,
}: {
  label: string;
  isValid: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
          isValid ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        {isValid && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span
        className={`text-xs transition-colors duration-300 ${
          isValid ? "text-green-600 font-medium" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

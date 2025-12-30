"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signInMethod, setSignInMethod] = useState<"password" | "otp">("password");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Check for redirect parameter in URL and storage
  useEffect(() => {
    // Priority: URL param > sessionStorage > localStorage
    const urlRedirect = searchParams.get('redirect');
    const sessionRedirect = sessionStorage.getItem('redirectAfterLogin');
    const localRedirect = localStorage.getItem('redirectAfterLogin');

    const finalRedirect = urlRedirect || sessionRedirect || localRedirect;

    if (finalRedirect) {
      setRedirectUrl(finalRedirect);
      console.log('📍 Redirect URL found:', finalRedirect);
    }
  }, [searchParams]);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notRegisteredError, setNotRegisteredError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value;

    // Format phone number - only digits, max 10
    if (name === "phone") {
      val = value.replace(/\D/g, "");
      if (val.length > 10) val = val.slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    // Clear error and success message when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (successMessage) {
      setSuccessMessage("");
    }
    if (notRegisteredError) {
      setNotRegisteredError(null);
    }
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtpForm = () => {
    const newErrors: Record<string, string> = {};

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling
    setSuccessMessage("");

    if (!validatePasswordForm()) return;

    setIsLoading(true);

    try {
      console.log('🔐 Attempting login...', { email: formData.email });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in the request
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('📥 Login response:', data);

      if (data.success && response.ok) {
        console.log('✅ Login successful! User type:', data.user.userType);
        console.log('🎯 Redirect URL from API:', data.redirectUrl);

        // Store user data in localStorage (token is in httpOnly cookie)
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('💾 Stored user data in localStorage');
        console.log('🍪 Token stored in httpOnly cookie by server');

        setSuccessMessage("Sign in successful! Redirecting...");

        // Check if there's a custom redirect URL from the query params or storage
        // Otherwise use the API's redirectUrl or default to buyer dashboard
        const sessionRedirect = sessionStorage.getItem('redirectAfterLogin');
        const localRedirect = localStorage.getItem('redirectAfterLogin');
        const finalRedirectUrl = redirectUrl || sessionRedirect || localRedirect || data.redirectUrl || '/buyer/dashboard';
        console.log('🚀 Final redirect URL:', finalRedirectUrl);

        // Clear the stored redirect URLs after using them
        sessionStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');

        // Force redirect with multiple methods to ensure it works
        console.log('🔄 Attempting redirect...');

        // Method 1: window.location.replace (cannot be blocked by back button)
        window.location.replace(finalRedirectUrl);

        // Method 2: Fallback if replace doesn't work
        setTimeout(() => {
          if (window.location.pathname !== finalRedirectUrl) {
            console.log('🔄 Fallback: Using window.location.href');
            window.location.href = finalRedirectUrl;
          }
        }, 100);

        // Method 3: Ultimate fallback
        setTimeout(() => {
          if (window.location.pathname !== finalRedirectUrl) {
            console.log('🔄 Ultimate fallback: Forcing navigation');
            window.location.assign(finalRedirectUrl);
          }
        }, 300);
      } else {
        console.error('❌ Login failed:', data.message);
        setErrors({ email: data.message || 'Login failed. Please try again.' });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setErrors({ email: 'An error occurred. Please try again.' });
      setIsLoading(false);
    }
    // Don't set isLoading to false on success - keep it true during redirect
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateOtpForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        // Display OTP in the success message as requested
        setSuccessMessage(`OTP sent successfully to +91 ${formData.phone}${data.otp ? `. OTP: ${data.otp}` : ''}`);
      } else {
        setErrors({ phone: data.message || 'Failed to send OTP' });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setErrors({ phone: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!otp || otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter valid 6-digit OTP" }));
      return;
    }

    setIsLoading(true);

    try {
      // Call the OTP login API
      const response = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phone: formData.phone,
          otp: otp,
        }),
      });

      const data = await response.json();
      console.log('📥 OTP Login response:', data);

      if (data.success && response.ok) {
        console.log('✅ OTP Login successful! User type:', data.user.userType);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccessMessage("Sign in successful! Redirecting...");

        // Determine redirect URL
        const sessionRedirect = sessionStorage.getItem('redirectAfterLogin');
        const localRedirect = localStorage.getItem('redirectAfterLogin');
        const finalRedirectUrl = redirectUrl || sessionRedirect || localRedirect || data.redirectUrl || '/buyer/dashboard';
        
        // Clear stored redirect URLs
        sessionStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');

        // Redirect
        setTimeout(() => {
          window.location.replace(finalRedirectUrl);
        }, 1000);
      } else {
        // Check if user is not registered
        if (data.notRegistered) {
          setErrors((prev) => ({ 
            ...prev, 
            otp: "" 
          }));
          setSuccessMessage("");
          // Show a prominent error alert for unregistered users
          setNotRegisteredError(data.message || 'No account found with this phone number. Please register first.');
          // Reset OTP state to allow user to see the error
          setOtpSent(false);
          setOtp("");
        } else {
          setErrors((prev) => ({ 
            ...prev, 
            otp: data.message || 'OTP verification failed. Please try again.' 
          }));
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error('💥 OTP Login error:', error);
      setErrors((prev) => ({ 
        ...prev, 
        otp: 'An error occurred. Please try again.' 
      }));
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp("");
    setErrors((prev) => ({ ...prev, otp: "" }));
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`OTP resent successfully to +91 ${formData.phone}${data.otp ? `. OTP: ${data.otp}` : ''}`);
      } else {
        setErrors({ phone: data.message || 'Failed to resend OTP' });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setErrors({ phone: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToOtpMethod = () => {
    setSignInMethod("otp");
    setErrors({});
    setOtpSent(false);
    setOtp("");
    setSuccessMessage("");
    setNotRegisteredError(null);
  };

  const switchToPasswordMethod = () => {
    setSignInMethod("password");
    setErrors({});
    setOtpSent(false);
    setOtp("");
    setSuccessMessage("");
    setNotRegisteredError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-primary-500 to-primary-500 rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Sign In Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-md">
            {/* Back to Website Link */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                <span className="mr-2">←</span> Back to website
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
              <p className="text-gray-600">
                Welcome back! Please sign in to continue
              </p>
            </div>

            {/* Not Registered Error Alert */}
            {notRegisteredError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">{notRegisteredError}</p>
                    <Link
                      href="/auth/register"
                      className="inline-block mt-2 text-sm text-red-700 hover:text-red-900 font-semibold underline"
                    >
                      Click here to Register →
                    </Link>
                  </div>
                  <button
                    onClick={() => setNotRegisteredError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

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

            {/* Password Sign In Form */}
            {signInMethod === "password" && (
              <div className="space-y-5">
                {/* Email */}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('password')?.focus();
                      }
                    }}
                    placeholder="Enter your email"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${errors.email
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-primary-300"
                      } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePasswordSignIn(e);
                      }
                    }}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${errors.password
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-primary-300"
                      } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handlePasswordSignIn}
                  disabled={isLoading}
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg flex items-center justify-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
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
                      <span>Signing In...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Sign in with OTP Option */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={switchToOtpMethod}
                    disabled={isLoading}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign in using OTP instead
                  </button>
                </div>
              </div>
            )}

            {/* OTP Sign In Form */}
            {signInMethod === "otp" && (
              <form
                onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                className="space-y-5"
              >
                {/* Phone Number */}
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
                      className={`flex-1 px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${errors.phone
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-primary-300"
                        } ${otpSent || isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* OTP Input (shown after OTP is sent) */}
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
                      className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 text-center text-lg tracking-widest ${errors.otp
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
                        ← Change Phone Number
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
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg flex items-center justify-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
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
                      <span>{otpSent ? "Verifying..." : "Sending OTP..."}</span>
                    </>
                  ) : (
                    <>{otpSent ? "Verify OTP & Sign In" : "Send OTP"}</>
                  )}
                </button>

                {/* Sign in with Password Option */}
                {!otpSent && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={switchToPasswordMethod}
                      disabled={isLoading}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sign in using password instead
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Register Link */}
            <div className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Right Side - Mock Illustration */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-yellow-400 to-orange-500 items-center justify-center p-12">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="signin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="2" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#signin-grid)" />
              </svg>
            </div>

            {/* Mock Illustration - Welcome Back */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              {/* Large User Shield Illustration */}
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>

                {/* Floating Checkmark Icon */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <svg
                    className="w-12 h-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome Back!
              </h2>
              <p className="text-white/90 text-lg max-w-md">
                Sign in to access your account and continue your journey with us.
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
  );
}

export default function SignInForm() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    }>
      <SignInFormContent />
    </Suspense>
  );
}

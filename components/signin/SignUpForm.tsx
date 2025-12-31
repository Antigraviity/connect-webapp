"use client";

import { useState, useEffect } from "react";
import { FaStore, FaUser, FaTimes, FaBriefcase, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import OTPDisplay from "./OTPDisplay";

type UserType = "seller" | "buyer" | "employer";
type Step = 1 | 2 | 3;

/* ---------- CATEGORY & SERVICE DATA ---------- */
const categoriesWithServices: Record<string, string[]> = {
  "Beauty & Wellness": [
    "Salon Services",
    "Bridal Makeup & Grooming",
    "Massage & Spa Therapy",
    "Mehndi / Henna Artists",
    "Nail Art & Extensions",
    "Facial & Skin Care",
    "Men's Grooming",
    "Beauty Parlour at Home",
    "Ayurvedic & Herbal Treatments",
  ],
  "Health & Medical": [
    "Doctor Consultation",
    "Diagnostic & Lab Test Booking",
    "Physiotherapy at Home",
    "Nursing & Elderly Care",
    "Medicine Delivery",
    "Health Checkup Packages",
    "Dental Services",
    "Eye & Vision Clinics",
    "Nutrition & Diet Counseling",
    "Mental Wellness Therapy",
  ],
  "Home Services": [
    "Electrician Services",
    "Plumber Services",
    "Carpenter & Furniture Repair",
    "House Cleaning & Sanitization",
    "AC / Fridge / Washing Machine Repair",
    "Painting & Interior Work",
    "Pest Control",
    "Home Deep Cleaning",
    "Sofa & Carpet Cleaning",
    "Appliance Installation",
  ],
  Automotive: [
    "Car Wash & Detailing",
    "Bike Service & Maintenance",
    "Car Repair & Mechanics",
    "Battery Replacement",
    "Tyre Replacement & Wheel Alignment",
    "On-Road Breakdown Assistance",
    "Car AC & Electrical Work",
    "Vehicle Pickup & Drop Service",
    "Insurance Renewal Support",
  ],
  "Food & Catering": [
    "Event & Wedding Catering",
    "Corporate Catering",
    "Home Chef / Tiffin Services",
    "Bakery & Dessert Catering",
    "South Indian Catering",
    "North Indian Catering",
    "Continental / Multi-Cuisine Catering",
    "Small Gathering / Party Caterers",
    "Lunch Box & Office Meal Delivery",
  ],
  "Street Foods": [
    "Chat / Snack Stalls",
    "Juice & Shake Vendors",
    "Tea & Coffee Stalls",
    "Fast Food Corners",
    "Chinese & Tandoori Stalls",
    "Food Truck Vendors",
    "Evening Snacks & Bajjis",
    "Local Specialties (Parotta, Dosa, Kothu)",
  ],
};

const employeeRanges = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+"
];

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [userType, setUserType] = useState<UserType>("buyer");
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [displayedOtp, setDisplayedOtp] = useState(""); // OTP to display on form
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [displayedEmailOtp, setDisplayedEmailOtp] = useState(""); // Email OTP to display on form
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true);
    
    // Check URL parameter for user type (e.g., ?type=seller)
    const typeParam = searchParams.get('type');
    if (typeParam === 'seller' || typeParam === 'employer' || typeParam === 'buyer') {
      setUserType(typeParam as UserType);
      console.log('📝 Pre-selected user type from URL:', typeParam);
    }
    
    // If user is already logged in, pre-fill their phone number
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.phone) {
          // Extract phone number (remove +91 prefix if present)
          let phone = userData.phone.replace(/^\+91/, '').replace(/\D/g, '');
          if (phone.length === 10) {
            setFormData(prev => ({
              ...prev,
              phone: phone
            }));
            console.log('📱 Pre-filled phone from logged-in user:', phone);
          }
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [searchParams]);

  // Loading states for buttons
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Buyer fields
    fullName: "",
    phone: "",
    buyerUsername: "",
    buyerEmail: "",
    buyerPassword: "",
    buyerConfirmPassword: "",
    
    // Seller fields
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: "",
    category: "",
    serviceName: "",
    businessAddress: "",
    pincode: "",
    documentType: "",
    
    // Employer fields
    accountType: "company",
    hiringFor: "company",
    companyName: "",
    employeeCount: "",
    designation: "",
    companyAddress: "",
  });

  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
  });

  /* ---------- Validation Logic ---------- */
  const validateField = (name: string, value: string) => {
    let error = "";

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Full name is required.";
        break;
      case "username":
        if (!value.trim()) error = "Username is required.";
        break;
      case "buyerUsername":
        if (!value.trim()) error = "Username is required.";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email address.";
        break;
      case "buyerEmail":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Enter a valid email address.";
        break;
      case "phone":
        if (!/^\d{10}$/.test(value)) error = "Phone number must be 10 digits.";
        break;
      case "password":
        if (!passwordRegex.test(value))
          error =
            "Password must include uppercase, lowercase, number & special character.";
        break;
      case "buyerPassword":
        if (!passwordRegex.test(value))
          error =
            "Password must include uppercase, lowercase, number & special character.";
        break;
      case "confirmPassword":
        if (value !== formData.password)
          error = "Passwords do not match.";
        break;
      case "buyerConfirmPassword":
        if (value !== formData.buyerPassword)
          error = "Passwords do not match.";
        break;
      case "businessName":
        if (userType === "seller" && !value.trim())
          error = "Business name is required.";
        break;
      case "businessType":
        if (userType === "seller" && !value)
          error = "Business type is required.";
        break;
      case "category":
        if (userType === "seller" && !value)
          error = "Please select a category.";
        break;
      case "serviceName":
        if (userType === "seller" && !value)
          error = "Please select a service.";
        break;
      case "businessAddress":
        if (userType === "seller" && !value.trim())
          error = "Business address is required.";
        break;
      case "pincode":
        if ((userType === "seller" || userType === "employer") && !/^\d{6}$/.test(value))
          error = "Pincode must be 6 digits.";
        break;
      case "documentType":
        // Document type is optional for seller
        break;
      // Employer validations
      case "accountType":
        if (userType === "employer" && !value)
          error = "Please select account type.";
        break;
      case "hiringFor":
        if (userType === "employer" && currentStep === 3 && !value)
          error = "Please select hiring for.";
        break;
      case "companyName":
        if (userType === "employer" && currentStep === 3 && !value.trim())
          error = "Company name is required.";
        break;
      case "employeeCount":
        if (userType === "employer" && currentStep === 3 && !value)
          error = "Please select employee count.";
        break;
      case "designation":
        if (userType === "employer" && currentStep === 3 && !value.trim())
          error = "Designation is required.";
        break;
      case "companyAddress":
        if (userType === "employer" && currentStep === 3 && !value.trim())
          error = "Company address is required.";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  /* ---------- Handle Change (with Live Validation) ---------- */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "phone") {
      val = value.replace(/\D/g, "");
      if (val.length > 10) val = val.slice(0, 10);
    }

    if (name === "pincode") {
      val = value.replace(/\D/g, "");
      if (val.length > 6) val = val.slice(0, 6);
    }

    // Update password strength indicators
    if (name === "password" || name === "buyerPassword") {
      setPasswordStrength({
        hasLowercase: /[a-z]/.test(val),
        hasUppercase: /[A-Z]/.test(val),
        hasNumber: /\d/.test(val),
        hasSpecial: /[@$!%*?&]/.test(val),
        hasMinLength: val.length >= 6,
      });
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
    validateField(name, val);

    if (name === "category") {
      setSelectedCategory(val);
      setFormData((prev) => ({ ...prev, serviceName: "" }));
    }
  };

  /* ---------- OTP Functions for Buyer Step 1 (Mobile) ---------- */
  const handleBuyerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneError = validateField("phone", formData.phone);
    if (phoneError) return;

    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${formData.phone}` })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        // Store OTP for display in development
        if (data.otp) {
          setDisplayedOtp(data.otp);
          console.log('🔐 OTP:', data.otp);
        }
        setNotification({
          type: "success",
          message: `OTP sent to +91 ${formData.phone}`
        });
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Failed to send OTP'
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to send OTP. Please try again.'
      });
    } finally {
      setIsSendingOtp(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleBuyerVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter valid 6-digit OTP" }));
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `+91${formData.phone}`,
          otp: otp 
        })
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: "success",
          message: "Mobile number verified successfully!"
        });
        setTimeout(() => {
          setNotification(null);
          setOtpSent(false);
          setOtp("");
          setCurrentStep(2);
          setIsVerifyingOtp(false);
        }, 1500);
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Invalid OTP'
        });
        setTimeout(() => setNotification(null), 5000);
        setIsVerifyingOtp(false);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to verify OTP. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
      setIsVerifyingOtp(false);
    }
  };

  /* ---------- Email OTP Functions for Buyer Step 2 ---------- */
  const handleBuyerSendEmailOtp = async () => {
    const emailError = validateField("buyerEmail", formData.buyerEmail);
    if (emailError) return;

    setIsSendingEmailOtp(true);
    try {
      const response = await fetch('/api/otp/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.buyerEmail })
      });

      const data = await response.json();

      if (data.success) {
        setEmailOtpSent(true);
        // Store OTP for display in development
        if (data.otp) {
          setDisplayedEmailOtp(data.otp);
          console.log('📧 Email OTP:', data.otp);
        }
        setNotification({
          type: "success",
          message: `OTP sent to ${formData.buyerEmail}`
        });
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Failed to send email OTP'
        });
      }
    } catch (error) {
      console.error('Send Email OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to send email OTP. Please try again.'
      });
    } finally {
      setIsSendingEmailOtp(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleBuyerStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all step 2 fields
    const fieldsToValidate = ["buyerUsername", "buyerEmail", "buyerPassword", "buyerConfirmPassword"];
    let hasError = false;
    fieldsToValidate.forEach((field) => {
      const err = validateField(field, (formData as any)[field]);
      if (err) hasError = true;
    });

    // If basic field validation fails, stop here
    if (hasError) {
      setNotification({
        type: "error",
        message: "Please fill in all required fields correctly."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Check if email OTP was sent (user clicked "Verify Email ID" button)
    if (!emailOtpSent) {
      setNotification({
        type: "error",
        message: "Please click on 'Verify Email ID' to receive OTP on your email."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // If OTP was sent, check if user entered the OTP
    if (!emailOtp || emailOtp.length !== 6) {
      setErrors((prev) => ({ ...prev, emailOtp: "Please enter valid 6-digit email OTP" }));
      setNotification({
        type: "error",
        message: "Please enter the 6-digit OTP sent to your email."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Verify email OTP
    setIsSubmitting(true);
    try {
      const verifyResponse = await fetch('/api/otp/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.buyerEmail,
          otp: emailOtp 
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setNotification({
          type: "error",
          message: verifyData.message || 'Invalid email OTP'
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      // Email OTP verified successfully - Now register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'buyer',
          phone: formData.phone,
          fullName: formData.fullName,
          buyerUsername: formData.buyerUsername,
          buyerEmail: formData.buyerEmail,
          buyerPassword: formData.buyerPassword,
        })
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        setNotification({
          type: "success",
          message: "Registration successful! Redirecting to dashboard..."
        });
        
        // Store user data in localStorage (token is in httpOnly cookie)
        localStorage.setItem('user', JSON.stringify(registerData.user));
        console.log('💾 Stored user data in localStorage');
        console.log('🍪 Token stored in httpOnly cookie by server');
        console.log('🎯 Redirecting to:', registerData.redirectUrl);
        
        // Wait longer to ensure cookie is fully set before redirect
        setTimeout(() => {
          window.location.href = registerData.redirectUrl || '/buyer/dashboard';
        }, 2000);
      } else {
        setNotification({
          type: "error",
          message: registerData.message || 'Registration failed'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setNotification({
        type: "error",
        message: 'Failed to complete registration. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- OTP Functions for Seller Step 1 ---------- */
  const handleSellerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneError = validateField("phone", formData.phone);
    if (phoneError) return;

    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${formData.phone}` })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        // Store OTP for display in development
        if (data.otp) {
          setDisplayedOtp(data.otp);
          console.log('🔐 Seller OTP:', data.otp);
        }
        setNotification({
          type: "success",
          message: `OTP sent to +91 ${formData.phone}`
        });
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Failed to send OTP'
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to send OTP. Please try again.'
      });
    } finally {
      setIsSendingOtp(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleSellerVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter valid 6-digit OTP" }));
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `+91${formData.phone}`,
          otp: otp 
        })
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: "success",
          message: "Mobile number verified successfully!"
        });
        setTimeout(() => {
          setNotification(null);
          setOtpSent(false);
          setOtp("");
          setCurrentStep(2);
        }, 1500);
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Invalid OTP'
        });
        setTimeout(() => setNotification(null), 5000);
        setIsVerifyingOtp(false);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to verify OTP. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
      setIsVerifyingOtp(false);
    }
  };

  /* ---------- Step 2 Navigation for Seller ---------- */
  const handleSellerStep2Next = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate step 2: Business Information
    const visibleFields = ["businessName", "businessType", "category", "serviceName", "businessAddress", "pincode"];

    let hasError = false;
    visibleFields.forEach((field) => {
      const err = validateField(field, (formData as any)[field]);
      if (err) hasError = true;
    });

    if (hasError) return;

    // Move to step 3
    setCurrentStep(3);
  };

  /* ---------- Email OTP Functions for Seller Step 3 ---------- */
  const handleSellerSendEmailOtp = async () => {
    const emailError = validateField("email", formData.email);
    if (emailError) return;

    setIsSendingEmailOtp(true);
    try {
      const response = await fetch('/api/otp/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (data.success) {
        setEmailOtpSent(true);
        // Store OTP for display in development
        if (data.otp) {
          setDisplayedEmailOtp(data.otp);
          console.log('📧 Seller Email OTP:', data.otp);
        }
        setNotification({
          type: "success",
          message: `OTP sent to ${formData.email}`
        });
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Failed to send email OTP'
        });
      }
    } catch (error) {
      console.error('Send Email OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to send email OTP. Please try again.'
      });
    } finally {
      setIsSendingEmailOtp(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  /* ---------- Seller Final Registration Submit ---------- */
  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate step 3: User details
    const visibleFields = ["username", "email", "password", "confirmPassword"];

    let hasError = false;
    visibleFields.forEach((field) => {
      const err = validateField(field, (formData as any)[field]);
      if (err) hasError = true;
    });

    // If basic field validation fails, stop here
    if (hasError) {
      setNotification({
        type: "error",
        message: "Please fill in all required fields correctly."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Check if email OTP was sent (user clicked "Verify Email ID" button)
    if (!emailOtpSent) {
      setNotification({
        type: "error",
        message: "Please click on 'Verify Email ID' to receive OTP on your email."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // If OTP was sent, check if user entered the OTP
    if (!emailOtp || emailOtp.length !== 6) {
      setErrors((prev) => ({ ...prev, emailOtp: "Please enter valid 6-digit email OTP" }));
      setNotification({
        type: "error",
        message: "Please enter the 6-digit OTP sent to your email."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Verify email OTP first
    setIsSubmitting(true);
    try {
      const verifyResponse = await fetch('/api/otp/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          otp: emailOtp 
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setNotification({
          type: "error",
          message: verifyData.message || 'Invalid email OTP'
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      // Email OTP verified successfully - Now register the seller
      console.log('✅ Email verified, registering seller...');
      
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'seller',
          phone: formData.phone,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          businessType: formData.businessType,
          category: formData.category,
          serviceName: formData.serviceName,
          businessAddress: formData.businessAddress,
          pincode: formData.pincode,
          documentType: formData.documentType,
        })
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        setNotification({
          type: "success",
          message: "Registration successful! Redirecting to dashboard..."
        });
        
        console.log('🎉 Seller registered successfully!', registerData);
        
        // Store user data in localStorage (token is in httpOnly cookie)
        localStorage.setItem('user', JSON.stringify(registerData.user));
        console.log('💾 Stored user data in localStorage');
        console.log('🍪 Token stored in httpOnly cookie by server');
        console.log('🎯 Redirecting to:', registerData.redirectUrl);
        
        // Wait longer to ensure cookie is fully set before redirect
        setTimeout(() => {
          window.location.href = registerData.redirectUrl || '/vendor/dashboard';
        }, 2000);
      } else {
        setNotification({
          type: "error",
          message: registerData.message || 'Registration failed'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setNotification({
        type: "error",
        message: 'Failed to complete registration. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Employer OTP Functions for Step 1 ---------- */
  const handleEmployerSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneError = validateField("phone", formData.phone);
    if (phoneError) return;

    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${formData.phone}` })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        // Store OTP for display in development
        if (data.otp) {
          setDisplayedOtp(data.otp);
          console.log('🔐 Employer OTP:', data.otp);
        }
        setNotification({
          type: "success",
          message: `OTP sent to +91 ${formData.phone}`
        });
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Failed to send OTP'
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to send OTP. Please try again.'
      });
    } finally {
      setIsSendingOtp(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleEmployerVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter valid 6-digit OTP" }));
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: `+91${formData.phone}`,
          otp: otp 
        })
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          type: "success",
          message: "Mobile number verified successfully!"
        });
        setTimeout(() => {
          setNotification(null);
          setOtpSent(false);
          setOtp("");
          setCurrentStep(2);
        }, 1500);
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Invalid OTP'
        });
        setTimeout(() => setNotification(null), 5000);
        setIsVerifyingOtp(false);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to verify OTP. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
      setIsVerifyingOtp(false);
    }
  };

  /* ---------- Email OTP Functions for Employer Step 2 ---------- */
  const handleEmployerSendEmailOtp = async () => {
    const emailError = validateField("email", formData.email);
    if (emailError) return;

    setIsSendingEmailOtp(true);
    try {
      const response = await fetch('/api/otp/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (data.success) {
        setEmailOtpSent(true);
        // Store OTP for display in development
        if (data.otp) {
          setDisplayedEmailOtp(data.otp);
          console.log('📧 Employer Email OTP:', data.otp);
        }
        setNotification({
          type: "success",
          message: `OTP sent to ${formData.email}`
        });
      } else {
        setNotification({
          type: "error",
          message: data.message || 'Failed to send email OTP'
        });
      }
    } catch (error) {
      console.error('Send Email OTP error:', error);
      setNotification({
        type: "error",
        message: 'Failed to send email OTP. Please try again.'
      });
    } finally {
      setIsSendingEmailOtp(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  /* ---------- Employer Step 2 to Step 3 Navigation ---------- */
  const handleEmployerStep2Next = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 2: Basic details - validate all fields
    const fieldsToValidate = ["accountType", "fullName", "email", "password"];
    let hasError = false;
    fieldsToValidate.forEach((field) => {
      const err = validateField(field, (formData as any)[field]);
      if (err) hasError = true;
    });

    // If basic field validation fails, stop here
    if (hasError) {
      setNotification({
        type: "error",
        message: "Please fill in all required fields correctly."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Check if email OTP was sent (user clicked "Verify Email ID" button)
    if (!emailOtpSent) {
      setNotification({
        type: "error",
        message: "Please click on 'Verify Email ID' to receive OTP on your email."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // If OTP was sent, check if user entered the OTP
    if (!emailOtp || emailOtp.length !== 6) {
      setErrors((prev) => ({ ...prev, emailOtp: "Please enter valid 6-digit email OTP" }));
      setNotification({
        type: "error",
        message: "Please enter the 6-digit OTP sent to your email."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Verify email OTP
    setIsSubmitting(true);
    try {
      const verifyResponse = await fetch('/api/otp/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          otp: emailOtp 
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setNotification({
          type: "error",
          message: verifyData.message || 'Invalid email OTP'
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      // All validations passed - move to step 3
      setNotification({
        type: "success",
        message: "Email verified! Proceeding to next step."
      });
      setTimeout(() => {
        setNotification(null);
        setCurrentStep(3);
      }, 1000);
    } catch (error) {
      console.error('Email verification error:', error);
      setNotification({
        type: "error",
        message: 'Failed to verify email. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Employer Registration Submit (Step 3) ---------- */
  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate step 3 fields
    const fieldsToValidate = ["hiringFor", "companyName", "employeeCount", "designation", "pincode", "companyAddress"];
    let hasError = false;
    fieldsToValidate.forEach((field) => {
      const err = validateField(field, (formData as any)[field]);
      if (err) hasError = true;
    });

    // Check if email was verified in step 2
    if (!emailOtp || emailOtp.length !== 6) {
      setNotification({
        type: "error",
        message: "Please go back to Step 2 and verify your email address with OTP before submitting."
      });
      setTimeout(() => setNotification(null), 5000);
      hasError = true;
    }

    if (hasError) {
      setNotification({
        type: "error",
        message: "Please fill in all required fields correctly."
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Register the employer
    setIsSubmitting(true);
    try {
      console.log('💼 Registering employer...');
      
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'employer',
          phone: formData.phone,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType,
          hiringFor: formData.hiringFor,
          companyName: formData.companyName,
          employeeCount: formData.employeeCount,
          designation: formData.designation,
          pincode: formData.pincode,
          companyAddress: formData.companyAddress,
        })
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        setNotification({
          type: "success",
          message: "Registration successful! Redirecting to dashboard..."
        });
        
        console.log('🎉 Employer registered successfully!', registerData);
        
        // Store user data in localStorage (token is in httpOnly cookie)
        localStorage.setItem('user', JSON.stringify(registerData.user));
        console.log('💾 Stored user data in localStorage');
        console.log('🍪 Token stored in httpOnly cookie by server');
        console.log('🎯 Redirecting to:', registerData.redirectUrl);
        
        // Wait longer to ensure cookie is fully set before redirect
        setTimeout(() => {
          window.location.href = registerData.redirectUrl || '/company/dashboard';
        }, 2000);
      } else {
        setNotification({
          type: "error",
          message: registerData.message || 'Registration failed'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setNotification({
        type: "error",
        message: 'Failed to complete registration. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (userType === "buyer") {
      setCurrentStep((prev) => (prev > 1 ? (prev - 1) as any : prev));
      if (currentStep === 2) {
        setEmailOtpSent(false);
        setEmailOtp("");
      }
    } else if (userType === "seller") {
      setCurrentStep((prev) => (prev > 1 ? (prev - 1) as any : prev));
      if (currentStep === 2) {
        setOtpSent(false);
        setOtp("");
      } else if (currentStep === 3) {
        setEmailOtpSent(false);
        setEmailOtp("");
      }
    } else if (userType === "employer") {
      setCurrentStep((prev) => (prev > 1 ? (prev - 1) as any : prev));
      if (currentStep === 2) {
        setOtpSent(false);
        setOtp("");
      } else if (currentStep === 3) {
        setEmailOtpSent(false);
        setEmailOtp("");
      }
    }
  };

  // Disable toggles based on step and OTP status
  const isAnyDisabled = (currentStep > 1) || otpSent;

  /* ---------- Render ---------- */
  // Show loading state until component is mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-300 to-primary-500">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8 mx-3 my-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-300 to-primary-500">
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8 mx-3 my-10 transition-all duration-300">
        {/* Back to website */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
          >
            ← Back to website
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {userType === "buyer"
              ? "Sign up to book service or apply job"
              : userType === "seller"
              ? "Register as a seller to join with us"
              : "Register as an employer"}
          </h1>
          <p className="text-gray-600 text-sm">
            {userType === "buyer"
              ? "Create your buyer account to explore services and job opportunities"
              : userType === "seller"
              ? "Create your seller account to connect with customers and grow your business"
              : "Create your employer account to post jobs and find talent"}
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 animate-slideIn ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200"
                : notification.type === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            {notification.type === "success" ? (
              <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : notification.type === "error" ? (
              <FaExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <FaExclamationCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : notification.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-full p-1 shadow-sm">
            <ToggleButton
              active={userType === "buyer"}
              disabled={isAnyDisabled && userType !== "buyer"}
              label="Buyer"
              icon={<FaUser className="w-5 h-5" />}
              onClick={() => {
                if (currentStep === 1 && !otpSent) {
                  setUserType("buyer");
                  setCurrentStep(1);
                  setOtp("");
                }
              }}
            />
            <ToggleButton
              active={userType === "seller"}
              disabled={isAnyDisabled && userType !== "seller"}
              label="Seller"
              icon={<FaStore className="w-5 h-5" />}
              onClick={() => {
                if (currentStep === 1 && !otpSent) {
                  setUserType("seller");
                  setCurrentStep(1);
                }
              }}
            />
            <ToggleButton
              active={userType === "employer"}
              disabled={isAnyDisabled && userType !== "employer"}
              label="Employer"
              icon={<FaBriefcase className="w-5 h-5" />}
              onClick={() => {
                if (currentStep === 1 && !otpSent) {
                  setUserType("employer");
                  setCurrentStep(1);
                }
              }}
            />
          </div>
        </div>

        {/* Steps - Show for all user types */}
        {(userType === "buyer" || userType === "seller" || userType === "employer") && (
          <div className="flex justify-center items-center gap-3 mb-8">
            {userType === "buyer" ? (
              // Buyer has 2 steps
              [1, 2].map((step) => (
                <div key={step} className="flex items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step !== 2 && <div className="w-10 h-0.5 bg-gray-300"></div>}
                </div>
              ))
            ) : userType === "seller" ? (
              // Seller has 3 steps
              [1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step !== 3 && <div className="w-10 h-0.5 bg-gray-300"></div>}
                </div>
              ))
            ) : (
              // Employer has 3 steps
              [1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step !== 3 && <div className="w-10 h-0.5 bg-gray-300"></div>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Form */}
        {userType === "buyer" ? (
          /* ========== BUYER REGISTRATION (2 Steps with OTP) ========== */
          <form onSubmit={currentStep === 1 ? (otpSent ? handleBuyerVerifyOtp : handleBuyerSendOtp) : handleBuyerStep2Submit} className="space-y-5 transition-all duration-300">
            {/* STEP 1: Mobile OTP Verification */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormPhone
                  formData={formData}
                  handleChange={handleChange}
                  error={errors.phone}
                  disabled={otpSent}
                  required={true}
                />

                {otpSent && (
                  <div>
                    {/* Display OTP in Development */}
                    <OTPDisplay otp={displayedOtp} label="Mobile OTP" />
                    
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) {
                          setOtp(val);
                          if (errors.otp) {
                            setErrors((prev) => ({ ...prev, otp: "" }));
                          }
                        }
                      }}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none text-center text-lg tracking-widest ${
                        errors.otp
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-blue-400"
                      }`}
                    />
                    {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}
                    
                    <div className="flex justify-between items-center mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          setErrors((prev) => ({ ...prev, otp: "" }));
                        }}
                        className="text-gray-600 text-sm hover:underline flex items-center gap-1"
                      >
                        ← Change Phone Number
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setOtp("");
                          setIsSendingOtp(true);
                          try {
                            const response = await fetch('/api/otp/send', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phone: `+91${formData.phone}` })
                            });

                            const data = await response.json();

                            if (data.success) {
                              // Store OTP for display in development
                              if (data.otp) {
                                setDisplayedOtp(data.otp);
                                console.log('🔐 Resent OTP:', data.otp);
                              }
                              setNotification({
                                type: "success",
                                message: `OTP resent to +91 ${formData.phone}`
                              });
                            } else {
                              setNotification({
                                type: "error",
                                message: data.message || 'Failed to resend OTP'
                              });
                            }
                          } catch (error) {
                            console.error('Resend OTP error:', error);
                            setNotification({
                              type: "error",
                              message: 'Failed to resend OTP. Please try again.'
                            });
                          } finally {
                            setIsSendingOtp(false);
                            setTimeout(() => setNotification(null), 5000);
                          }
                        }}
                        disabled={isSendingOtp}
                        className={`text-sm ${isSendingOtp ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
                      >
                        {isSendingOtp ? "Resending..." : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: User Details & Email Verification */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <ValidatedField
                  label="Username"
                  name="buyerUsername"
                  value={formData.buyerUsername}
                  onChange={handleChange}
                  error={errors.buyerUsername}
                  placeholder="Enter username"
                  required={true}
                />

                <div>
                  <ValidatedField
                    label="Email ID"
                    name="buyerEmail"
                    type="email"
                    value={formData.buyerEmail}
                    onChange={handleChange}
                    error={errors.buyerEmail}
                    placeholder="Enter email address"
                    required={true}
                    disabled={emailOtpSent}
                  />
                  {!emailOtpSent && formData.buyerEmail && !errors.buyerEmail && (
                    <button
                      type="button"
                      onClick={handleBuyerSendEmailOtp}
                      disabled={isSendingEmailOtp}
                      className={`mt-2 text-sm font-medium flex items-center gap-2 ${
                        isSendingEmailOtp ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"
                      }`}
                    >
                      {isSendingEmailOtp && (
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSendingEmailOtp ? "Sending OTP..." : "Verify Email ID"}
                    </button>
                  )}
                </div>

                {emailOtpSent && (
                  <div>
                    {/* Display Email OTP in Development */}
                    <OTPDisplay otp={displayedEmailOtp} label="Email OTP" />
                    
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter Email OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailOtp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) {
                          setEmailOtp(val);
                          if (errors.emailOtp) {
                            setErrors((prev) => ({ ...prev, emailOtp: "" }));
                          }
                        }
                      }}
                      placeholder="Enter 6-digit email OTP"
                      maxLength={6}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none text-center text-lg tracking-widest ${
                        errors.emailOtp
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-blue-400"
                      }`}
                    />
                    {errors.emailOtp && <p className="text-xs text-red-500 mt-1">{errors.emailOtp}</p>}
                    
                    <div className="flex justify-end items-center mt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setEmailOtp("");
                          setIsSendingEmailOtp(true);
                          try {
                            const response = await fetch('/api/otp/send-email', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: formData.buyerEmail })
                            });

                            const data = await response.json();

                            if (data.success) {
                              // Store OTP for display in development
                              if (data.otp) {
                                setDisplayedEmailOtp(data.otp);
                                console.log('📧 Resent Email OTP:', data.otp);
                              }
                              setNotification({
                                type: "success",
                                message: `Email OTP resent to ${formData.buyerEmail}`
                              });
                            } else {
                              setNotification({
                                type: "error",
                                message: data.message || 'Failed to resend email OTP'
                              });
                            }
                          } catch (error) {
                            console.error('Resend Email OTP error:', error);
                            setNotification({
                              type: "error",
                              message: 'Failed to resend email OTP. Please try again.'
                            });
                          } finally {
                            setIsSendingEmailOtp(false);
                            setTimeout(() => setNotification(null), 5000);
                          }
                        }}
                        disabled={isSendingEmailOtp}
                        className={`text-sm ${isSendingEmailOtp ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
                      >
                        {isSendingEmailOtp ? "Resending..." : "Resend Email OTP"}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <ValidatedField
                    label="Create Password"
                    name="buyerPassword"
                    type="password"
                    value={formData.buyerPassword}
                    onChange={handleChange}
                    error={errors.buyerPassword}
                    placeholder="Enter password"
                    required={true}
                  />
                  {formData.buyerPassword && (
                    <div className="mt-2 space-y-1">
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
                    </div>
                  )}
                </div>

                <ValidatedField
                  label="Confirm Password"
                  name="buyerConfirmPassword"
                  type="password"
                  value={formData.buyerConfirmPassword}
                  onChange={handleChange}
                  error={errors.buyerConfirmPassword}
                  placeholder="Re-enter password"
                  required={true}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-lg text-sm transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={currentStep === 1 ? (otpSent ? isVerifyingOtp : isSendingOtp) : isSubmitting}
                className={`font-medium px-8 py-2 rounded-lg text-sm transition-all ml-auto flex items-center gap-2 ${
                  (currentStep === 1 ? (otpSent ? isVerifyingOtp : isSendingOtp) : isSubmitting)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                {(currentStep === 1 ? (otpSent ? isVerifyingOtp : isSendingOtp) : isSubmitting) && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {currentStep === 1 
                  ? (otpSent 
                      ? (isVerifyingOtp ? "Verifying..." : "Verify OTP & Continue") 
                      : (isSendingOtp ? "Sending..." : "Send OTP")) 
                  : (isSubmitting ? "Registering..." : "Register")}
              </button>
            </div>
          </form>
        ) : userType === "employer" ? (
          /* ========== EMPLOYER REGISTRATION (3 Steps) ========== */
          <form onSubmit={currentStep === 1 ? (otpSent ? handleEmployerVerifyOtp : handleEmployerSendOtp) : currentStep === 2 ? handleEmployerStep2Next : handleEmployerSubmit} className="space-y-5 transition-all duration-300">
            {/* STEP 1: Mobile OTP Verification */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormPhone
                  formData={formData}
                  handleChange={handleChange}
                  error={errors.phone}
                  disabled={otpSent}
                  required={true}
                />

                {otpSent && (
                  <div>
                    {/* Display OTP in Development */}
                    <OTPDisplay otp={displayedOtp} label="Mobile OTP" />
                    
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) {
                          setOtp(val);
                          if (errors.otp) {
                            setErrors((prev) => ({ ...prev, otp: "" }));
                          }
                        }
                      }}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none text-center text-lg tracking-widest ${
                        errors.otp
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-blue-400"
                      }`}
                    />
                    {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}
                    
                    <div className="flex justify-between items-center mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          setErrors((prev) => ({ ...prev, otp: "" }));
                        }}
                        className="text-gray-600 text-sm hover:underline flex items-center gap-1"
                      >
                        ← Change Phone Number
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setOtp("");
                          setIsSendingOtp(true);
                          try {
                            const response = await fetch('/api/otp/send', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phone: `+91${formData.phone}` })
                            });

                            const data = await response.json();

                            if (data.success) {
                              // Store OTP for display in development
                              if (data.otp) {
                                setDisplayedOtp(data.otp);
                                console.log('🔐 Seller Resent OTP:', data.otp);
                              }
                              setNotification({
                                type: "success",
                                message: `OTP resent to +91 ${formData.phone}`
                              });
                            } else {
                              setNotification({
                                type: "error",
                                message: data.message || 'Failed to resend OTP'
                              });
                            }
                          } catch (error) {
                            console.error('Resend OTP error:', error);
                            setNotification({
                              type: "error",
                              message: 'Failed to resend OTP. Please try again.'
                            });
                          } finally {
                            setIsSendingOtp(false);
                            setTimeout(() => setNotification(null), 5000);
                          }
                        }}
                        disabled={isSendingOtp}
                        className={`text-sm ${isSendingOtp ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
                      >
                        {isSendingOtp ? "Resending..." : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Basic details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormRadioGroup
                  label="You're creating account as"
                  name="accountType"
                  options={[
                    { value: "company", label: "Company/business" },
                    { value: "individual", label: "Individual/proprietor" }
                  ]}
                  value={formData.accountType}
                  onChange={handleChange}
                  error={errors.accountType}
                />

                <ValidatedField
                  label="Full name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  placeholder="Name as per PAN"
                  required={true}
                />

                <div>
                  <ValidatedField
                    label="Official email ID"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    error={errors.email}
                    placeholder="Enter email ID"
                    required={true}
                    disabled={emailOtpSent}
                  />
                  {!emailOtpSent && formData.email && !errors.email && (
                    <button
                      type="button"
                      onClick={handleEmployerSendEmailOtp}
                      disabled={isSendingEmailOtp}
                      className={`mt-2 text-sm font-medium flex items-center gap-2 ${
                        isSendingEmailOtp ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"
                      }`}
                    >
                      {isSendingEmailOtp && (
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSendingEmailOtp ? "Sending OTP..." : "Verify Email ID"}
                    </button>
                  )}
                </div>

                {emailOtpSent && (
                  <div>
                    {/* Display Email OTP in Development */}
                    <OTPDisplay otp={displayedEmailOtp} label="Email OTP" />
                    
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter Email OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailOtp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) {
                          setEmailOtp(val);
                          if (errors.emailOtp) {
                            setErrors((prev) => ({ ...prev, emailOtp: "" }));
                          }
                        }
                      }}
                      placeholder="Enter 6-digit email OTP"
                      maxLength={6}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none text-center text-lg tracking-widest ${
                        errors.emailOtp
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-blue-400"
                      }`}
                    />
                    {errors.emailOtp && <p className="text-xs text-red-500 mt-1">{errors.emailOtp}</p>}
                    
                    <div className="flex justify-end items-center mt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          setEmailOtp("");
                          setIsSendingEmailOtp(true);
                          try {
                            const response = await fetch('/api/otp/send-email', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: formData.email })
                            });

                            const data = await response.json();

                            if (data.success) {
                              // Store OTP for display in development
                              if (data.otp) {
                                setDisplayedEmailOtp(data.otp);
                                console.log('📧 Employer Resent Email OTP:', data.otp);
                              }
                              setNotification({
                                type: "success",
                                message: `Email OTP resent to ${formData.email}`
                              });
                            } else {
                              setNotification({
                                type: "error",
                                message: data.message || 'Failed to resend email OTP'
                              });
                            }
                          } catch (error) {
                            console.error('Resend Email OTP error:', error);
                            setNotification({
                              type: "error",
                              message: 'Failed to resend email OTP. Please try again.'
                            });
                          } finally {
                            setIsSendingEmailOtp(false);
                            setTimeout(() => setNotification(null), 5000);
                          }
                        }}
                        disabled={isSendingEmailOtp}
                        className={`text-sm ${isSendingEmailOtp ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
                      >
                        {isSendingEmailOtp ? "Resending..." : "Resend Email OTP"}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <ValidatedField
                    label="Create password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Enter new password"
                    required={true}
                  />
                  {formData.password && (
                    <div className="mt-2 space-y-1">
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Company details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Verification Status Banner */}
                <div className={`p-4 rounded-lg border flex items-center gap-3 ${
                  emailOtp && emailOtp.length === 6
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  {emailOtp && emailOtp.length === 6 ? (
                    <>
                      <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Email Verified</p>
                        <p className="text-xs text-green-700">{formData.email} has been verified successfully</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">Email Not Verified</p>
                        <p className="text-xs text-yellow-700">Please go back to Step 2 to verify your email before submitting</p>
                      </div>
                    </>
                  )}
                </div>

                <FormRadioGroup
                  label="Hiring for"
                  name="hiringFor"
                  options={[
                    { value: "company", label: "your company" },
                    { value: "consultancy", label: "a consultancy" }
                  ]}
                  value={formData.hiringFor}
                  onChange={handleChange}
                  error={errors.hiringFor}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedField
                    label="Company"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                    placeholder="Enter company name"
                    required={true}
                  />

                  <FormSelect
                    label="Number of employees"
                    name="employeeCount"
                    value={formData.employeeCount}
                    options={employeeRanges}
                    onChange={handleChange}
                    error={errors.employeeCount}
                    placeholder="Select range"
                  />

                  <ValidatedField
                    label="Your designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    error={errors.designation}
                    placeholder="Enter designation"
                    required={true}
                  />

                  <ValidatedField
                    label="Pin code"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    error={errors.pincode}
                    placeholder="Enter company pincode"
                    required={true}
                  />
                </div>

                <ValidatedField
                  label="Company address"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  error={errors.companyAddress}
                  placeholder="Enter company address"
                  required={true}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-lg text-sm transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={
                  currentStep === 1
                    ? (otpSent ? isVerifyingOtp : isSendingOtp)
                    : currentStep === 2
                    ? isSubmitting
                    : isSubmitting
                }
                className={`font-medium px-8 py-2 rounded-lg text-sm transition-all ml-auto flex items-center gap-2 ${
                  (currentStep === 1
                    ? (otpSent ? isVerifyingOtp : isSendingOtp)
                    : isSubmitting)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                {(currentStep === 1
                  ? (otpSent ? isVerifyingOtp : isSendingOtp)
                  : isSubmitting) && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {currentStep === 1
                  ? (otpSent ? (isVerifyingOtp ? "Verifying..." : "Verify OTP & Continue") : (isSendingOtp ? "Sending..." : "Send OTP"))
                  : currentStep === 2
                  ? (isSubmitting ? "Processing..." : "Continue")
                  : (isSubmitting ? "Submitting..." : "Submit")}
              </button>
            </div>
          </form>
        ) : (
          /* ========== SELLER REGISTRATION (3 Steps) ========== */
          <form onSubmit={currentStep === 1 ? (otpSent ? handleSellerVerifyOtp : handleSellerSendOtp) : currentStep === 2 ? handleSellerStep2Next : handleSellerSubmit} className="space-y-5 transition-all duration-300">
            {/* STEP 1: Mobile OTP Verification */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormPhone
                  formData={formData}
                  handleChange={handleChange}
                  error={errors.phone}
                  disabled={otpSent}
                  required={true}
                />

                {otpSent && (
                  <div>
                    {/* Display OTP in Development */}
                    <OTPDisplay otp={displayedOtp} label="Mobile OTP" />
                    
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) {
                          setOtp(val);
                          if (errors.otp) {
                            setErrors((prev) => ({ ...prev, otp: "" }));
                          }
                        }
                      }}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none text-center text-lg tracking-widest ${
                        errors.otp
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-blue-400"
                      }`}
                    />
                    {errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}
                    
                    <div className="flex justify-between items-center mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          setErrors((prev) => ({ ...prev, otp: "" }));
                        }}
                        className="text-gray-600 text-sm hover:underline flex items-center gap-1"
                      >
                        ← Change Phone Number
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setOtp("");
                          setIsSendingOtp(true);
                          try {
                            const response = await fetch('/api/otp/send', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phone: `+91${formData.phone}` })
                            });

                            const data = await response.json();

                            if (data.success) {
                              // Store OTP for display in development
                              if (data.otp) {
                                setDisplayedOtp(data.otp);
                                console.log('🔐 Employer Resent OTP:', data.otp);
                              }
                              setNotification({
                                type: "success",
                                message: `OTP resent to +91 ${formData.phone}`
                              });
                            } else {
                              setNotification({
                                type: "error",
                                message: data.message || 'Failed to resend OTP'
                              });
                            }
                          } catch (error) {
                            console.error('Resend OTP error:', error);
                            setNotification({
                              type: "error",
                              message: 'Failed to resend OTP. Please try again.'
                            });
                          } finally {
                            setIsSendingOtp(false);
                            setTimeout(() => setNotification(null), 5000);
                          }
                        }}
                        disabled={isSendingOtp}
                        className={`text-sm ${isSendingOtp ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"}`}
                      >
                        {isSendingOtp ? "Resending..." : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedField
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                    required={true}
                  />
                  <FormSelect
                    label="Business Type"
                    name="businessType"
                    value={formData.businessType}
                    options={["Service", "Product", "Both"]}
                    onChange={handleChange}
                    error={errors.businessType}
                  />
                  <FormSelect
                    label="Category"
                    name="category"
                    value={formData.category}
                    options={Object.keys(categoriesWithServices)}
                    onChange={handleChange}
                    error={errors.category}
                  />
                  <FormSelect
                    label="Service Name"
                    name="serviceName"
                    value={formData.serviceName}
                    options={selectedCategory ? categoriesWithServices[selectedCategory] : []}
                    onChange={handleChange}
                    error={errors.serviceName}
                  />
                  <div className="md:col-span-2">
                    <ValidatedField
                      label="Business Address"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      error={errors.businessAddress}
                      required={true}
                    />
                  </div>
                  <ValidatedField
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    error={errors.pincode}
                    placeholder="Enter 6-digit pincode"
                    required={true}
                  />
                </div>

                {/* Document Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormSelect
                    label="Business Proof Document"
                    name="documentType"
                    value={formData.documentType}
                    options={["GST Certificate", "Udyam Certificate", "Upload later"]}
                    onChange={handleChange}
                    error={errors.documentType}
                    isRequired={false}
                  />
                  
                  {formData.documentType && formData.documentType !== "Upload later" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Upload Document
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedDocument(file);
                              setErrors((prev) => ({ ...prev, document: "" }));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      {errors.document && (
                        <p className="text-xs text-red-500 mt-1">{errors.document}</p>
                      )}
                    </div>
                  )}
                </div>

                {uploadedDocument && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{uploadedDocument.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadedDocument.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedDocument(null)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                      >
                        <FaTimes className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Business Owner Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Verification Status Banner */}
                <div className={`p-4 rounded-lg border flex items-center gap-3 ${
                  emailOtp && emailOtp.length === 6
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  {emailOtp && emailOtp.length === 6 ? (
                    <>
                      <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Email Verified</p>
                        <p className="text-xs text-green-700">{formData.email} has been verified successfully</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">Email Not Verified</p>
                        <p className="text-xs text-yellow-700">Please verify your email by clicking 'Verify Email ID' and entering the OTP before submitting</p>
                      </div>
                    </>
                  )}
                </div>

                <ValidatedField
                  label="User Name"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  required={true}
                />

                <div>
                  <ValidatedField
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    error={errors.email}
                    required={true}
                    disabled={emailOtpSent}
                  />
                  {!emailOtpSent && formData.email && !errors.email && (
                    <button
                      type="button"
                      onClick={handleSellerSendEmailOtp}
                      disabled={isSendingEmailOtp}
                      className={`mt-2 text-sm font-medium flex items-center gap-2 ${
                        isSendingEmailOtp ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:underline"
                      }`}
                    >
                      {isSendingEmailOtp && (
                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {isSendingEmailOtp ? "Sending OTP..." : "Verify Email ID"}
                    </button>
                  )}
                </div>

                {emailOtpSent && (
                  <div>
                    {/* Display Email OTP in Development */}
                    <OTPDisplay otp={displayedEmailOtp} label="Email OTP" />
                    
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter Email OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailOtp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) {
                          setEmailOtp(val);
                          if (errors.emailOtp) {
                            setErrors((prev) => ({ ...prev, emailOtp: "" }));
                          }
                        }
                      }}
                      placeholder="Enter 6-digit email OTP"
                      maxLength={6}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none text-center text-lg tracking-widest ${
                        errors.emailOtp
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-blue-400"
                      }`}
                    />
                    {errors.emailOtp && <p className="text-xs text-red-500 mt-1">{errors.emailOtp}</p>}
                    
                    <div className="flex justify-end items-center mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailOtp("");
                          setNotification({
                            type: "info",
                            message: "Email OTP resent to " + formData.email
                          });
                          setTimeout(() => setNotification(null), 5000);
                        }}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Resend Email OTP
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <ValidatedField
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      required={true}
                    />
                    {formData.password && (
                      <div className="mt-2 space-y-1">
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
                      </div>
                    )}
                  </div>
                  <ValidatedField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required={true}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-lg text-sm transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={
                  currentStep === 1
                    ? (otpSent ? isVerifyingOtp : isSendingOtp)
                    : currentStep === 2
                    ? false
                    : isSubmitting
                }
                className={`font-medium px-8 py-2 rounded-lg text-sm transition-all ml-auto flex items-center gap-2 ${
                  (currentStep === 1
                    ? (otpSent ? isVerifyingOtp : isSendingOtp)
                    : currentStep === 3
                    ? isSubmitting
                    : false)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                {(currentStep === 1
                  ? (otpSent ? isVerifyingOtp : isSendingOtp)
                  : currentStep === 3
                  ? isSubmitting
                  : false) && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {currentStep === 1
                  ? (otpSent ? (isVerifyingOtp ? "Verifying..." : "Verify OTP & Continue") : (isSendingOtp ? "Sending..." : "Send OTP"))
                  : currentStep === 2
                  ? "Continue"
                  : (isSubmitting ? "Submitting..." : "Submit")}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}


/* ---------- Sub Components ---------- */
function ValidatedField({
  label,
  name,
  value,
  onChange,
  type = "text",
  error = "",
  disabled = false,
  placeholder = "",
  required = false,
}: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-blue-400"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FormSelect({ label, name, options, onChange, error = "", value = "", placeholder = "Select", isRequired = true }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm ${
          error
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-blue-400"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FormRadioGroup({ label, name, options, value, onChange, error = "" }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-6">
        {options.map((option: any) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function FormPhone({ formData, handleChange, error, disabled = false, required = false }: any) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        Mobile {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 select-none">
          +91
        </span>
        <input
          type="tel"
          name="phone"
          id="phone-input"
          autoComplete="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.phone}
          onChange={handleChange}
          placeholder="7092747933"
          disabled={disabled}
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none text-sm ${
            error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function ToggleButton({ active, disabled, label, icon, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : active
          ? "bg-gradient-to-r from-primary-300 to-primary-500 text-white shadow-lg"
          : "bg-transparent text-gray-700 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function PasswordStrengthIndicator({ label, isValid }: { label: string; isValid: boolean }) {
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
      <span className={`text-xs transition-colors duration-300 ${
        isValid ? "text-green-600 font-medium" : "text-gray-500"
      }`}>
        {label}
      </span>
    </div>
  );
}

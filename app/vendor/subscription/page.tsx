"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiCheck,
  FiX,
  FiStar,
  FiZap,
  FiAward,
  FiCreditCard,
  FiCalendar,
  FiAlertCircle,
  FiArrowRight,
  FiShield,
  FiClock,
  FiPercent,
  FiSmartphone,
  FiGlobe,
  FiChevronLeft,
  FiLock,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { toast } from "react-hot-toast";

// Subscription plans data
const plans = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic features",
    price: 0,
    duration: "Forever",
    icon: FiZap,
    color: "gray",
    features: [
      { text: "List up to 3 services/products", included: true },
      { text: "Basic analytics", included: true },
      { text: "Standard support", included: true },
      { text: "15% platform commission", included: true },
      { text: "Priority listing", included: false },
      { text: "Featured badge", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Promotional tools", included: false },
      { text: "Dedicated account manager", included: false },
    ],
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for growing businesses",
    price: 499,
    duration: "per month",
    icon: FiStar,
    color: "emerald",
    features: [
      { text: "List up to 15 services/products", included: true },
      { text: "Basic analytics", included: true },
      { text: "Priority support", included: true },
      { text: "10% platform commission", included: true },
      { text: "Priority listing", included: true },
      { text: "Featured badge", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Promotional tools", included: false },
      { text: "Dedicated account manager", included: false },
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "For established vendors",
    price: 999,
    duration: "per month",
    icon: FiAward,
    color: "teal",
    features: [
      { text: "List up to 30 services/products", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "7% platform commission", included: true },
      { text: "Priority listing", included: true },
      { text: "Featured badge", included: true },
      { text: "Promotional tools", included: true },
      { text: "Social media promotion", included: true },
      { text: "Dedicated account manager", included: false },
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large scale operations",
    price: 2499,
    duration: "per month",
    icon: FiShield,
    color: "orange",
    features: [
      { text: "List unlimited services/products", included: true },
      { text: "Advanced analytics + Reports", included: true },
      { text: "24/7 Priority support", included: true },
      { text: "5% platform commission", included: true },
      { text: "Top priority listing", included: true },
      { text: "Premium featured badge", included: true },
      { text: "All promotional tools", included: true },
      { text: "Marketing campaigns", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    popular: false,
  },
];

const getColorClasses = (color: string, type: "bg" | "text" | "border" | "gradient") => {
  const colors: Record<string, Record<string, string>> = {
    gray: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
      gradient: "from-gray-500 to-gray-600",
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-emerald-200",
      gradient: "from-emerald-500 to-emerald-600",
    },
    teal: {
      bg: "bg-teal-100",
      text: "text-teal-600",
      border: "border-teal-200",
      gradient: "from-teal-500 to-teal-600",
    },
    orange: {
      bg: "bg-amber-100",
      text: "text-amber-600",
      border: "border-amber-200",
      gradient: "from-amber-500 to-amber-600",
    },
  };
  return colors[color]?.[type] || colors.gray[type];
};

export default function VendorSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showPayment, setShowPayment] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log("Fetching subscription for user:", user.id);
        try {
          const response = await fetch(`/api/vendor/subscription?vendorId=${user.id}`);
          const data = await response.json();
          console.log("Subscription API response:", data);
          if (data.success && data.data) {
            setCurrentSubscription(data.data);
          } else {
            console.warn("API succeeded but returned no data or success: false");
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
          // Fallback to free plan is already handled by initial state
        }
      } else {
        console.warn("No user found in localStorage");
      }
      setLoading(false);
    };

    fetchSubscription();
  }, []);

  const defaultFreePlan = {
    plan: 'free',
    status: 'active',
    startDate: new Date('2024-11-01').toISOString(),
    endDate: null,
    autoRenew: false
  };

  const activeSubscription = currentSubscription || defaultFreePlan;
  const currentPlan = plans.find((p) => p.id === activeSubscription.plan);

  const getDiscountedPrice = (price: number) => {
    if (billingCycle === "yearly" && price > 0) {
      return Math.round(price * 10); // 2 months free on yearly
    }
    return price;
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === activeSubscription?.plan) return;
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    setAcceptedTerms(false); // Reset terms acceptance
    setShowPayment(true);
  };

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);


  const handlePayment = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr || !selectedPlan || !acceptedTerms) return;
    const user = JSON.parse(userStr);

    const loadingToast = toast.loading("Initializing payment...");

    try {
      // 1. Create Order
      const response = await fetch('/api/vendor/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: user.id,
          planId: selectedPlan,
          billingCycle
        })
      });
      const data = await response.json();

      if (!data.success) {
        toast.dismiss(loadingToast);
        toast.error("Failed to initialize payment: " + data.message);
        return;
      }

      // If free plan switch was successful without payment
      if (data.message === 'Switched to free plan') {
        toast.dismiss(loadingToast);
        toast.success("Subscription updated to Free plan.");
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      // 2. Open Razorpay
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Forge India Connect",
        description: `Subscription for ${plans.find(p => p.id === selectedPlan)?.name} Plan`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          toast.loading("Verifying payment...", { id: loadingToast });

          try {
            const verifyResponse = await fetch('/api/vendor/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                vendorId: user.id,
                planId: selectedPlan,
                billingCycle
              })
            });
            const verifyData = await verifyResponse.json();

            toast.dismiss(loadingToast);

            if (verifyData.success) {
              toast.success("Payment Successful! Subscription updated.");
              window.dispatchEvent(new Event('subscriptionUpdated'));
              setCurrentSubscription(verifyData.data);
              setShowPayment(false);
              setSelectedPlan(null);
            } else {
              toast.error("Payment Verification Failed: " + verifyData.message);
            }
          } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("Payment verification failed due to network error.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: "#10B981"
        },
        modal: {
          ondismiss: function () {
            toast.dismiss(loadingToast);
            toast("Payment cancelled", { icon: "ℹ️" });
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment error:", error);
      toast.dismiss(loadingToast);
      toast.error("An error occurred during payment initialization.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" color="vendor" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription plan and billing</p>
      </div>

      {showPayment ? (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setShowPayment(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FiChevronLeft className="w-5 h-5" />
            Back to Plans
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Selected Plan Details */}
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getColorClasses(plans.find(p => p.id === selectedPlan)?.color || "emerald", "gradient")} flex items-center justify-center flex-shrink-0`}>
                    {(() => {
                      const PlanIcon = plans.find(p => p.id === selectedPlan)?.icon || FiStar;
                      return <PlanIcon className="w-8 h-8 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{plans.find(p => p.id === selectedPlan)?.name} Plan</h3>
                    <p className="text-gray-500 text-sm">{plans.find(p => p.id === selectedPlan)?.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <FiCalendar className="w-4 h-4" />
                      <span>Billing Cycle: <span className="font-semibold capitalize">{billingCycle}</span></span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{getDiscountedPrice(plans.find(p => p.id === selectedPlan)?.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18% GST)</span>
                    <span>₹{Math.round(getDiscountedPrice(plans.find(p => p.id === selectedPlan)?.price || 0) * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-100">
                    <span>Total Amount</span>
                    <span>₹{Math.round(getDiscountedPrice(plans.find(p => p.id === selectedPlan)?.price || 0) * 1.18).toLocaleString()}</span>
                  </div>
                </div>

                {/* Secure Payment Badge */}
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                  <FiLock className="w-4 h-4" />
                  <span>Payments are 256-bit encrypted and secure</span>
                </div>
              </div>

            </div>

            {/* Pay Button Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Complete Payment</h3>

                <div className="flex items-start gap-3 mb-6">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      aria-describedby="terms-description"
                      name="terms"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-emerald-300 accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-600 cursor-pointer select-none">
                      By clicking "Pay Now", you agree to our <Link href="/legal?tab=terms" target="_blank" className="text-emerald-600 hover:underline font-semibold">Terms of Service</Link> and <Link href="/legal?tab=privacy" target="_blank" className="text-emerald-600 hover:underline font-semibold">Privacy Policy</Link>.
                    </label>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!acceptedTerms}
                  className={`w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${!acceptedTerms ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:from-emerald-600 hover:to-teal-700 transform hover:-translate-y-0.5'}`}
                >
                  <span>Pay ₹{Math.round(getDiscountedPrice(plans.find(p => p.id === selectedPlan)?.price || 0) * 1.18).toLocaleString()}</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Current Plan Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getColorClasses(currentPlan?.color || "gray", "gradient")} flex items-center justify-center`}>
                  {currentPlan && <currentPlan.icon className="w-7 h-7 text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">Current Plan: {currentPlan?.name}</h2>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${activeSubscription?.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}>
                      {activeSubscription?.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600">{currentPlan?.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Started: {activeSubscription?.startDate ? new Date(activeSubscription.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : '...'}
                    </span>
                    {activeSubscription?.endDate && (
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        Expires: {new Date(activeSubscription.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === "yearly" ? "bg-emerald-500" : "bg-gray-300"
                }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${billingCycle === "yearly" ? "translate-x-8" : "translate-x-1"
                  }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"}`}>
              Yearly
            </span>
            {billingCycle === "yearly" && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                <FiPercent className="w-3 h-3" />
                Save 2 months!
              </span>
            )}
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = activeSubscription?.plan === plan.id;
              const isSelected = selectedPlan === plan.id;
              const price = getDiscountedPrice(plan.price);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${isSelected
                    ? "border-emerald-600"
                    : isCurrentPlan
                      ? `${getColorClasses(plan.color, "border")} bg-emerald-50/10`
                      : "border-gray-200 hover:border-emerald-400"
                    } ${plan.popular ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Icon & Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(plan.color, "gradient")} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-xs text-gray-500">{plan.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {price === 0 ? "Free" : `₹${price.toLocaleString()}`}
                        </span>
                        {price > 0 && (
                          <span className="text-gray-500 text-sm">
                            /{billingCycle === "yearly" ? "year" : "month"}
                          </span>
                        )}
                      </div>
                      {billingCycle === "yearly" && plan.price > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ₹{(plan.price * 12).toLocaleString()} → ₹{price.toLocaleString()} (Save ₹{(plan.price * 2).toLocaleString()})
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          {feature.included ? (
                            <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <FiX className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrentPlan}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${isCurrentPlan
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isSelected
                          ? "bg-emerald-50 text-emerald-600"
                          : `${getColorClasses(plan.color, "bg")} ${getColorClasses(plan.color, "text")} hover:opacity-80`
                        }`}
                    >
                      {(() => {
                        if (isCurrentPlan) return "Current Plan";
                        if (!activeSubscription || activeSubscription.plan === "free") return "Buy Plan";
                        const currentIndex = plans.findIndex(p => p.id === activeSubscription.plan);
                        const targetIndex = plans.findIndex(p => p.id === plan.id);
                        return targetIndex > currentIndex ? "Upgrade" : "Downgrade";
                      })()}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>


          {/* Payment Methods & FAQ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Payment Methods */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiCreditCard className="w-5 h-5 text-emerald-600" />
                Accepted Payment Methods
              </h3>
              <div className="grid grid-cols-4 gap-3 max-w-xs transition-all">
                {[
                  { name: "UPI", src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" },
                  { name: "Visa", src: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" },
                  { name: "Mastercard", src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
                  { name: "RuPay", src: "https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg" },
                ].map((method) => (
                  <div key={method.name} className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center aspect-square hover:border-emerald-200 transition-all p-3">
                    <img src={method.src} alt={method.name} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                All payments are secured with 256-bit SSL encryption. We accept all major Indian banks and payment methods.
              </p>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Can I change my plan anytime?
                  </summary>
                  <p className="text-sm text-gray-500 mt-2 pl-4">
                    Yes, you can upgrade or downgrade your plan at any time. Changes will be applied immediately.
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    What happens when I upgrade?
                  </summary>
                  <p className="text-sm text-gray-500 mt-2 pl-4">
                    You'll get immediate access to all features of the new plan. We'll prorate the charge based on your current billing cycle.
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Is there a refund policy?
                  </summary>
                  <p className="text-sm text-gray-500 mt-2 pl-4">
                    We offer a 7-day money-back guarantee for all paid plans. Contact support for assistance.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

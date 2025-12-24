"use client";

import { useState } from "react";
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
    color: "blue",
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
    color: "purple",
    features: [
      { text: "List unlimited services/products", included: true },
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

// Mock current subscription data
const currentSubscription = {
  plan: "free",
  status: "active", // active, expired, cancelled
  startDate: "2024-11-01",
  endDate: null, // null for free plan
  autoRenew: false,
  daysRemaining: null,
};

const getColorClasses = (color: string, type: "bg" | "text" | "border" | "gradient") => {
  const colors: Record<string, Record<string, string>> = {
    gray: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
      gradient: "from-gray-500 to-gray-600",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
      gradient: "from-blue-500 to-blue-600",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      border: "border-purple-200",
      gradient: "from-purple-500 to-purple-600",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-200",
      gradient: "from-orange-500 to-orange-600",
    },
  };
  return colors[color]?.[type] || colors.gray[type];
};

export default function VendorSubscription() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const currentPlan = plans.find((p) => p.id === currentSubscription.plan);

  const getDiscountedPrice = (price: number) => {
    if (billingCycle === "yearly" && price > 0) {
      return Math.round(price * 10); // 2 months free on yearly
    }
    return price;
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === currentSubscription.plan) return;
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    setShowPayment(true);
  };

  const handlePayment = () => {
    alert(`Processing payment of ₹${Math.round(getDiscountedPrice(plans.find((p) => p.id === selectedPlan)?.price || 0) * 1.18).toLocaleString()} via ${paymentMethod}...`);
    // Simulate success
    setTimeout(() => {
      alert("Payment Successful! Subscription updated.");
      setShowPayment(false);
      setSelectedPlan(null);
    }, 1500);
  };

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
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getColorClasses(plans.find(p => p.id === selectedPlan)?.color || "blue", "gradient")} flex items-center justify-center flex-shrink-0`}>
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

              {/* Payment Method Selection */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Select Payment Method</h3>
                <div className="space-y-3">
                  {[
                    { id: "upi", name: "UPI", icon: FiSmartphone, desc: "Google Pay, PhonePe, Paytm" },
                    { id: "card", name: "Credit / Debit Card", icon: FiCreditCard, desc: "Visa, Mastercard, Rupay" },
                    { id: "netbanking", name: "Net Banking", icon: FiGlobe, desc: "All major banks supported" },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                          ? "border-[#0053B0] bg-blue-50/50"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-[#0053B0] focus:ring-[#0053B0]"
                      />
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                        <method.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{method.name}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Pay Button Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Complete Payment</h3>
                <p className="text-sm text-gray-500 mb-6">
                  By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy.
                </p>
                <button
                  onClick={handlePayment}
                  className="w-full py-3 bg-[#0053B0] text-white rounded-lg font-bold hover:bg-[#003d85] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
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
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${currentSubscription.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}>
                      {currentSubscription.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600">{currentPlan?.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Started: {new Date(currentSubscription.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {currentSubscription.endDate && (
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        Expires: {new Date(currentSubscription.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {currentSubscription.plan === "free" && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FiAlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Upgrade to unlock more features!</span>
                  </div>
                  <p className="text-sm text-blue-100">Get priority listing, lower commission & more</p>
                </div>
              )}
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === "yearly" ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingCycle === "yearly" ? "translate-x-8" : "translate-x-1"
                  }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"}`}>
              Yearly
            </span>
            {billingCycle === "yearly" && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <FiPercent className="w-3 h-3" />
                Save 2 months!
              </span>
            )}
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentSubscription.plan === plan.id;
              const isSelected = selectedPlan === plan.id;
              const price = getDiscountedPrice(plan.price);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border-2 transition-all ${isSelected
                    ? "border-[#0053B0] shadow-lg shadow-blue-100"
                    : isCurrentPlan
                      ? `${getColorClasses(plan.color, "border")} bg-gray-50`
                      : "border-gray-200 hover:border-gray-300"
                    } ${plan.popular ? "ring-2 ring-purple-500 ring-offset-2" : ""}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
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
                          ? "bg-[#0053B0] text-white"
                          : `${getColorClasses(plan.color, "bg")} ${getColorClasses(plan.color, "text")} hover:opacity-80`
                        }`}
                    >
                      {isCurrentPlan ? "Current Plan" : isSelected ? "Selected" : "Select Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Proceed to Payment */}
          {selectedPlan && selectedPlan !== currentSubscription.plan && (
            <div className="bg-gradient-to-r from-[#0053B0] to-[#003d85] rounded-xl p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    Upgrade to {plans.find((p) => p.id === selectedPlan)?.name} Plan
                  </h3>
                  <p className="text-blue-100 text-sm">
                    You'll be charged ₹{getDiscountedPrice(plans.find((p) => p.id === selectedPlan)?.price || 0).toLocaleString()}/{billingCycle === "yearly" ? "year" : "month"}
                  </p>
                </div>
                <button
                  onClick={handleSubscribe}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0053B0] rounded-lg font-bold hover:bg-blue-50 transition-colors"
                >
                  <FiCreditCard className="w-5 h-5" />
                  Proceed to Payment
                  <FiArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Payment Methods & FAQ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Payment Methods */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiCreditCard className="w-5 h-5 text-blue-600" />
                Accepted Payment Methods
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: "UPI", icon: FiSmartphone },
                  { name: "Credit Card", icon: FiCreditCard },
                  { name: "Debit Card", icon: FiCreditCard },
                  { name: "Net Banking", icon: FiGlobe },
                ].map((method) => (
                  <div key={method.name} className="bg-gray-50 rounded-lg p-3 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors">
                    <method.icon className="w-6 h-6 text-gray-400" />
                    <p className="text-xs text-gray-600 font-medium">{method.name}</p>
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

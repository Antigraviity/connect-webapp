"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiCheck,
  FiShield,
  FiTruck,
  FiClock,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiPackage,
  FiCheckCircle,
} from "react-icons/fi";

interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit: string;
  images: string[];
  seller: {
    name: string;
    verified: boolean;
  };
}

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Cart items from localStorage or state management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("upi");
  const [showAddAddress, setShowAddAddress] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState<Omit<Address, "id" | "isDefault">>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    type: "home",
  });

  // Mock saved addresses
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "John Doe",
      phone: "9876543210",
      addressLine1: "123, Anna Nagar East",
      addressLine2: "Near Chennai Central",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600001",
      type: "home",
      isDefault: true,
    },
    {
      id: "2",
      name: "John Doe",
      phone: "9876543210",
      addressLine1: "456, T Nagar",
      addressLine2: "Opposite Saravana Stores",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600017",
      type: "work",
      isDefault: false,
    },
  ]);

  // Load cart items from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      // Demo cart items if empty
      setCartItems([
        {
          id: "1",
          name: "Fresh Organic Vegetables Basket",
          price: 299,
          discountPrice: 249,
          quantity: 2,
          unit: "basket",
          images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500"],
          seller: { name: "Green Farm Fresh", verified: true },
        },
        {
          id: "2",
          name: "Homemade Murukku Pack",
          price: 150,
          discountPrice: 120,
          quantity: 3,
          unit: "pack",
          images: ["https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500"],
          seller: { name: "Amma's Kitchen", verified: true },
        },
      ]);
    }

    // Set default address
    const defaultAddr = addresses.find(a => a.isDefault);
    if (defaultAddr) {
      setSelectedAddress(defaultAddr.id);
    }
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= 299 ? 0 : 40;
  const total = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const paymentMethods = [
    { id: "upi", name: "UPI", icon: FiSmartphone, description: "Pay using UPI apps" },
    { id: "card", name: "Credit/Debit Card", icon: FiCreditCard, description: "Visa, Mastercard, RuPay" },
    { id: "cod", name: "Cash on Delivery", icon: FiDollarSign, description: "Pay when delivered" },
  ];

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
      alert("Please fill all required fields");
      return;
    }

    const address: Address = {
      ...newAddress,
      id: Date.now().toString(),
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, address]);
    setSelectedAddress(address.id);
    setShowAddAddress(false);
    setNewAddress({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      type: "home",
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    setIsProcessing(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate order ID
    const newOrderId = "ORD" + Date.now().toString().slice(-8);
    setOrderId(newOrderId);
    setIsProcessing(false);
    setOrderPlaced(true);

    // Clear cart
    localStorage.removeItem("cartItems");
  };

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been confirmed and will be delivered soon.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="text-xl font-bold text-primary-600">{orderId}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <FiTruck className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-900">Estimated Delivery</span>
            </div>
            <p className="text-gray-700">
              Your order will be delivered within <strong>24-48 hours</strong>
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/buyer/bookings"
              className="block w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              Track Order
            </Link>
            <Link
              href="/buy-products"
              className="block w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/buy-products"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            </div>

            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-4">
              {["Address", "Payment", "Review"].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep > index + 1
                        ? "bg-green-500 text-white"
                        : currentStep === index + 1
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {currentStep > index + 1 ? <FiCheck className="w-4 h-4" /> : index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${currentStep >= index + 1 ? "text-gray-900" : "text-gray-500"
                      }`}
                  >
                    {step}
                  </span>
                  {index < 2 && (
                    <div className="w-12 h-0.5 bg-gray-200 mx-4">
                      <div
                        className={`h-full bg-primary-600 transition-all ${currentStep > index + 1 ? "w-full" : "w-0"
                          }`}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <FiShield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${currentStep !== 1 ? "opacity-60" : ""}`}>
              <div
                className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                onClick={() => currentStep > 1 && setCurrentStep(1)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                    {currentStep > 1 ? <FiCheck className="w-4 h-4" /> : "1"}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
                </div>
                {currentStep > 1 && selectedAddress && (
                  <button className="text-primary-600 text-sm font-semibold hover:underline">
                    Change
                  </button>
                )}
              </div>

              {currentStep === 1 && (
                <div className="p-6">
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress === address.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddress === address.id}
                            onChange={() => setSelectedAddress(address.id)}
                            className="mt-1 w-4 h-4 text-primary-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{address.name}</span>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${address.type === "home" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                }`}>
                                {address.type.toUpperCase()}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-gray-700 text-sm">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              Phone: {address.phone}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}

                    {/* Add New Address */}
                    {showAddAddress ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Add New Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Full Name *"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="tel"
                            placeholder="9876543210"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            maxLength={10}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="text"
                            placeholder="Address Line 1 *"
                            value={newAddress.addressLine1}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 md:col-span-2"
                          />
                          <input
                            type="text"
                            placeholder="Address Line 2 (Optional)"
                            value={newAddress.addressLine2}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 md:col-span-2"
                          />
                          <input
                            type="text"
                            placeholder="City *"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="text"
                            placeholder="State *"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                          <input
                            type="text"
                            placeholder="Pincode *"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                          <select
                            value={newAddress.type}
                            onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as "home" | "work" | "other" })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={handleAddAddress}
                            className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                          >
                            Save Address
                          </button>
                          <button
                            onClick={() => setShowAddAddress(false)}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-primary-600 font-semibold hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
                      >
                        <FiPlus className="w-5 h-5" />
                        Add New Address
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => selectedAddress && setCurrentStep(2)}
                    disabled={!selectedAddress}
                    className="w-full mt-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Collapsed Address Display */}
              {currentStep > 1 && selectedAddress && (
                <div className="p-4">
                  {(() => {
                    const addr = addresses.find(a => a.id === selectedAddress);
                    if (!addr) return null;
                    return (
                      <div className="flex items-start gap-3">
                        <FiMapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">{addr.name}</p>
                          <p className="text-sm text-gray-700">
                            {addr.addressLine1}, {addr.city} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${currentStep !== 2 ? "opacity-60" : ""}`}>
              <div
                className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                onClick={() => currentStep > 2 && setCurrentStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                    {currentStep > 2 ? <FiCheck className="w-4 h-4" /> : "2"}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                </div>
              </div>

              {currentStep === 2 && (
                <div className="p-6">
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === method.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="w-4 h-4 text-primary-600"
                        />
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <method.icon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {currentStep > 2 && (
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const method = paymentMethods.find(m => m.id === selectedPayment);
                      if (!method) return null;
                      return (
                        <>
                          <method.icon className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold text-gray-900">{method.name}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Order Review */}
            <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${currentStep !== 3 ? "opacity-60" : ""}`}>
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                  3
                </div>
                <h2 className="text-lg font-bold text-gray-900">Review Order</h2>
              </div>

              {currentStep === 3 && (
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500">{item.seller.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <span className="font-bold text-primary-600">
                              ₹{(item.discountPrice || item.price) * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5" />
                          Place Order - ₹{total}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

              {/* Items Preview */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x ₹{item.discountPrice || item.price}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">
                      ₹{(item.discountPrice || item.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-primary-600">₹{total}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiTruck className="w-4 h-4 text-primary-600" />
                  <span className="font-semibold text-gray-900 text-sm">Express Delivery</span>
                </div>
                <p className="text-xs text-gray-700">
                  Estimated delivery: <strong>24-48 hours</strong>
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FiShield className="w-4 h-4 text-green-600" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiPackage className="w-4 h-4 text-blue-600" />
                  <span>Quality</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4 text-orange-600" />
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

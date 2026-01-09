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
  FiPlus,
  FiPackage,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiX,
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
    id?: string;
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  preferences?: {
    shippingAddresses?: Address[] | string;
    [key: string]: any;
  };
}

export default function BuyerCheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Cart items from localStorage or state management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

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

  // Addresses state - will be populated from user profile
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/signin');
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id;

      if (!userId) {
        console.error('No user ID found');
        setProfileLoading(false);
        return;
      }

      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success && data.user) {
        setUserProfile(data.user);

        // Create address from user profile if they have address info
        const userAddresses: Address[] = [];

        if (data.user.address || data.user.city) {
          userAddresses.push({
            id: "profile-address",
            name: data.user.name || "User",
            phone: data.user.phone || "",
            addressLine1: data.user.address || "",
            addressLine2: "",
            city: data.user.city || "",
            state: data.user.state || "",
            pincode: data.user.zipCode || "",
            type: "home",
            isDefault: true,
          });
        }

        // Load shipping addresses from preferences
        if (data.user.preferences?.shippingAddresses) {
          const prefs = data.user.preferences;
          const shippingAddrs = typeof prefs.shippingAddresses === 'string'
            ? JSON.parse(prefs.shippingAddresses)
            : prefs.shippingAddresses;

          if (Array.isArray(shippingAddrs)) {
            shippingAddrs.forEach((addr: Address) => {
              if (addr.id !== "profile-address") {
                userAddresses.push({
                  ...addr,
                  isDefault: userAddresses.length === 0
                });
              }
            });
          }
        }

        setAddresses(userAddresses);

        // Set default address
        const defaultAddr = userAddresses.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id);
        } else if (userAddresses.length > 0) {
          setSelectedAddress(userAddresses[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Load cart items and user profile
  useEffect(() => {
    fetchUserProfile();

    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      // Demo cart items if empty
      setCartItems([
        {
          id: "1",
          name: "Fresh Chicken Biryani",
          price: 349,
          discountPrice: 299,
          quantity: 1,
          unit: "piece",
          images: [],
          seller: { name: "Biryani House", verified: true },
        },
      ]);
    }
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const removeFromCart = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    if (updatedCart.length === 0) {
      router.push('/buyer/products');
    }
  };

  const paymentMethods = [
    { id: "upi", name: "UPI", icon: FiSmartphone, description: "Pay using UPI apps", dbValue: "RAZORPAY" },
    { id: "card", name: "Credit/Debit Card", icon: FiCreditCard, description: "Visa, Mastercard, RuPay", dbValue: "STRIPE" },
    { id: "cod", name: "Cash on Delivery", icon: FiDollarSign, description: "Pay when delivered", dbValue: "CASH_ON_SERVICE" },
  ];

  const handleAddAddress = async () => {
    // Validate required fields
    if (!newAddress.name?.trim() || !newAddress.phone?.trim() || !newAddress.addressLine1?.trim() || !newAddress.city?.trim() || !newAddress.pincode?.trim() || !newAddress.state?.trim()) {
      alert("Please fill all required fields");
      return;
    }

    if (!userProfile?.id) {
      alert("User session not found. Please refresh.");
      return;
    }

    const address: Address = {
      ...newAddress,
      id: Date.now().toString(),
      isDefault: addresses.length === 0,
    };

    const updatedAddresses = [...addresses, address];
    setAddresses(updatedAddresses);
    setSelectedAddress(address.id);
    setShowAddAddress(false);
    setSavingAddress(true);

    // Save to DB via preferences API (excluding profile-address)
    try {
      const shippingAddrs = updatedAddresses.filter(a => a.id !== "profile-address");

      const response = await fetch('/api/users/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.id,
          preferences: {
            ...userProfile.preferences,
            shippingAddresses: shippingAddrs
          }
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to sync address to DB:', data.message);
      } else {
        console.log('✅ Address synced to DB');
        // Update user profile in state to reflect new preferences
        setUserProfile({
          ...userProfile,
          preferences: data.preferences
        });
      }
    } catch (error) {
      console.error('Error syncing address to DB:', error);
    } finally {
      setSavingAddress(false);
    }

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

    if (!userProfile) {
      alert("User profile not loaded. Please refresh and try again.");
      return;
    }

    setIsProcessing(true);
    setOrderError(null);

    try {
      // Get selected address details
      const address = addresses.find(a => a.id === selectedAddress);
      if (!address) {
        throw new Error("Selected address not found");
      }

      // Format full address
      const fullAddress = [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.state,
        address.pincode
      ].filter(Boolean).join(", ");

      // Get payment method database value
      const paymentMethod = paymentMethods.find(m => m.id === selectedPayment);
      const paymentMethodDb = paymentMethod?.dbValue || "CASH_ON_SERVICE";

      // Prepare order data
      const orderData = {
        buyerId: userProfile.id,
        bookingDate: new Date().toISOString().split('T')[0], // Today's date
        bookingTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        servicePrice: subtotal,
        taxAmount: 0,
        discount: 0,
        deliveryFee: deliveryFee,
        totalAmount: total,
        customerName: address.name,
        customerEmail: userProfile.email,
        customerPhone: address.phone || userProfile.phone || "",
        customerAddress: fullAddress,
        paymentMethod: paymentMethodDb,
        orderType: "PRODUCT",
        sellerId: cartItems[0]?.seller?.id, // Get sellerId from items
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          discountPrice: item.discountPrice,
          quantity: item.quantity,
          unit: item.unit,
          sellerId: item.seller?.id,
          sellerName: item.seller?.name,
        })),
        specialRequests: `Payment: ${paymentMethod?.name || 'Cash on Delivery'}`,
      };

      console.log('Placing order with data:', orderData);

      // Call the API to create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Order created successfully
        setOrderId(result.orderNumber || result.order?.orderNumber);
        setOrderPlaced(true);

        // Clear cart
        localStorage.removeItem("cartItems");

        console.log('Order placed successfully:', result);
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
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

          <div className="flex flex-col gap-3">
            <Link
              href="/buyer/orders"
              className="w-full px-6 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              View Your Orders
              <FiArrowLeft className="w-5 h-5 rotate-180" />
            </Link>
            <Link
              href="/buyer/products"
              className="w-full px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Sticky Header and Stepper */}
      <div className="sticky top-0 z-50 bg-[#F9FAFB]/80 backdrop-blur-md -mx-6 px-6 py-4 space-y-4 border-b border-gray-100 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/buyer/products"
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-500 text-xs mt-0.5">{totalItems} items in cart</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500">
            <FiShield className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium">Secure Checkout</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3">
          <div className="flex items-center justify-between">
            {["Address", "Payment", "Review"].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm transition-all ${currentStep > index + 1
                      ? "bg-gradient-to-br from-green-400 to-green-600"
                      : currentStep === index + 1
                        ? "bg-gradient-to-r from-primary-300 to-primary-500 shadow-md transform scale-105"
                        : "bg-gray-200 text-gray-600 shadow-none scale-100"
                      }`}
                  >
                    {currentStep > index + 1 ? <FiCheck className="w-4 h-4" /> : index + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${currentStep >= index + 1 ? "text-gray-900" : "text-gray-500"
                      }`}
                  >
                    {step}
                  </span>
                </div>
                {index < 2 && (
                  <div className="flex-1 h-0.5 bg-gray-100 mx-2 sm:mx-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-primary-300 to-primary-500 transition-all duration-500 ${currentStep > index + 1 ? "w-full" : "w-0"
                        }`}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Error Alert */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800">Order Failed</h4>
            <p className="text-sm text-red-700">{orderError}</p>
          </div>
          <button
            onClick={() => setOrderError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${currentStep !== 1 ? "opacity-60" : ""}`}>
            <div
              className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
              onClick={() => currentStep > 1 && setCurrentStep(1)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 1
                  ? "bg-gradient-to-r from-primary-300 to-primary-500 text-white shadow-sm"
                  : "bg-gray-200 text-gray-500"
                  }`}>
                  {currentStep > 1 ? <FiCheck className="w-4 h-4" /> : <FiMapPin className="w-4 h-4" />}
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
                {profileLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-gray-600">Loading your addresses...</span>
                  </div>
                ) : (addresses.length === 0 && !showAddAddress) ? (
                  <div className="text-center py-8">
                    <FiMapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No saved addresses found</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Add your delivery address to continue with checkout
                    </p>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Address
                    </button>
                  </div>
                ) : (
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
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-gray-900">{address.name}</span>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${address.type === "home" ? "bg-blue-100 text-blue-700" :
                                address.type === "work" ? "bg-primary-100 text-primary-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                {address.type.toUpperCase()}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                                  DEFAULT
                                </span>
                              )}
                              {address.id === "profile-address" && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                  FROM PROFILE
                                </span>
                              )}
                            </div>
                            {address.addressLine1 ? (
                              <>
                                <p className="text-gray-700 text-sm">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p className="text-gray-700 text-sm">
                                  {address.city}{address.state && `, ${address.state}`}{address.pincode && ` - ${address.pincode}`}
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-500 text-sm italic">
                                Address details not available
                              </p>
                            )}
                            {address.phone && (
                              <p className="text-gray-600 text-sm mt-1">
                                Phone: {address.phone}
                              </p>
                            )}
                            {!address.phone && address.id === "profile-address" && (
                              <p className="text-orange-600 text-xs mt-1 flex items-center gap-1">
                                <FiAlertCircle className="w-3 h-3" />
                                Phone number not available. Please update your profile.
                              </p>
                            )}
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
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number *"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Address Line 1 *"
                            value={newAddress.addressLine1}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all md:col-span-2"
                          />
                          <input
                            type="text"
                            placeholder="Address Line 2 (Optional)"
                            value={newAddress.addressLine2}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all md:col-span-2"
                          />
                          <input
                            type="text"
                            placeholder="City *"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                          />
                          <input
                            type="text"
                            placeholder="State *"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Pincode *"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                          />
                          <select
                            value={newAddress.type}
                            onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as "home" | "work" | "other" })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={handleAddAddress}
                            disabled={savingAddress}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2"
                          >
                            {savingAddress && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {savingAddress ? 'Saving...' : 'Save Address'}
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
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-primary-600 font-semibold hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
                      >
                        <FiPlus className="w-5 h-5" />
                        Add New Address
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedAddress}
                  className="w-full sm:w-fit px-8 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white font-semibold text-sm rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mx-auto block mt-6"
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
                          {addr.addressLine1}{addr.city && `, ${addr.city}`}{addr.pincode && ` - ${addr.pincode}`}
                        </p>
                        {addr.phone && (
                          <p className="text-sm text-gray-500">Phone: {addr.phone}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${currentStep !== 2 ? "opacity-60" : ""}`}>
            <div
              className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
              onClick={() => currentStep > 2 && setCurrentStep(2)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 2
                  ? "bg-gradient-to-r from-primary-300 to-primary-500 text-white shadow-sm"
                  : "bg-gray-200 text-gray-500"
                  }`}>
                  {currentStep > 2 ? <FiCheck className="w-4 h-4" /> : <FiCreditCard className="w-4 h-4" />}
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

                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-fit px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full sm:w-fit px-8 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white font-semibold text-sm rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all"
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
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${currentStep !== 3 ? "opacity-60" : ""}`}>
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 3
                ? "bg-gradient-to-r from-primary-300 to-primary-500 text-white shadow-sm"
                : "bg-gray-200 text-gray-500"
                }`}>
                <FiCheckCircle className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Review Order</h2>
            </div>

            {currentStep === 3 && (
              <div className="p-6">
                {/* Order Summary */}
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Order will be saved to database</h4>
                  <p className="text-sm text-gray-600">
                    Your order will be recorded with all details including items, address, and payment method.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'}
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
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary-600">
                              ₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                              title="Remove item"
                            >
                              <FiX className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery</span>
                      <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-fit px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full sm:w-fit px-8 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white font-semibold text-sm rounded-xl hover:from-primary-400 hover:to-primary-600 shadow-md hover:shadow-lg transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Placing order...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-5 h-5" />
                        Place Order
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

            {/* Items Preview */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x ₹{(item.discountPrice || item.price).toLocaleString()}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">
                    ₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>Total</span>
                <span className="text-primary-600">₹{total.toLocaleString()}</span>
              </div>
            </div>



            {/* Trust Badges */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <FiShield className="w-4 h-4 text-green-600" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <FiPackage className="w-4 h-4 text-primary-600" />
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
    </div>
  );
}

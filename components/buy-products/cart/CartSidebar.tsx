"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiX,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiMapPin,
  FiTruck,
  FiPercent,
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

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartSidebarProps) {
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const totalSavings = cartItems.reduce((sum, item) => {
    if (item.discountPrice) {
      return sum + (item.price - item.discountPrice) * item.quantity;
    }
    return sum;
  }, 0);

  const deliveryFee = subtotal >= 299 ? 0 : 40;
  const promoDiscountAmount = promoApplied ? Math.round(subtotal * (promoDiscount / 100)) : 0;
  const total = subtotal + deliveryFee - promoDiscountAmount;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = () => {
    // Demo promo codes
    if (promoCode.toUpperCase() === "SAVE10") {
      setPromoDiscount(10);
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === "FIRST20") {
      setPromoDiscount(20);
      setPromoApplied(true);
    } else {
      alert("Invalid promo code");
    }
  };

  const handleProceedToCheckout = () => {
    onClose();
    router.push("/buyer/checkout");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-300 to-primary-500 text-white">
          <div className="flex items-center gap-3">
            <FiShoppingBag className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Your Cart</h2>
              <p className="text-sm text-white/80">{totalItems} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Add some delicious products to get started!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Free Delivery Banner */}
              {subtotal < 299 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3">
                  <FiTruck className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <p className="text-sm text-orange-800">
                    Add <span className="font-bold">₹{299 - subtotal}</span> more for FREE delivery!
                  </p>
                </div>
              )}

              {subtotal >= 299 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                  <FiTruck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800 font-medium">
                    🎉 You've unlocked FREE delivery!
                  </p>
                </div>
              )}

              {/* Cart Items List */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-xl p-4 flex gap-4"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.images[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500";
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {item.seller.name}
                      {item.seller.verified && (
                        <span className="text-green-500 ml-1">✓</span>
                      )}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Price */}
                      <div>
                        <span className="font-bold text-primary-600">
                          ₹{item.discountPrice || item.price}
                        </span>
                        <span className="text-xs text-gray-500">/{item.unit}</span>
                        {item.discountPrice && (
                          <span className="text-xs text-gray-400 line-through ml-2">
                            ₹{item.price}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))
                          }
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Clear Cart Button */}
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="w-full text-center text-red-600 text-sm font-medium py-2 hover:underline"
                >
                  Clear entire cart
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer - Promo & Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {/* Promo Code */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiPercent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  disabled={promoApplied || !promoCode}
                  className="px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {promoApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {promoApplied && (
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                  ✓ Promo code applied! You save ₹{promoDiscountAmount}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Try: SAVE10 or FIRST20
              </p>
            </div>

            {/* Price Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Product Savings</span>
                  <span className="text-green-600 font-medium">-₹{totalSavings}</span>
                </div>
              )}
              {promoApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Promo Discount ({promoDiscount}%)</span>
                  <span className="text-green-600 font-medium">-₹{promoDiscountAmount}</span>
                </div>
              )}
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

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              Proceed to Checkout
              <FiArrowRight className="w-5 h-5" />
            </button>

            {/* Secure Payment Badge */}
            <p className="text-center text-xs text-gray-500 mt-3">
              🔒 Secure checkout with multiple payment options
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-left {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

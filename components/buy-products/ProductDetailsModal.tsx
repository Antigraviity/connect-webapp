"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiStar,
  FiMapPin,
  FiClock,
  FiShield,
  FiShoppingCart,
  FiUser,
  FiPackage,
  FiTruck,
  FiMinus,
  FiPlus,
  FiHeart,
  FiShare2,
  FiMessageSquare,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
  onAddToCart: (product: any, quantity: number) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const reviews = [
    {
      id: 1,
      user: "Priya R.",
      rating: 5,
      comment: "Fresh and excellent quality! Delivered on time.",
      date: "2 days ago",
    },
    {
      id: 2,
      user: "Arun K.",
      rating: 4,
      comment: "Good quality products. Packaging was great.",
      date: "1 week ago",
    },
    {
      id: 3,
      user: "Lakshmi S.",
      rating: 5,
      comment: "Best quality I've found. Will order again!",
      date: "2 weeks ago",
    },
  ];

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const calculateTotal = () => {
    const price = product.discountPrice || product.price;
    return price * quantity;
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    if (!deliveryAddress) {
      alert("Please enter your delivery address");
      return;
    }
    console.log("Buy Now:", {
      product: product.name,
      quantity,
      address: deliveryAddress,
      total: calculateTotal(),
    });
    alert("Order placed successfully!");
    onClose();
  };

  const handleMessageSeller = async () => {
    if (!user) {
      alert("Please sign in to message sellers");
      return;
    }

    if (!product.seller?.id) {
      alert("Seller information not available");
      return;
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: product.seller.id,
          content: `Hi, I'm interested in the product "${product.name}". I'd like to ask a few questions before purchasing.`,
          type: 'PRODUCT',
          orderId: product.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/buyer/messages/products?chat=${product.seller.id}`);
        onClose();
      } else {
        alert(data.message || "Failed to start conversation");
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
      alert("Failed to message seller");
    }
  };

  // Generate multiple images for gallery (using product image as base)
  const productImages = product.images?.length > 1
    ? product.images
    : [
      product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500',
    ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-slide-up">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <FiX className="w-6 h-6 text-gray-700" />
          </button>

          {/* Content */}
          <div className="max-h-[90vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Column - Images */}
              <div className="p-6 bg-gray-50">
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
                    }}
                  />

                  {/* Discount Badge */}
                  {product.discountPrice && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFavorite
                        ? "bg-red-500 text-white"
                        : "bg-white/90 text-gray-600 hover:bg-white"
                        }`}
                    >
                      <FiHeart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                    <button className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-600 transition-all">
                      <FiShare2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {productImages.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index
                        ? "border-primary-500 ring-2 ring-primary-200"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="p-6 lg:p-8">
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-full">
                    {product.category}
                  </span>
                </div>

                {/* Product Name */}
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 font-heading">
                  {product.name}
                </h2>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">{product.rating}</span>
                    <span className="text-gray-500">({product.totalReviews} reviews)</span>
                  </div>
                  {product.seller?.verified && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                      ✓ Verified Seller
                    </span>
                  )}
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.seller?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4" />
                      {product.city}, {product.state}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary-600">
                      ₹{product.discountPrice || product.price}
                    </span>
                    {product.discountPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.price}
                      </span>
                    )}
                    <span className="text-gray-500">per {product.unit}</span>
                  </div>
                  {product.discountPrice && (
                    <p className="text-green-600 text-sm font-medium mt-1">
                      You save ₹{product.price - product.discountPrice}!
                    </p>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-4">
                  <FiPackage className={`w-5 h-5 ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`} />
                  <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.stock > 10 ? `In Stock (${product.stock} available)` : `Only ${product.stock} left - Order soon!`}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={decrementQuantity}
                        className="px-4 py-3 hover:bg-gray-100 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <FiMinus className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="px-6 py-3 font-bold text-gray-900 border-x-2 border-gray-200">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        className="px-4 py-3 hover:bg-gray-100 transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <FiPlus className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <span className="text-gray-500 text-sm">
                      Max: {product.stock} {product.unit}s
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <FiTruck className="inline w-4 h-4 mr-1" />
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your complete delivery address"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Price ({quantity} {product.unit}s)</span>
                    <span>₹{(product.discountPrice || product.price) * quantity}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary-600 pt-3 border-t border-gray-300">
                    <span>Total</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-primary-500 text-primary-600 font-semibold py-3.5 px-6 rounded-xl hover:bg-primary-50 transition-all"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 border-2 border-primary-500 text-primary-600 font-semibold py-3.5 px-6 rounded-xl hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white hover:border-transparent transition-all shadow-sm hover:shadow-lg"
                  >
                    Buy Now
                  </button>
                </div>

                {/* Message Seller Button */}
                <button
                  onClick={handleMessageSeller}
                  className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6"
                >
                  <FiMessageSquare className="w-5 h-5 text-gray-500" />
                  Ask Seller a Question
                </button>

                {/* Delivery Info */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <FiTruck className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Express Delivery Available
                      </h4>
                      <p className="text-sm text-gray-700">
                        Order now and get it delivered within 24-48 hours. Free delivery on orders above ₹299.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Safety Badge */}
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <FiShield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Quality Guaranteed
                      </h4>
                      <p className="text-sm text-gray-700">
                        100% quality assurance. Full refund if product doesn't meet expectations. All sellers are verified.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="p-6 lg:p-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Customer Reviews
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {review.user}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${i < review.rating
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

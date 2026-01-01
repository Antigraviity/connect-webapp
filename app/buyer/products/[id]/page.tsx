"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiArrowLeft,
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiShield,
  FiPhone,
  FiMail,
  FiUser,
  FiLoader,
  FiAlertCircle,
  FiCheck,
  FiShare2,
  FiX,
  FiShoppingBag,
} from "react-icons/fi";
import { useCart } from "../../layout";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string;
  rating: number;
  totalReviews: number;
  city?: string;
  state?: string;
  zipCode?: string;
  status: string;
  type: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    verified: boolean;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      if (user?.id) {
        checkIfFavorite();
      }
    }
    updateCartCount();
  }, [productId, user]);

  const updateCartCount = () => {
    const savedCart = localStorage.getItem("cartItems");
    const cartItems = savedCart ? JSON.parse(savedCart) : [];
    const totalItems = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    setCartItemsCount(totalItems);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/services/${productId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setProduct(data.data);

        // Track view count - increment in database
        trackProductView();
      } else {
        setError(data.message || "Product not found");
      }
    } catch (err) {
      console.error("Fetch product error:", err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const trackProductView = async () => {
    try {
      await fetch('/api/services/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: productId,
          userId: user?.id || null,
        }),
      });
      console.log('✅ Product view tracked');
    } catch (err) {
      console.error('Failed to track view:', err);
      // Fail silently - don't disrupt user experience
    }
  };

  const checkIfFavorite = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/favorites?userId=${user.id}&serviceId=${productId}`
      );
      const data = await response.json();
      setIsFavorite(data.isFavorite || false);
    } catch (err) {
      console.error("Check favorite error:", err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user?.id) {
      alert("Please sign in to add to wishlist");
      router.push("/auth/signin");
      return;
    }

    setAddingToFavorites(true);

    try {
      if (isFavorite) {
        const response = await fetch(
          `/api/favorites?userId=${user.id}&serviceId=${productId}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();

        if (data.success) {
          setIsFavorite(false);
        } else {
          alert(data.message || "Failed to remove from wishlist");
        }
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            serviceId: productId,
          }),
        });
        const data = await response.json();

        if (data.success) {
          setIsFavorite(true);
        } else {
          alert(data.message || "Failed to add to wishlist");
        }
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
      alert("An error occurred");
    } finally {
      setAddingToFavorites(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    setAddingToCart(true);

    try {
      const savedCart = localStorage.getItem("cartItems");
      const cartItems = savedCart ? JSON.parse(savedCart) : [];

      const existingItem = cartItems.find((item: any) => item.id === product.id);

      if (existingItem) {
        const updatedCart = cartItems.map((item: any) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      } else {
        const newItem = {
          id: product.id,
          name: product.title,
          price: product.price,
          discountPrice: product.discountPrice,
          images: [getProductImages(product.images)[0]],
          seller: product.seller,
          unit: "item",
          quantity: quantity,
        };
        localStorage.setItem(
          "cartItems",
          JSON.stringify([...cartItems, newItem])
        );
      }

      // Update cart count and show success toast
      updateCartCount();
      refreshCart();
      setShowSuccessToast(true);
      setQuantity(1);

      // Hide toast after 4 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const getProductImages = (imagesStr: string): string[] => {
    try {
      const images =
        typeof imagesStr === "string" ? JSON.parse(imagesStr) : imagesStr;
      if (Array.isArray(images) && images.length > 0) {
        return images;
      }
    } catch (e) { }
    return [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    ];
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The product you're looking for doesn't exist"}
          </p>
          <Link
            href="/buyer/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = getProductImages(product.images);
  const discountPercent =
    product.discountPrice && product.price
      ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
      : 0;
  const finalPrice = product.discountPrice || product.price;

  return (
    <div className="p-4 max-w-6xl mx-auto pb-24">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in">
          <FiCheck className="w-5 h-5" />
          <div>
            <p className="font-semibold">Added to Cart!</p>
            <p className="text-sm opacity-90">{quantity} item(s) added successfully</p>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="ml-4 hover:bg-green-700 p-1 rounded"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating View Cart Button */}
      {cartItemsCount > 0 && (
        <Link
          href="/buyer/checkout"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-6 py-4 bg-primary-600 text-white rounded-full shadow-2xl hover:bg-primary-700 transition-all hover:scale-105"
        >
          <div className="relative">
            <FiShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItemsCount}
            </span>
          </div>
          <span className="font-semibold">View Cart</span>
        </Link>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '350px' }}>
            <img
              src={images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800";
              }}
            />
            {discountPercent > 0 && (
              <div className="absolute top-3 left-3">
                {/* Badge removed */}
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative bg-gray-100 rounded-md overflow-hidden h-16 ${selectedImage === idx
                    ? "ring-2 ring-primary-600"
                    : "hover:ring-2 hover:ring-gray-300"
                    } transition-all`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          {/* Category & Status */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary-50 text-primary-700 rounded-full">
              {product.category?.name || "General"}
            </span>
            {product.status === "ACTIVE" && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 rounded-full flex items-center gap-1">
                <FiCheck className="w-3 h-3" />
                Available
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-600 text-white rounded-md">
              <span className="text-sm font-bold">
                {product.rating?.toFixed(1) || "0.0"}
              </span>
              <FiStar className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="text-sm text-gray-600">
              {product.totalReviews || 0} reviews
            </span>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary-600">
                ₹{finalPrice.toLocaleString()}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-base font-semibold text-green-600">
                    Save ₹{(product.price - product.discountPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600">Inclusive of all taxes</p>
          </div>

          {/* Location */}
          {(product.city || product.state) && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiMapPin className="w-4 h-4" />
              <span>
                {[product.city, product.state].filter(Boolean).join(", ")}
                {product.zipCode && ` - ${product.zipCode}`}
              </span>
            </div>
          )}

          {/* Seller Info */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              Seller Information
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {product.seller?.name || "Local Seller"}
                </span>
                {product.seller?.verified && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <FiCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              {product.seller?.email && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FiMail className="w-3.5 h-3.5" />
                  {product.seller.email}
                </div>
              )}
              {product.seller?.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <FiPhone className="w-3.5 h-3.5" />
                  {product.seller.phone}
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-900">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-lg font-semibold"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-lg font-semibold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-primary-500 text-primary-600 font-semibold px-4 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white hover:border-transparent transition-all disabled:opacity-50 text-sm"
            >
              {addingToCart ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
            <button
              onClick={handleToggleFavorite}
              disabled={addingToFavorites}
              className={`px-3 py-2.5 rounded-lg transition-colors font-semibold ${isFavorite
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50`}
            >
              {addingToFavorites ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiHeart
                  className={`w-4 h-4 ${isFavorite ? "fill-red-600" : ""}`}
                />
              )}
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div className="text-center">
              <FiPackage className="w-5 h-5 text-primary-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Quality</p>
            </div>
            <div className="text-center">
              <FiTruck className="w-5 h-5 text-primary-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Fast Delivery</p>
            </div>
            <div className="text-center">
              <FiShield className="w-5 h-5 text-primary-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Product Description
        </h2>
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {product.description}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Additional Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-gray-600">Product ID:</span>
            <p className="font-medium text-gray-900">{product.id}</p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Status:</span>
            <p className="font-medium text-gray-900">{product.status}</p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Type:</span>
            <p className="font-medium text-gray-900">{product.type}</p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Listed On:</span>
            <p className="font-medium text-gray-900">
              {new Date(product.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

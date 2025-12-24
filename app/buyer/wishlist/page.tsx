"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiStar,
  FiFilter,
  FiSearch,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiExternalLink,
  FiLoader,
  FiRefreshCw,
  FiMapPin,
} from "react-icons/fi";

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
    verified: boolean;
  };
}

interface FavoriteItem {
  id: string;
  userId: string;
  serviceId: string;
  createdAt: string;
  service: Product;
}

export default function WishlistPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch favorites on mount
  useEffect(() => {
    if (user?.id) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch favorites with product details, filter by PRODUCT type
      const response = await fetch(`/api/favorites?userId=${user.id}&type=PRODUCT`);
      const data = await response.json();

      if (data.success) {
        setFavorites(data.favorites || []);
      } else {
        setError(data.message || 'Failed to fetch wishlist');
      }
    } catch (err) {
      console.error('Fetch favorites error:', err);
      setError('An error occurred while loading wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (favoriteId: string, serviceId: string) => {
    if (!user?.id) return;

    setRemovingId(favoriteId);

    try {
      const response = await fetch(`/api/favorites?userId=${user.id}&serviceId=${serviceId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      } else {
        alert(data.message || 'Failed to remove from wishlist');
      }
    } catch (err) {
      console.error('Remove favorite error:', err);
      alert('An error occurred while removing from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (product: Product) => {
    // Get existing cart from localStorage
    const savedCart = localStorage.getItem("cartItems");
    const cartItems = savedCart ? JSON.parse(savedCart) : [];

    // Check if product already in cart
    const existingItem = cartItems.find((item: any) => item.id === product.id);

    if (existingItem) {
      // Increase quantity
      const updatedCart = cartItems.map((item: any) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    } else {
      // Add new item
      const newItem = {
        id: product.id,
        name: product.title,
        price: product.price,
        discountPrice: product.discountPrice,
        images: [getProductImage(product.images)],
        seller: product.seller,
        unit: 'item',
        quantity: 1,
      };
      localStorage.setItem("cartItems", JSON.stringify([...cartItems, newItem]));
    }

    alert("Product added to cart!");
  };

  // Parse images from JSON string
  const getProductImage = (imagesStr: string): string => {
    try {
      const images = typeof imagesStr === 'string' ? JSON.parse(imagesStr) : imagesStr;
      if (Array.isArray(images) && images.length > 0) {
        return images[0];
      }
    } catch (e) {}
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
  };

  // Get unique categories from favorites
  const categories = ["all", ...Array.from(new Set(favorites.map(f => f.service?.category?.name).filter(Boolean)))];

  // Filter and sort products
  let filteredProducts = favorites.filter(fav => {
    const product = fav.service;
    if (!product) return false;
    
    const matchesSearch = 
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category?.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    const productA = a.service;
    const productB = b.service;
    
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "price-low":
        return (productA?.discountPrice || productA?.price || 0) - (productB?.discountPrice || productB?.price || 0);
      case "price-high":
        return (productB?.discountPrice || productB?.price || 0) - (productA?.discountPrice || productA?.price || 0);
      case "rating":
        return (productB?.rating || 0) - (productA?.rating || 0);
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalValue = favorites.reduce((sum, fav) => sum + (fav.service?.discountPrice || fav.service?.price || 0), 0);
  const avgDiscount = favorites.length > 0
    ? Math.round(favorites.reduce((sum, fav) => {
        const product = fav.service;
        if (product?.discountPrice && product?.price) {
          return sum + ((product.price - product.discountPrice) / product.price * 100);
        }
        return sum;
      }, 0) / favorites.length)
    : 0;

  // If not logged in
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Please Sign In</h3>
          <p className="text-gray-600 mb-4">Sign in to view your wishlist</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-1">
            {favorites.length} product{favorites.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>
        <button
          onClick={fetchFavorites}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '-' : favorites.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FiHeart className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {loading ? '-' : categories.length - 1}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiPackage className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {loading ? '-' : `₹${totalValue.toLocaleString()}`}
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Discount</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {loading ? '-' : `${avgDiscount}%`}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <FiTag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiLoader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiHeart className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Wishlist</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFavorites}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products in Wishlist</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterCategory !== "all"
                  ? "No products match your search criteria"
                  : "Start adding products you love to your wishlist"}
              </p>
              <Link
                href="/buyer/products"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiShoppingCart className="w-4 h-4" />
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((favorite) => {
                const product = favorite.service;
                if (!product) return null;

                const productImage = getProductImage(product.images);
                const discountPercent = product.discountPrice && product.price
                  ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                  : 0;
                const isRemoving = removingId === favorite.id;

                return (
                  <div
                    key={favorite.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={productImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
                        }}
                      />
                      
                      {/* Discount Badge */}
                      {discountPercent > 0 && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg">
                          {discountPercent}% OFF
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFromWishlist(favorite.id, product.id)}
                        disabled={isRemoving}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isRemoving ? (
                          <FiLoader className="w-5 h-5 text-red-600 animate-spin" />
                        ) : (
                          <FiHeart className="w-5 h-5 text-red-600 fill-red-600" />
                        )}
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-primary-50 text-primary-700 rounded-full mb-2">
                          {product.category?.name || 'General'}
                        </span>
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.seller?.name || 'Local Seller'}
                          {product.seller?.verified && <span className="text-green-500 ml-1">✓</span>}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-semibold">
                          <span>{product.rating?.toFixed(1) || '0.0'}</span>
                          <FiStar className="w-3 h-3 fill-white" />
                        </div>
                        <span className="text-xs text-gray-600">({product.totalReviews || 0} reviews)</span>
                      </div>

                      {/* Location */}
                      {(product.city || product.state) && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                          <FiMapPin className="w-3 h-3" />
                          {[product.city, product.state].filter(Boolean).join(', ')}
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-primary-600">
                            ₹{(product.discountPrice || product.price)?.toLocaleString()}
                          </span>
                          {product.discountPrice && product.discountPrice < product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.price?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                        >
                          <FiShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                        <Link
                          href={`/buyer/products/${product.id}`}
                          className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Added Date */}
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Added {new Date(favorite.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          {filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  filteredProducts.forEach(fav => {
                    if (fav.service) {
                      handleAddToCart(fav.service);
                    }
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                <FiShoppingCart className="w-5 h-5" />
                Add All to Cart ({filteredProducts.length} items)
              </button>
              <Link
                href="/buyer/products"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
              >
                <FiPackage className="w-5 h-5" />
                Continue Shopping
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

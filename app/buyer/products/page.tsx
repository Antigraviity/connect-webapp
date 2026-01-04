"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPin, Navigation, Search, ShoppingBag } from "lucide-react";
import { FiStar, FiMapPin, FiHeart, FiShoppingCart, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiX, FiPackage, FiMinus, FiPlus, FiTrash2, FiArrowRight, FiPercent, FiTruck, FiShield, FiCheck, FiRefreshCw, FiLoader } from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "../layout";

// Product Interface
interface Product {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string;
  rating: number;
  totalReviews: number;
  zipCode?: string;
  city?: string;
  state?: string;
  metaTitle?: string; // Shop name
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
  status: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BuyerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [0, 5000],
    rating: 0,
    sortBy: "popularity",
    location: "",
    query: "",
  });

  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
  });

  // Fetch products and categories from database
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch favorites from API when user is available
  useEffect(() => {
    if (user?.id) {
      fetchFavorites();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch only PRODUCT type from Service table with APPROVED status
      const response = await fetch('/api/products?status=APPROVED');
      const data = await response.json();

      console.log('Products API Response:', data); // Debug

      if (data.success) {
        console.log('Products loaded:', data.products?.length || 0);
        // Map products to match expected interface
        const mappedProducts = (data.products || []).map((p: any) => ({
          ...p,
          title: p.title || p.name,
          images: typeof p.images === 'string' ? p.images : JSON.stringify(p.images || []),
        }));
        setProducts(mappedProducts);
      } else {
        console.error('API Error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch only PRODUCT type categories
      const response = await fetch('/api/categories?type=PRODUCT');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch favorites from API
  const fetchFavorites = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/favorites?userId=${user.id}&type=PRODUCT`);
      const data = await response.json();

      if (data.success) {
        // Extract just the service IDs
        const favoriteIds = data.favorites.map((f: any) => f.serviceId);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    refreshCart();
  }, [cartItems, refreshCart]);

  // Typewriter effect
  const productTypes = [
    "fresh vegetables",
    "homemade snacks",
    "organic fruits",
    "street food",
    "bakery items",
  ];

  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingSpeed = isDeleting ? 60 : 100;
    const current = productTypes[index];

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setText(current.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setText(current.slice(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === current.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % productTypes.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, index]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setAddress("Detecting location...");
      setShowDropdown(false);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            );
            const data = await response.json();
            const pincode = data.address?.postcode || "";
            const city = data.address?.city || data.address?.town || data.address?.village || "";
            const locationText = city || pincode || `Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`;
            setAddress(locationText);
            setFilters({ ...filters, location: locationText });
          } catch (error) {
            setAddress("");
          }
        },
        () => {
          alert("Unable to access location.");
          setAddress("");
        }
      );
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, location: address, query: query });
  };

  const toggleFavorite = async (productId: string) => {
    if (!user?.id) {
      // Prompt user to sign in
      alert('Please sign in to add items to your wishlist');
      return;
    }

    setFavoritesLoading(productId);

    try {
      if (favorites.includes(productId)) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?userId=${user.id}&serviceId=${productId}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
          setFavorites(prev => prev.filter(id => id !== productId));
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, serviceId: productId }),
        });
        const data = await response.json();

        if (data.success) {
          setFavorites(prev => [...prev, productId]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoritesLoading(null);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
  };

  // Helper to parse images
  const getProductImage = (product: Product): string => {
    try {
      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(images) && images.length > 0) {
        return images[0];
      }
    } catch (e) { }
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
  };

  // Helper to get shop name
  const getShopName = (product: Product): string => {
    return product.metaTitle || product.seller?.name || 'Local Seller';
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const cartProduct = {
      id: product.id,
      name: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      images: [getProductImage(product)],
      seller: product.seller,
      unit: 'item',
    };

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...cartProduct, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + ((item.discountPrice || item.price) * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Location filter
    if (filters.location && filters.location.trim() !== "") {
      const searchLocation = filters.location.toLowerCase().trim();
      const productZip = product.zipCode?.toLowerCase() || "";
      const productCity = product.city?.toLowerCase() || "";
      if (!productZip.includes(searchLocation) && !productCity.includes(searchLocation)) {
        return false;
      }
    }

    // Price filter
    const productPrice = product.discountPrice || product.price;
    if (productPrice > filters.priceRange[1]) return false;

    // Rating filter
    if (product.rating < filters.rating) return false;

    // Category filter
    if (filters.category !== "all") {
      const productCategorySlug = product.category?.slug?.toLowerCase() || "";
      const productCategoryName = product.category?.name?.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") || "";
      if (productCategorySlug !== filters.category && productCategoryName !== filters.category) return false;
    }

    // Search query filter
    if (filters.query && filters.query.trim() !== "") {
      const searchQuery = filters.query.toLowerCase().trim();
      const matches =
        product.title?.toLowerCase().includes(searchQuery) ||
        product.description?.toLowerCase().includes(searchQuery) ||
        product.seller?.name?.toLowerCase().includes(searchQuery) ||
        product.metaTitle?.toLowerCase().includes(searchQuery);
      if (!matches) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low": return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price-high": return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case "rating": return b.rating - a.rating;
      default: return b.totalReviews - a.totalReviews;
    }
  });

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buy Products</h1>
          <p className="text-gray-600">Fresh products from local sellers delivered to your doorstep</p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
        >
          <LoadingSpinner size="sm" color="current" />
          Refresh
        </button>
      </div>

      {/* Cart Button */}
      <button
        onClick={() => setShowCartSidebar(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold hover:bg-gradient-to-r hover:from-primary-400 hover:to-primary-600 transition-all hover:scale-105"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Cart • ₹{cartTotal}</span>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {cartCount}
          </span>
        )}
      </button>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Location Input */}
            <div className="relative flex items-center flex-1 w-full">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                type="text"
                placeholder="Enter your pincode or city"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
                    <button
                      onClick={handleUseCurrentLocation}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Navigation className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Use my current location</div>
                        <div className="text-xs text-gray-500">Auto-detect your city</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex items-center flex-1 w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3" />
              <input
                type="text"
                placeholder={`Search for '${text}'`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-primary-300 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-400 hover:to-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>

        {/* Location Badge */}
        {filters.location && (
          <div className="mt-3">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm">
              <MapPin className="w-4 h-4" />
              <span>Showing products for: {filters.location}</span>
              <button
                onClick={() => {
                  setAddress("");
                  setFilters(prev => ({ ...prev, location: "" }));
                }}
                className="ml-1 hover:text-primary-900"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <FiFilter className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            </div>

            {/* Sort By */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection("category")}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2"
              >
                <span>Category</span>
                {expandedSections.category ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.category && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === "all"}
                      onChange={() => setFilters({ ...filters, category: "all" })}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-primary-600">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category.slug}
                        onChange={() => setFilters({ ...filters, category: category.slug })}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 group-hover:text-primary-600">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <button
                onClick={() => toggleSection("price")}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-2"
              >
                <span>Price Range</span>
                {expandedSections.price ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.price && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>₹{filters.priceRange[0]}</span>
                    <span>₹{filters.priceRange[1]}+</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })}
                    className="w-full accent-primary-600"
                  />
                </div>
              )}
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => setFilters({
                category: "all",
                priceRange: [0, 5000],
                rating: 0,
                sortBy: "popularity",
                location: filters.location,
                query: filters.query,
              })}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {filteredProducts.length} Products Available
            </h2>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner size="lg" color="primary" label="Loading products from database..." />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
              <button
                onClick={() => {
                  setFilters({
                    category: "all",
                    priceRange: [0, 5000],
                    rating: 0,
                    sortBy: "popularity",
                    location: "",
                    query: "",
                  });
                  setAddress("");
                  setQuery("");
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const productImage = getProductImage(product);
                const shopName = getShopName(product);
                const discountPercent = product.discountPrice
                  ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={productImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';
                        }}
                      />
                      {discountPercent > 0 && (
                        <div className="absolute top-2 left-2">
                          {/* Badge removed */}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        disabled={favoritesLoading === product.id}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${favorites.includes(product.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-600 hover:bg-white"
                          } ${favoritesLoading === product.id ? 'opacity-50' : ''}`}
                      >
                        {favoritesLoading === product.id ? (
                          <LoadingSpinner size="sm" color="current" />
                        ) : (
                          <FiHeart className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-current" : ""}`} />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-primary-50 text-primary-700 rounded-full mb-2">
                        {product.category?.name || 'General'}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{product.title}</h3>
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        {shopName}
                        {product.seller?.verified && <span className="text-green-500">✓</span>}
                      </p>

                      <div className="flex items-center gap-3 mb-2 text-xs">
                        <div className="flex items-center gap-1">
                          <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="font-semibold">{product.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500">({product.totalReviews || 0})</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <FiPackage className="w-3 h-3" />
                          In Stock
                        </div>
                      </div>

                      {(product.city || product.state) && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                          <FiMapPin className="w-3 h-3" />
                          {[product.city, product.state].filter(Boolean).join(', ')}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-base font-bold text-primary-600">
                            ₹{product.discountPrice || product.price}
                          </p>
                          {product.discountPrice && (
                            <p className="text-xs text-gray-400 line-through">₹{product.price}</p>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="flex items-center gap-1 border-2 border-primary-500 text-primary-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white hover:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <FiShoppingCart className="w-3 h-3" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCartSidebar && (
        <CartSidebar
          cartItems={cartItems}
          onClose={() => setShowCartSidebar(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
        />
      )}
    </div>
  );
}

// Cart Sidebar Component
function CartSidebar({
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: {
  cartItems: any[];
  onClose: () => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}) {
  const router = useRouter();

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= 299 ? 0 : 40;
  const total = subtotal + deliveryFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleProceedToCheckout = () => {
    onClose();
    router.push("/buyer/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Your Cart</h2>
              <p className="text-sm text-white/80">{totalItems} items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add some products to get started!</p>
              <button onClick={onClose} className="px-6 py-2 bg-gradient-to-r from-primary-300 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-400 hover:to-primary-600 transition-colors shadow-md">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {subtotal < 299 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <FiTruck className="w-4 h-4 text-orange-600" />
                  <span>Add ₹{299 - subtotal} more for FREE delivery!</span>
                </div>
              )}

              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 flex gap-3">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500'}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.seller?.name || 'Local Seller'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary-600">₹{item.discountPrice || item.price}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onRemoveItem(item.id)} className="text-red-500 p-1">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button onClick={onClearCart} className="w-full text-center text-red-600 text-sm font-medium py-2">
                Clear entire cart
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className={deliveryFee === 0 ? "text-primary-600 font-medium" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">₹{total}</span>
              </div>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 flex items-center justify-center gap-2 shadow-lg"
            >
              Proceed to Checkout
              <FiArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

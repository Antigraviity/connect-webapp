"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/buy-products/ProductGrid";
import ProductFiltersSidebar from "@/components/buy-products/ProductFiltersSidebar";
import ProductDetailsModal from "@/components/buy-products/ProductDetailsModal";
import ServiceConnectTeaser from "@/components/buy-products/ServiceConnectTeaser";
import CartSidebar from "@/components/buy-products/cart/CartSidebar";
import { MapPin, Navigation, Search, ShoppingBag } from "lucide-react";

// Loading component for the Suspense boundary
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    </div>
  );
}

// Component that uses useSearchParams
function BuyProductsContent() {
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [0, 10000],
    rating: 0,
    availability: "all",
    sortBy: "popularity",
    location: "",
    query: "",
  });

  const [address, setAddress] = useState("");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // ✨ Auto-populate location from URL parameter
  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setAddress(locationParam);
      setFilters(prev => ({
        ...prev,
        location: locationParam
      }));
    }
  }, [searchParams]);

  // ✨ Typewriter setup
  const products = [
    "fresh vegetables",
    "homemade snacks",
    "organic fruits",
    "street food",
    "bakery items",
    "dairy products",
  ];

  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingSpeed = isDeleting ? 60 : 100;
    const current = products[index];

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
        setIndex((prev) => (prev + 1) % products.length);
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
            // Reverse geocode using OpenStreetMap
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            );
            const data = await response.json();

            // Extract pincode if available, otherwise use display name
            const pincode = data.address?.postcode || "";
            const locationText = pincode || data.display_name || `Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`;
            
            setAddress(locationText);
            setFilters({ ...filters, location: locationText });
          } catch (error) {
            console.error("Error fetching address:", error);
            const locationText = `Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`;
            setAddress(locationText);
            setFilters({ ...filters, location: locationText });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to access location. Please enable GPS or enter manually.");
          setAddress("");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...filters,
      location: address,
      query: query,
    });
  };

  const addToCart = (product: any, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔍 Compact Sticky Search Section */}
      <section className="bg-white sticky top-20 z-40 border-b border-gray-100 pt-6 pb-6">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="flex items-center bg-white border border-gray rounded-full shadow-md px-3 py-2 gap-2 focus-within:ring-1 focus-within:ring-primary-300 transition-all">

              {/* 📍 Location input */}
              <div className="relative flex items-center flex-1 border-r border-gray-200 pr-3">
                <MapPin className="w-4 h-4 text-gray mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your pincode or address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
                />

                {/* Dropdown */}
                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    ></div>

                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden z-20">
                      <button
                        onClick={handleUseCurrentLocation}
                        type="button"
                        className="w-full flex items-center gap-2 px-5 py-2.5 hover:bg-primary-50 transition-colors text-left"
                      >
                        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Navigation className="w-3.5 h-3.5 text-primary-600"/>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-xs">
                            Use my current location
                          </div>
                          <div className="text-[10px] text-gray-500">
                            Auto-detect your current address
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* 💡 Product search input with typing animation */}
              <div className="flex items-center flex-1 relative">
                <Search className="w-4 h-4 text-gray mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={`Search for '${text}'`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
                />
                {/* Blinking cursor */}
                <span className="absolute right-3 text-primary-300 animate-pulse font-bold text-lg">
                  |
                </span>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="ml-1 border border-gray text-gray hover:bg-gradient-to-r from-primary-300 to-primary-500 hover:text-white rounded-full px-4 py-1.5 flex items-center gap-1 text-sm font-normal transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>

              {/* Cart Button */}
              <button 
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="ml-2 relative flex items-center gap-2 bg-primary-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>₹{cartTotal}</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </form>
          
          {/* Location Badge - Shows when location is set */}
          {filters.location && (
            <div className="mt-3 flex items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                <MapPin className="w-4 h-4" />
                <span>Showing products for: {filters.location}</span>
                <button
                  onClick={() => {
                    setAddress("");
                    setFilters(prev => ({ ...prev, location: "" }));
                  }}
                  className="ml-2 text-primary-600 hover:text-primary-800 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 📦 Main Layout */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64 flex-shrink-0">
              <ProductFiltersSidebar filters={filters} setFilters={setFilters} />
            </div>

            <div className="flex-1">
              <ProductGrid
                filters={filters}
                onProductClick={setSelectedProduct}
                onAddToCart={addToCart}
              />
            </div>
          </div>
        </div>
      </section>

      <ServiceConnectTeaser />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
}

// Main component with Suspense boundary
export default function BuyProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <BuyProductsContent />
    </Suspense>
  );
}

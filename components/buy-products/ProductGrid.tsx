"use client";

import { useState, useEffect } from "react";
import { FiStar, FiMapPin, FiHeart, FiShoppingCart, FiSearch, FiPackage, FiLoader } from "react-icons/fi";
import { useAuth } from "@/lib/useAuth";

interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  rating: number;
  totalReviews: number;
  zipCode?: string;
  city?: string;
  state?: string;
  address?: string;
  category: string;
  seller: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  };
  stock: number;
  unit: string;
  status: string;
}

interface ProductGridProps {
  filters: {
    category: string;
    priceRange: number[];
    rating: number;
    availability: string;
    sortBy: string;
    location: string;
    query: string;
  };
  onProductClick: (product: any) => void;
  onAddToCart: (product: any, quantity?: number) => void;
}

// Mock products data - Used as fallback when no products in database
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Organic Vegetables Basket",
    description: "A curated basket of fresh organic vegetables sourced directly from local farms. Includes tomatoes, carrots, spinach, and more.",
    price: 299,
    discountPrice: 249,
    images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500"],
    rating: 4.8,
    totalReviews: 156,
    zipCode: "600001",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Vegetables",
    seller: { id: "s1", name: "Green Farm Fresh", email: "farm@example.com", verified: true },
    stock: 50,
    unit: "basket",
    status: "APPROVED"
  },
  {
    id: "2",
    name: "Homemade Murukku Pack",
    description: "Traditional crispy murukku made with rice flour and urad dal. Authentic South Indian snack.",
    price: 150,
    discountPrice: 120,
    images: ["https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500"],
    rating: 4.9,
    totalReviews: 234,
    zipCode: "600001",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Snacks",
    seller: { id: "s2", name: "Amma's Kitchen", email: "amma@example.com", verified: true },
    stock: 100,
    unit: "pack",
    status: "APPROVED"
  },
  {
    id: "3",
    name: "Fresh Chicken Biryani",
    description: "Aromatic Hyderabadi style chicken biryani with long grain basmati rice and tender chicken pieces.",
    price: 350,
    discountPrice: 299,
    images: ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500"],
    rating: 4.7,
    totalReviews: 412,
    zipCode: "600002",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Food",
    seller: { id: "s3", name: "Biryani House", email: "biryani@example.com", verified: true },
    stock: 30,
    unit: "portion",
    status: "APPROVED"
  },
  {
    id: "4",
    name: "Farm Fresh Eggs (12 pcs)",
    description: "Free-range eggs from healthy country chickens. High in protein and omega-3.",
    price: 120,
    images: ["https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500"],
    rating: 4.6,
    totalReviews: 89,
    zipCode: "600003",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Dairy & Eggs",
    seller: { id: "s4", name: "Country Farm", email: "country@example.com", verified: true },
    stock: 200,
    unit: "dozen",
    status: "APPROVED"
  },
  {
    id: "5",
    name: "Homemade Banana Chips",
    description: "Crispy Kerala style banana chips made with fresh nendran bananas and pure coconut oil.",
    price: 180,
    discountPrice: 150,
    images: ["https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=500"],
    rating: 4.8,
    totalReviews: 178,
    zipCode: "600001",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Snacks",
    seller: { id: "s5", name: "Kerala Delights", email: "kerala@example.com", verified: true },
    stock: 80,
    unit: "pack",
    status: "APPROVED"
  },
  {
    id: "6",
    name: "Fresh Fruit Basket",
    description: "Assorted seasonal fruits including mangoes, apples, bananas, and grapes. Perfect for gifting.",
    price: 499,
    discountPrice: 449,
    images: ["https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500"],
    rating: 4.5,
    totalReviews: 67,
    zipCode: "600002",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Fruits",
    seller: { id: "s6", name: "Fruit Paradise", email: "fruit@example.com", verified: true },
    stock: 25,
    unit: "basket",
    status: "APPROVED"
  },
  {
    id: "7",
    name: "Homemade Pickle Combo",
    description: "Traditional pickles made with authentic recipes. Includes mango, lime, and mixed vegetable pickles.",
    price: 350,
    discountPrice: 299,
    images: ["https://images.unsplash.com/photo-1589135233689-2cf7e23b7e1c?w=500"],
    rating: 4.9,
    totalReviews: 245,
    zipCode: "600003",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Pickles & Chutneys",
    seller: { id: "s7", name: "Granny's Pickles", email: "granny@example.com", verified: true },
    stock: 60,
    unit: "combo",
    status: "APPROVED"
  },
  {
    id: "8",
    name: "Fresh Paneer (500g)",
    description: "Soft and fresh paneer made from pure cow milk. Perfect for curries and snacks.",
    price: 220,
    images: ["https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500"],
    rating: 4.7,
    totalReviews: 134,
    zipCode: "600001",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Dairy & Eggs",
    seller: { id: "s8", name: "Dairy Fresh", email: "dairy@example.com", verified: true },
    stock: 40,
    unit: "500g",
    status: "APPROVED"
  },
  {
    id: "9",
    name: "Samosa Party Pack (12 pcs)",
    description: "Crispy samosas with spiced potato filling. Perfect for parties and snack time.",
    price: 180,
    discountPrice: 150,
    images: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500"],
    rating: 4.6,
    totalReviews: 198,
    zipCode: "600002",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Street Food",
    seller: { id: "s9", name: "Street Bites", email: "street@example.com", verified: true },
    stock: 50,
    unit: "pack",
    status: "APPROVED"
  },
];

export default function ProductGrid({
  filters,
  onProductClick,
  onAddToCart,
}: ProductGridProps) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFavorite, setLoadingFavorite] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const itemsPerPage = 9;

  // Fetch user's favorites on mount
  useEffect(() => {
    if (user?.id) {
      fetchUserFavorites();
    }
  }, [user]);

  const fetchUserFavorites = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/favorites?userId=${user.id}&type=PRODUCT`);
      const data = await response.json();
      
      if (data.success && data.favorites) {
        const favoriteIds = data.favorites.map((fav: any) => fav.serviceId);
        setFavorites(favoriteIds);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query params
        const params = new URLSearchParams();
        params.append('status', 'APPROVED');
        params.append('limit', '100');
        
        if (filters.location && filters.location.trim()) {
          // Try to detect if it's a pincode or city
          const location = filters.location.trim();
          if (/^\d{6}$/.test(location)) {
            params.append('zipCode', location);
          } else {
            params.append('city', location);
          }
        }
        
        if (filters.query && filters.query.trim()) {
          params.append('search', filters.query.trim());
        }
        
        if (filters.priceRange[1] < 10000) {
          params.append('maxPrice', filters.priceRange[1].toString());
        }
        
        // Sort mapping
        if (filters.sortBy === 'price-low') {
          params.append('sortBy', 'price');
          params.append('sortOrder', 'asc');
        } else if (filters.sortBy === 'price-high') {
          params.append('sortBy', 'price');
          params.append('sortOrder', 'desc');
        } else if (filters.sortBy === 'rating') {
          params.append('sortBy', 'rating');
          params.append('sortOrder', 'desc');
        } else {
          params.append('sortBy', 'popularity');
        }
        
        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        
        if (data.success && data.products && data.products.length > 0) {
          // Map API response to expected format
          const mappedProducts = data.products.map((p: any) => ({
            id: p.id,
            name: p.name || p.title,
            description: p.description,
            shortDescription: p.shortDescription,
            price: p.price,
            discountPrice: p.discountPrice,
            images: Array.isArray(p.images) ? p.images : [p.images],
            rating: p.rating || 0,
            totalReviews: p.totalReviews || 0,
            zipCode: p.zipCode,
            city: p.city,
            state: p.state,
            address: p.address,
            category: p.category || 'Uncategorized',
            seller: p.seller || { id: '', name: 'Unknown Seller', email: '', verified: false },
            stock: p.stock || 100,
            unit: p.unit || 'piece',
            status: p.status,
          }));
          setProducts(mappedProducts);
          setUsingMockData(false);
        } else {
          // No products in database, use mock data
          console.log('No products found in database, using mock data');
          setProducts(mockProducts);
          setUsingMockData(true);
        }
      } catch (err) {
        console.error('Fetch products error:', err);
        // On error, fall back to mock data
        setProducts(mockProducts);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters.location, filters.query, filters.sortBy, filters.priceRange]);

  const toggleFavorite = async (productId: string) => {
    if (!user?.id) {
      alert('Please sign in to add items to your wishlist');
      return;
    }

    setLoadingFavorite(productId);

    try {
      if (favorites.includes(productId)) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?userId=${user.id}&serviceId=${productId}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
          setFavorites((prev) => prev.filter((id) => id !== productId));
        } else {
          alert(data.message || 'Failed to remove from wishlist');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            serviceId: productId,
          }),
        });
        const data = await response.json();

        if (data.success) {
          setFavorites((prev) => [...prev, productId]);
        } else {
          alert(data.message || 'Failed to add to wishlist');
        }
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setLoadingFavorite(null);
    }
  };

  // Filter and sort products (for mock data or additional client-side filtering)
  const filteredProducts = products
    .filter((product: Product) => {
      // Location filter (only for mock data, API handles this)
      if (usingMockData && filters.location && filters.location.trim() !== "") {
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
        const categoryMatch = product.category.toLowerCase().replace(/ /g, "-");
        if (categoryMatch !== filters.category) return false;
      }
      
      // Query/keyword filter (only for mock data, API handles this)
      if (usingMockData && filters.query && filters.query.trim() !== "") {
        const searchQuery = filters.query.toLowerCase().trim();
        const productName = product.name?.toLowerCase() || "";
        const productDesc = product.description?.toLowerCase() || "";
        const sellerName = product.seller?.name?.toLowerCase() || "";
        
        const matches =
          productName.includes(searchQuery) ||
          productDesc.includes(searchQuery) ||
          sellerName.includes(searchQuery);
        
        if (!matches) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Only sort mock data, API handles sorting
      if (!usingMockData) return 0;
      
      switch (filters.sortBy) {
        case "price-low":
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case "price-high":
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case "rating":
          return b.rating - a.rating;
        default:
          return b.totalReviews - a.totalReviews;
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-primary-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Mock Data Notice */}
      {!loading && usingMockData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Demo Mode:</strong> Showing sample products. Add real products via vendor dashboard or admin panel.
          </p>
        </div>
      )}

      {/* Results Header */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-heading">
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Available
            {filters.location && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                in {filters.location}
              </span>
            )}
          </h2>
        </div>
      )}

      {/* Top Pagination */}
      {!loading && !error && <Pagination />}

      {/* Product Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-transparent hover:border-primary-300 transition-all duration-300 overflow-hidden group"
            >
              {/* Image */}
              <div
                className="relative h-44 overflow-hidden cursor-pointer"
                onClick={() => onProductClick(product)}
              >
                <img
                  src={product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
                  }}
                />
                
                {/* Discount Badge */}
                {product.discountPrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  disabled={loadingFavorite === product.id}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-70 ${
                    favorites.includes(product.id)
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-gray-600 hover:bg-white"
                  }`}
                >
                  {loadingFavorite === product.id ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiHeart className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-current" : ""}`} />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Category Badge */}
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-[10px] font-semibold bg-green-50 text-green-700 rounded-full">
                    {product.category}
                  </span>
                </div>
                
                {/* Product Name */}
                <h3 
                  className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  {product.name}
                </h3>

                {/* Seller */}
                <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                  {product.seller.name}
                  {product.seller.verified && (
                    <span className="text-green-500">✓</span>
                  )}
                </p>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-semibold text-gray-900">
                      {product.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.totalReviews})
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <FiMapPin className="w-3 h-3" />
                  <span>{product.city}, {product.state}</span>
                </div>
                
                {/* Stock Status */}
                <div className="flex items-center gap-2 text-xs mb-3">
                  <FiPackage className="w-3 h-3 text-green-600" />
                  <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                  </span>
                </div>

                {/* Price & Button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-lg font-bold text-primary-600">
                      ₹{product.discountPrice || product.price}
                      <span className="text-xs text-gray-500 font-normal">/{product.unit}</span>
                    </p>
                    {product.discountPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        ₹{product.price}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product, 1);
                    }}
                    className="flex items-center gap-1 border-2 border-primary-500 text-primary-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-600 hover:text-white hover:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <FiShoppingCart className="w-3 h-3" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Pagination */}
      {!loading && !error && <Pagination />}

      {/* No Results */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mb-6">
            <FiSearch className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Products Not Available
          </h3>
          <p className="text-gray-600 mb-2 max-w-md mx-auto">
            {filters.location ? (
              <>
                No products are currently available for <span className="font-semibold text-primary-600">"{filters.location}"</span>
              </>
            ) : (
              "We couldn't find any products matching your criteria"
            )}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {filters.location ? (
              "Products are only shown for their assigned areas. Try a different pincode or location."
            ) : (
              "Try adjusting your filters or search in a different location"
            )}
          </p>
          
          {/* Suggestions */}
          <div className="max-w-md mx-auto">
            <p className="text-sm font-semibold text-gray-700 mb-3">Suggestions:</p>
            <div className="grid grid-cols-1 gap-2 text-left">
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                <span className="text-primary-600 font-bold">•</span>
                <span>Try a different 6-digit pincode (e.g., 600001, 641001)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                <span className="text-primary-600 font-bold">•</span>
                <span>Search by city name (e.g., Chennai, Coimbatore)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                <span className="text-primary-600 font-bold">•</span>
                <span>Clear the location filter to browse all products</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

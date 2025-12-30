"use client";

import { useState, useEffect } from "react";
import { FiStar, FiMapPin, FiHeart, FiShoppingCart, FiSearch, FiPackage, FiLoader, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "@/lib/useAuth";

interface Product {
  id: string;
  name: string;
  title?: string;
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
  categoryId?: string;
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

  // Fetch ALL products from API on mount
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ALL approved products - no location filter in API
      const params = new URLSearchParams();
      params.append('status', 'APPROVED');
      params.append('limit', '100');
      
      console.log('Fetching all products with params:', params.toString());
      
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      console.log('Products API response:', data.success, 'Count:', data.products?.length || 0);
      
      if (data.success && data.products) {
        // Map API response to expected format
        const mappedProducts = data.products.map((p: any) => ({
          id: p.id,
          name: p.name || p.title,
          title: p.title || p.name,
          description: p.description,
          shortDescription: p.shortDescription,
          price: p.price,
          discountPrice: p.discountPrice,
          images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images || '[]') : []),
          rating: p.rating || 0,
          totalReviews: p.totalReviews || 0,
          zipCode: p.zipCode,
          city: p.city,
          state: p.state,
          address: p.address,
          category: p.category || 'Uncategorized',
          categoryId: p.categoryId,
          seller: p.seller || { id: '', name: 'Unknown Seller', email: '', verified: false },
          stock: p.stock || 100,
          unit: p.unit || 'piece',
          status: p.status,
        }));
        console.log('Products loaded:', mappedProducts.map((p: any) => ({ id: p.id, name: p.name, city: p.city })));
        setProducts(mappedProducts);
      } else {
        console.log('No products found');
        setProducts([]);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('An error occurred while loading products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleFavorite = async (productId: string) => {
    if (!user?.id) {
      alert('Please sign in to add items to your wishlist');
      return;
    }

    setLoadingFavorite(productId);

    try {
      if (favorites.includes(productId)) {
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

  // Filter and sort products CLIENT-SIDE
  const filteredProducts = products
    .filter((product: Product) => {
      // Location filter - only apply if location is specified
      if (filters.location && filters.location.trim() !== "") {
        const searchLocation = filters.location.toLowerCase().trim();
        const productZip = product.zipCode?.toLowerCase() || "";
        const productCity = product.city?.toLowerCase() || "";
        const productState = product.state?.toLowerCase() || "";
        
        const locationMatches = 
          productZip.includes(searchLocation) || 
          productCity.includes(searchLocation) ||
          productState.includes(searchLocation);
        
        if (!locationMatches) return false;
      }
      
      // Price filter
      const productPrice = product.discountPrice || product.price;
      if (productPrice > filters.priceRange[1]) return false;
      
      // Rating filter
      if (product.rating < filters.rating) return false;
      
      // Category filter
      if (filters.category !== "all") {
        const categoryName = typeof product.category === 'string' 
          ? product.category.toLowerCase().replace(/ /g, "-")
          : '';
        if (categoryName !== filters.category.toLowerCase()) return false;
      }
      
      // Search query filter
      if (filters.query && filters.query.trim() !== "") {
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
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
          >
            <FiRefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      )}

      {/* Results Header */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-heading">
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Available
            {filters.location && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                for "{filters.location}"
              </span>
            )}
          </h2>
          <button 
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 border border-gray-300 rounded-lg hover:border-primary-300 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
                  }}
                />
                
                {/* Discount Badge */}
                {product.discountPrice && product.discountPrice < product.price && (
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
                    {typeof product.category === 'string' ? product.category : 'Product'}
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
                  {product.seller?.name || 'Seller'}
                  {product.seller?.verified && (
                    <span className="text-green-500">✓</span>
                  )}
                </p>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-semibold text-gray-900">
                      {product.rating || 0}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.totalReviews || 0})
                    </span>
                  </div>
                </div>

                {/* Location */}
                {(product.city || product.state) && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <FiMapPin className="w-3 h-3" />
                    <span>{[product.city, product.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                
                {/* Stock Status */}
                <div className="flex items-center gap-2 text-xs mb-3">
                  <FiPackage className="w-3 h-3 text-green-600" />
                  <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                  </span>
                </div>

                {/* Price & Button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-lg font-bold text-primary-600">
                      ₹{product.discountPrice || product.price}
                      <span className="text-xs text-gray-500 font-normal">/{product.unit}</span>
                    </p>
                    {product.discountPrice && product.discountPrice < product.price && (
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
                    disabled={product.stock === 0}
                    className="flex items-center gap-1 border-2 border-primary-500 text-primary-600 text-xs font-semibold px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-600 hover:text-white hover:border-transparent shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            No Products Found
          </h3>
          <p className="text-gray-600 mb-2 max-w-md mx-auto">
            {filters.location ? (
              <>
                No products found for <span className="font-semibold text-primary-600">"{filters.location}"</span>
              </>
            ) : (
              "No products match your current filters"
            )}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Try adjusting your filters or clearing the location
          </p>
          
          {/* Debug info */}
          <div className="text-xs text-gray-400 mb-4">
            Total products loaded: {products.length} | After filters: {filteredProducts.length}
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
          >
            Show All Products
          </button>
        </div>
      )}
    </div>
  );
}

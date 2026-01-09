"use client";

import { useState } from "react";
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface ProductFiltersSidebarProps {
  filters: {
    category: string;
    priceRange: number[];
    rating: number;
    availability: string;
    sortBy: string;
    location?: string;
    query?: string;
  };
  setFilters: (filters: any) => void;
  availableCategories: { name: string, slug: string }[];
}

export default function ProductFiltersSidebar({
  filters,
  setFilters,
  availableCategories,
}: ProductFiltersSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // No longer a nested functional component to avoid re-mounting on every state change (Lag fix)
  const filterForm = (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
        >
          <option value="popularity">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
        >
          <span>Category</span>
          {expandedSections.category ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.category && (
          <div className="space-y-2 max-h-64 overflow-y-auto slim-scrollbar pr-2">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={filters.category === "all"}
                onChange={() => setFilters({ ...filters, category: "all" })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-primary-600">
                All Categories
              </span>
            </label>
            {availableCategories.map((category) => (
              <label
                key={category.slug}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category.slug}
                  onChange={() =>
                    setFilters({
                      ...filters,
                      category: category.slug,
                    })
                  }
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-primary-600">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
        >
          <span>Price Range</span>
          {expandedSections.price ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priceRange: [0, parseInt(e.target.value)],
                })
              }
              className="w-full appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div>
        <button
          onClick={() => toggleSection("rating")}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
        >
          <span>Minimum Rating</span>
          {expandedSections.rating ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.rating && (
          <div className="space-y-2">
            {[4.5, 4.0, 3.5, 3.0].map((rating) => (
              <label
                key={rating}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => setFilters({ ...filters, rating })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 flex items-center text-sm text-gray-700 group-hover:text-primary-600">
                  <span className="text-yellow-500 mr-1">★</span>
                  {rating}+ & above
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div>
        <button
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
        >
          <span>Availability</span>
          {expandedSections.availability ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.availability && (
          <div className="space-y-2">
            {[
              { label: "All Products", value: "all" },
              { label: "In Stock", value: "in-stock" },
              { label: "Express Delivery", value: "express" },
              { label: "Same Day Delivery", value: "same-day" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="availability"
                  checked={filters.availability === option.value}
                  onChange={() =>
                    setFilters({ ...filters, availability: option.value })
                  }
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-primary-600">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Filters */}
      <button
        onClick={() =>
          setFilters({
            category: "all",
            priceRange: [0, 5000],
            rating: 0,
            availability: "all",
            sortBy: "popularity",
            location: filters.location || "",
            query: filters.query || "",
          })
        }
        className="w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-md sticky top-24">
        <div className="flex items-center mb-6">
          <FiFilter className="w-5 h-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        </div>
        {filterForm}
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
      >
        <FiFilter className="w-5 h-5" />
        <span className="font-semibold">Filters</span>
      </button>

      {/* Mobile Filter Modal */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          {/* Modal */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center">
                <FiFilter className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              {filterForm}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

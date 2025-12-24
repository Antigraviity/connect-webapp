"use client";

import { useState } from "react";
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface FiltersSidebarProps {
  filters: {
    category: string;
    salaryRange: number[];
    experience: number;
    jobType: string;
    sortBy: string;
  };
  setFilters: (filters: any) => void;
}

export default function FiltersSidebar({
  filters,
  setFilters,
}: FiltersSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    salary: true,
    experience: true,
    jobType: true,
  });

  const categories = [
    "All Categories",
    "IT & Technology",
    "Banking & Finance",
    "Automotive & Manufacturing",
    "BPO & Customer Experience",
    "HR & Recruitment",
    "Design & Creative",
    "Sales & Business Development",
    "Content Writing",
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const FilterContent = () => (
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
          <option value="salary-low">Salary: Low to High</option>
          <option value="salary-high">Salary: High to Low</option>
          <option value="rating">Highest Rated</option>
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
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  checked={
                    filters.category === category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") ||
                    (category === "All Categories" && filters.category === "all")
                  }
                  onChange={() =>
                    setFilters({
                      ...filters,
                      category:
                        category === "All Categories"
                          ? "all"
                          : category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-"),
                    })
                  }
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-primary-600">
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div>
        <button
          onClick={() => toggleSection("salary")}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
        >
          <span>Salary Range</span>
          {expandedSections.salary ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.salary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>₹{filters.salaryRange[0]}</span>
              <span>₹{filters.salaryRange[1].toLocaleString()}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={filters.salaryRange[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  salaryRange: [0, parseInt(e.target.value)],
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="space-y-2">
              {[
                { label: "Under ₹30,000", max: 30000 },
                { label: "₹30,000 - ₹50,000", max: 50000 },
                { label: "₹50,000 - ₹75,000", max: 75000 },
                { label: "₹75,000 - ₹1,00,000", max: 100000 },
                { label: "Above ₹1,00,000", max: 100000 },
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() =>
                    setFilters({ ...filters, salaryRange: [0, range.max] })
                  }
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Experience Filter */}
      <div>
        <button
          onClick={() => toggleSection("experience")}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
        >
          <span>Minimum Experience</span>
          {expandedSections.experience ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.experience && (
          <div className="space-y-2">
            {[
              { label: "Fresher (0 years)", value: 0 },
              { label: "1+ years", value: 1 },
              { label: "2+ years", value: 2 },
              { label: "3+ years", value: 3 },
              { label: "5+ years", value: 5 },
            ].map((exp) => (
              <label
                key={exp.value}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="experience"
                  checked={filters.experience === exp.value}
                  onChange={() => setFilters({ ...filters, experience: exp.value })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-primary-600">
                  {exp.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Job Type Filter */}
      <div>
        <button
          onClick={() => toggleSection("jobType")}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
        >
          <span>Job Type</span>
          {expandedSections.jobType ? (
            <FiChevronUp className="w-4 h-4" />
          ) : (
            <FiChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.jobType && (
          <div className="space-y-2">
            {[
              { label: "All Types", value: "all" },
              { label: "Full Time", value: "full-time" },
              { label: "Part Time", value: "part-time" },
              { label: "Contract", value: "contract" },
              { label: "Internship", value: "internship" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="jobType"
                  checked={filters.jobType === option.value}
                  onChange={() =>
                    setFilters({ ...filters, jobType: option.value })
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
            salaryRange: [0, 100000],
            experience: 0,
            jobType: "all",
            sortBy: "popularity",
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
        <FilterContent />
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
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

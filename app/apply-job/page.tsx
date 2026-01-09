"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JobGrid from "@/components/apply-job/JobGrid";
import FiltersSidebar from "@/components/apply-job/FiltersSidebar";
import JobDetailsModal from "@/components/apply-job/JobDetailsModal";
import ServiceConnectTeaser from "@/components/apply-job/ServiceConnectTeaser";
import { MapPin, Search, Navigation } from "lucide-react";

// Loading component for the Suspense boundary
function JobsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading jobs...</p>
      </div>
    </div>
  );
}

function ApplyJobContent() {
  const searchParams = useSearchParams();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [filters, setFilters] = useState({
    category: "all",
    salaryRange: [0, 100000],
    experience: 0,
    jobType: "all",
    sortBy: "popularity",
    location: "",
    query: "",
  });

  const [skillsQuery, setSkillsQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [location, setLocation] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ✨ Auto-populate location from URL parameter
  useEffect(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setLocation(locationParam);
      setFilters(prev => ({
        ...prev,
        location: locationParam
      }));
    }
  }, [searchParams]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocation("Detecting location...");
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

            setLocation(locationText);
            setFilters({ ...filters, location: locationText });
          } catch (error) {
            console.error("Error fetching address:", error);
            const locationText = `Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`;
            setLocation(locationText);
            setFilters({ ...filters, location: locationText });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to access location. Please enable GPS or enter manually.");
          setLocation("");
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
      location: location,
      query: skillsQuery,
      experience: selectedExperience ? parseInt(selectedExperience) : 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔍 Compact Sticky Search Section */}
      <section className="bg-white sticky top-20 z-40 border-b border-gray-100 pt-6 pb-6">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-md px-3 py-2 gap-2 focus-within:ring-1 focus-within:ring-primary-300 transition-all">

              {/* 🔍 Skills/Designations/Companies input */}
              <div className="flex items-center flex-1 border-r border-gray-200 pr-3">
                <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter skills / designations / companies"
                  value={skillsQuery}
                  onChange={(e) => setSkillsQuery(e.target.value)}
                  className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
                />
              </div>

              {/* 👔 Experience dropdown */}
              <div className="flex items-center flex-1 border-r border-gray-200 pr-3">
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full outline-none text-sm text-gray-700 bg-transparent cursor-pointer appearance-none pr-6"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.25rem',
                  }}
                >
                  <option value="">Select experience</option>
                  <option value="0">Fresher</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="4">4 years</option>
                  <option value="5">5 years</option>
                  <option value="6">6+ years</option>
                </select>
              </div>

              {/* 📍 Location input */}
              <div className="relative flex items-center flex-1 pr-3">
                <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                          <Navigation className="w-3.5 h-3.5 text-primary-600" />
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

              {/* Search Button */}
              <button
                type="submit"
                className="border-2 border-primary-500 text-primary-600 bg-white hover:bg-gradient-to-r hover:from-primary-300 hover:to-primary-500 hover:text-white hover:border-transparent rounded-full px-5 py-1.5 flex items-center gap-2 text-sm font-semibold transition-all duration-300 flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Location Badge - Shows when location is set */}
          {filters.location && (
            <div className="mt-3 flex items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                <MapPin className="w-4 h-4" />
                <span>Showing jobs for: {filters.location}</span>
                <button
                  onClick={() => {
                    setLocation("");
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
              <FiltersSidebar filters={filters} setFilters={setFilters} />
            </div>

            <div className="flex-1">
              <JobGrid
                filters={filters}
                onJobClick={setSelectedJob}
              />
            </div>
          </div>
        </div>
      </section>

      <ServiceConnectTeaser />

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function ApplyJobPage() {
  return (
    <Suspense fallback={<JobsLoading />}>
      <ApplyJobContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import JobGrid from "@/components/apply-job/JobGrid";
import FiltersSidebar from "@/components/apply-job/FiltersSidebar";
import JobDetailsModal from "@/components/apply-job/JobDetailsModal";
import ServiceConnectTeaser from "@/components/apply-job/ServiceConnectTeaser";
import { MapPin, Search } from "lucide-react";

export default function ApplyJobPage() {
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
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-md px-4 py-3 gap-3">

              {/* 🔍 Skills/Designations/Companies input */}
              <div className="flex items-center flex-1 border-r border-gray-200 pr-4">
                <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter skills / designations / companies"
                  value={skillsQuery}
                  onChange={(e) => setSkillsQuery(e.target.value)}
                  className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
                />
              </div>

              {/* 👔 Experience dropdown */}
              <div className="flex items-center flex-1 border-r border-gray-200 pr-4">
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
              <div className="flex items-center flex-1 pr-3">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-8 py-2.5 flex items-center gap-2 text-sm transition-colors flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>
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

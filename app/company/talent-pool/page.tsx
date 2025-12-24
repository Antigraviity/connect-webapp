"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiStar,
  FiPlus,
  FiDownload,
  FiMessageSquare,
  FiCalendar,
  FiTag,
  FiMoreVertical,
  FiExternalLink,
  FiLinkedin,
  FiGlobe,
  FiBookmark,
  FiUsers,
  FiAward,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiGithub,
  FiFileText,
} from "react-icons/fi";

interface JobSeekerProfile {
  id: string;
  userId: string;
  headline?: string;
  summary?: string;
  currentRole?: string;
  currentCompany?: string;
  totalExperience?: number;
  skills?: string;
  primarySkills?: string;
  education?: string;
  preferredJobTypes?: string;
  preferredLocations?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  salaryPeriod?: string;
  willingToRelocate: boolean;
  remotePreference?: string;
  status: string;
  noticePeriod?: string;
  resume?: string;
  portfolio?: string;
  linkedIn?: string;
  github?: string;
  tags?: string;
  isPublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showSalary: boolean;
  source?: string;
  profileViews: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return { bg: "bg-green-100", text: "text-green-800", label: "Available" };
    case "OPEN_TO_OFFERS":
      return { bg: "bg-blue-100", text: "text-blue-800", label: "Open to Offers" };
    case "EMPLOYED":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Employed" };
    case "NOT_LOOKING":
      return { bg: "bg-gray-100", text: "text-gray-800", label: "Not Looking" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

const parseJSON = (str?: string): any[] => {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return null;
  
  const formatNum = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };
  
  if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
  if (min) return `${formatNum(min)}+`;
  if (max) return `Up to ${formatNum(max)}`;
  return null;
};

export default function TalentPoolPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<JobSeekerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [counts, setCounts] = useState({
    total: 0,
    AVAILABLE: 0,
    OPEN_TO_OFFERS: 0,
    EMPLOYED: 0,
    NOT_LOOKING: 0,
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/job-seeker');
      const data = await response.json();

      if (data.success) {
        setProfiles(data.profiles || []);
        setCounts(data.counts || {
          total: 0,
          AVAILABLE: 0,
          OPEN_TO_OFFERS: 0,
          EMPLOYED: 0,
          NOT_LOOKING: 0,
        });
      } else {
        setError(data.message || "Failed to fetch profiles");
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError("Failed to load talent pool");
    } finally {
      setLoading(false);
    }
  };

  // Filter profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      profile.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.currentRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.skills?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "ALL" || profile.status === selectedStatus;
    const matchesSource = selectedSource === "ALL" || profile.source === selectedSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Get unique sources
  const sources = [...new Set(profiles.map(p => p.source).filter(Boolean))];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading talent pool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1>
          <p className="text-gray-600 mt-1">
            Discover candidates who have registered their profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProfiles}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button onClick={fetchProfiles} className="ml-auto text-red-600 font-medium hover:text-red-700">
            Try Again
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
              <p className="text-sm text-gray-600">Total Candidates</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiStar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.AVAILABLE}</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiAward className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.OPEN_TO_OFFERS}</p>
              <p className="text-sm text-gray-600">Open to Offers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{counts.EMPLOYED}</p>
              <p className="text-sm text-gray-600">Employed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, skills, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer min-w-[150px]"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="OPEN_TO_OFFERS">Open to Offers</option>
              <option value="EMPLOYED">Employed</option>
              <option value="NOT_LOOKING">Not Looking</option>
            </select>

            {sources.length > 0 && (
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer min-w-[150px]"
              >
                <option value="ALL">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Candidates Grid */}
      {filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProfiles.map((profile) => {
            const statusInfo = getStatusColor(profile.status);
            const skills = parseJSON(profile.skills);
            const tags = parseJSON(profile.tags);
            const initials = getInitials(profile.user?.name || 'U');
            const salary = profile.showSalary 
              ? formatSalary(profile.expectedSalaryMin, profile.expectedSalaryMax)
              : null;

            return (
              <div
                key={profile.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {profile.user?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {profile.headline || profile.currentRole}
                          {profile.currentCompany && ` at ${profile.currentCompany}`}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                    <span>{profile.user?.city || 'Location not specified'}</span>
                  </div>
                  {profile.totalExperience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiBriefcase className="w-4 h-4 text-gray-400" />
                      <span>{profile.totalExperience} years</span>
                    </div>
                  )}
                  {profile.noticePeriod && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span>{profile.noticePeriod}</span>
                    </div>
                  )}
                  {salary && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiTag className="w-4 h-4 text-gray-400" />
                      <span>{salary}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.slice(0, 4).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        +{skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.slice(0, 3).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Source Badge */}
                {profile.source && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-500">
                      Source: <span className="font-medium text-gray-700">{profile.source}</span>
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  {profile.showEmail && profile.user?.email && (
                    <a
                      href={`mailto:${profile.user.email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      <FiMail className="w-4 h-4" />
                      Contact
                    </a>
                  )}
                  {!profile.showEmail && (
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
                      onClick={() => alert("Contact info is private. The candidate will be notified of your interest.")}
                    >
                      <FiMail className="w-4 h-4" />
                      Contact
                    </button>
                  )}
                  <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <FiCalendar className="w-4 h-4" />
                    Schedule
                  </button>
                  {profile.linkedIn && (
                    <a
                      href={profile.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="LinkedIn"
                    >
                      <FiLinkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile.portfolio && (
                    <a
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Portfolio"
                    >
                      <FiGlobe className="w-5 h-5" />
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="GitHub"
                    >
                      <FiGithub className="w-5 h-5" />
                    </a>
                  )}
                  {profile.resume && (
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Resume"
                    >
                      <FiFileText className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No candidates found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {profiles.length === 0
              ? "No job seekers have registered their profiles yet. As candidates create their profiles, they'll appear here."
              : "No candidates match your search criteria. Try adjusting your filters."
            }
          </p>
          {(searchQuery || selectedStatus !== "ALL" || selectedSource !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
                setSelectedSource("ALL");
              }}
              className="mt-4 text-blue-600 font-medium hover:text-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

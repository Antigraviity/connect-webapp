"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiVideo,
  FiPhone,
  FiUser,
  FiBriefcase,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiMessageSquare,
  FiExternalLink,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Application {
  id: string;
  jobId: string;
  applicantId?: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  interviewDate?: string;
  interviewType?: string;
  interviewNotes?: string; // or just notes if that's where it's stored? checking applications page, it used `interviewNotes` in interface but `notes` in mock.
  // The applications page had: 
  // interviewDate?: string;
  // interviewType?: string;
  // interviewNotes?: string;
  // notes?: string;
  // Let's assume the API returns these.
  job?: {
    id: string;
    title: string;
  };
  applicant?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "SCHEDULED": // The status in DB is "INTERVIEW", but we might want to show "SCHEDULED" if date is future? 
      // Actually the DB status is "INTERVIEW". 
      return {
        bg: "bg-amber-100",
        text: "text-amber-800",
        dot: "bg-amber-500",
        label: "Scheduled"
      };
    case "COMPLETED": // We might not have this status in the main enum if it's just "INTERVIEW" or "HIRED"/"REJECTED". 
      // If the application status is "INTERVIEW", it is considered scheduled.
      // If "HIRED" or "REJECTED", it's done.
      // For this page, we probably only want to see active interviews? Or maybe past ones too?
      // Let's rely on the Application status "INTERVIEW" for now.
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        dot: "bg-green-500",
        label: "Completed"
      };
    default:
      return {
        bg: "bg-company-100",
        text: "text-company-800",
        dot: "bg-company-500",
        label: "Scheduled"
      };
  }
};

const getTypeIcon = (type?: string) => {
  switch (type) {
    case "Video Call":
      return FiVideo;
    case "Phone Call":
      return FiPhone;
    case "In-Person":
      return FiMapPin;
    default:
      return FiVideo;
  }
};

export default function InterviewsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all"); // 'upcoming', 'past'
  const [searchQuery, setSearchQuery] = useState("");

  const [updating, setUpdating] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchInterviews();
    }
  }, [user?.id]);

  const fetchInterviews = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/applications?employerId=${user.id}&status=INTERVIEW`);
      const data = await response.json();

      if (data.success) {
        // Filter mainly for INTERVIEW status
        // The API might return all applications if we don't handle filtering on backend, 
        // but let's assume valid data or filter client side.
        // Also include previous interviews that led to HIRE? maybe not.
        const interviewApps = data.applications.filter((app: Application) =>
          app.status === 'INTERVIEW' && app.interviewDate
        );
        setInterviews(interviewApps);
      } else {
        setError(data.message || "Failed to fetch interviews");
      }
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError("Failed to load interview schedule");
    } finally {
      setLoading(false);
    }
  };

  const initiateCancel = (interview: Application) => {
    setCancelModal({ id: interview.id, name: interview.applicantName });
  };

  const performCancel = async () => {
    if (!cancelModal) return;

    setUpdating(cancelModal.id);
    try {
      const response = await fetch("/api/jobs/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: cancelModal.id,
          status: "SHORTLISTED",
          interviewDate: null,
          interviewType: null,
          interviewNotes: null
        }),
      });

      const data = await response.json();
      if (data.success) {
        setInterviews(prev => prev.filter(i => i.id !== cancelModal.id));
        setCancelModal(null);
      } else {
        setError(data.message || "Failed to cancel interview");
      }
    } catch (err) {
      setError("Failed to cancel interview");
    } finally {
      setUpdating(null);
    }
  };

  // Filter logic
  const filteredInterviews = interviews.filter((interview) => {
    if (!interview.interviewDate) return false;

    const interviewTime = new Date(interview.interviewDate).getTime();
    const now = new Date().getTime();

    // Status filter (simulated based on time)
    if (filterStatus === "upcoming" && interviewTime < now) return false;
    if (filterStatus === "past" && interviewTime >= now) return false;

    // Date filter
    if (selectedDate) {
      const iDate = new Date(interview.interviewDate).toISOString().split('T')[0];
      if (iDate !== selectedDate) return false;
    }

    // Search
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      interview.applicantName.toLowerCase().includes(searchLower) ||
      interview.job?.title.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  // Group by date
  const interviewsByDate = filteredInterviews.reduce((acc, interview) => {
    if (!interview.interviewDate) return acc;
    const date = new Date(interview.interviewDate).toISOString().split('T')[0]; // YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(interview);
    return acc;
  }, {} as Record<string, Application[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Stats
  const todayDate = new Date().toISOString().split('T')[0];
  const stats = {
    total: interviews.length,
    upcoming: interviews.filter(i => i.interviewDate && new Date(i.interviewDate) > new Date()).length,
    today: interviews.filter(i => {
      if (!i.interviewDate) return false;
      return i.interviewDate.startsWith(todayDate);
    }).length,
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading schedule..." className="min-h-[400px]" />;
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Schedule</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all scheduled interviews
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/company/applications"
            className="flex items-center gap-2 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white px-5 py-2.5 rounded-lg transition-all text-sm font-bold shadow-md active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            Schedule New
          </Link>
          <button
            onClick={fetchInterviews}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium shadow-sm"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-company-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-company-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Total Interviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FiVideo className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              <p className="text-xs text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by candidate name or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-company-500 outline-none transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:border-company-500 outline-none cursor-pointer transition-all min-w-[140px]"
            >
              <option value="all">All Interviews</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>

            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:border-company-500 outline-none cursor-pointer transition-all"
            />

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interviews List */}
      <div className="space-y-6">
        {Object.entries(interviewsByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, interviews]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${isToday(date)
                  ? "bg-gradient-to-r from-company-400 to-company-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700"
                  }`}>
                  {isToday(date) ? "Today" : formatDate(date)}
                </div>
                <span className="text-sm text-gray-500">
                  {interviews.length} interview{interviews.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Interview Cards */}
              <div className="space-y-4">
                {interviews.map((interview) => {
                  const statusInfo = getStatusColor(interview.status); // Will mostly be "Scheduled"
                  const TypeIcon = getTypeIcon(interview.interviewType);
                  const itemsInitials = interview.applicantName
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={interview.id}
                      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Time Block */}
                        <div className="lg:w-32 flex-shrink-0">
                          <div className="text-center lg:text-left">
                            <p className="text-2xl font-bold text-gray-900">
                              {interview.interviewDate ? formatTime(interview.interviewDate) : '--:--'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {interview.interviewDate ? new Date(interview.interviewDate).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-company-400 to-company-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                {itemsInitials}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {interview.applicantName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {interview.job?.title || 'Unknown Job'}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          {/* Interview Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <TypeIcon className="w-4 h-4 text-gray-400" />
                              <span>{interview.interviewType || 'Video Call'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiMail className="w-4 h-4 text-gray-400" />
                              <span className="truncate max-w-[150px]" title={interview.applicantEmail}>{interview.applicantEmail}</span>
                            </div>
                          </div>

                          {/* Notes */}
                          {interview.interviewNotes && (
                            <div className="p-3 bg-gray-50 rounded-lg mb-4">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Notes:</span> {interview.interviewNotes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex lg:flex-col gap-2 lg:w-32">
                          <a
                            href={`mailto:${interview.applicantEmail}`}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            <FiMail className="w-4 h-4" />
                            Email
                          </a>
                          <Link
                            href="/company/applications"
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            Manage
                          </Link>
                          <button
                            onClick={() => initiateCancel(interview)}
                            disabled={!!updating}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            <FiX className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Empty State */}
      {!loading && filteredInterviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No interviews found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== "all" || selectedDate
              ? "Try adjusting your filters"
              : "No interviews scheduled yet. Shortlist candidates to schedule interviews."}
          </p>
          <Link
            href="/company/applications"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-company-400 to-company-600 hover:from-company-500 hover:to-company-700 text-white px-6 py-3 rounded-lg transition-all shadow-md font-semibold"
          >
            <FiPlus className="w-5 h-5" />
            Go to Applications
          </Link>
        </div>
      )}
      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !updating && setCancelModal(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cancel Interview
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel the interview with <strong>{cancelModal.name}</strong>?
              The application status will be reverted to <strong>Shortlisted</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModal(null)}
                disabled={!!updating}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Keep Interview
              </button>
              <button
                onClick={performCancel}
                disabled={!!updating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {updating && <LoadingSpinner size="sm" color="current" />}
                Cancel Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

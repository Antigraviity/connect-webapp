"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "react-icons/fi";

// Mock interview data
const mockInterviews = [
  {
    id: "INT-001",
    candidateName: "Amit Kumar",
    candidateEmail: "amit.kumar@email.com",
    candidateAvatar: "AK",
    jobTitle: "Product Manager",
    jobId: "JOB-003",
    date: "2025-11-28",
    time: "10:00 AM",
    duration: "60 min",
    type: "Video Call",
    round: "Technical Round",
    interviewers: ["John Doe", "Jane Smith"],
    meetingLink: "https://meet.google.com/abc-def-ghi",
    status: "SCHEDULED",
    notes: "Focus on product strategy and case study",
  },
  {
    id: "INT-002",
    candidateName: "Priya Patel",
    candidateEmail: "priya.patel@email.com",
    candidateAvatar: "PP",
    jobTitle: "UI/UX Designer",
    jobId: "JOB-002",
    date: "2025-11-28",
    time: "2:00 PM",
    duration: "45 min",
    type: "In-Person",
    round: "Portfolio Review",
    interviewers: ["Sarah Johnson"],
    location: "Office - Conference Room A",
    status: "SCHEDULED",
    notes: "Review portfolio and design challenge",
  },
  {
    id: "INT-003",
    candidateName: "Rahul Sharma",
    candidateEmail: "rahul.sharma@email.com",
    candidateAvatar: "RS",
    jobTitle: "Senior React Developer",
    jobId: "JOB-001",
    date: "2025-11-29",
    time: "11:00 AM",
    duration: "30 min",
    type: "Video Call",
    round: "HR Round",
    interviewers: ["Mike Wilson"],
    meetingLink: "https://meet.google.com/xyz-abc-def",
    status: "SCHEDULED",
    notes: "Final HR discussion and offer negotiation",
  },
  {
    id: "INT-004",
    candidateName: "Neha Gupta",
    candidateEmail: "neha.gupta@email.com",
    candidateAvatar: "NG",
    jobTitle: "Senior React Developer",
    jobId: "JOB-001",
    date: "2025-11-29",
    time: "3:00 PM",
    duration: "60 min",
    type: "Video Call",
    round: "Technical Round",
    interviewers: ["John Doe", "Alex Chen"],
    meetingLink: "https://meet.google.com/lmn-opq-rst",
    status: "SCHEDULED",
    notes: "Coding challenge and system design discussion",
  },
  {
    id: "INT-005",
    candidateName: "Vikram Singh",
    candidateEmail: "vikram.singh@email.com",
    candidateAvatar: "VS",
    jobTitle: "Backend Developer",
    jobId: "JOB-006",
    date: "2025-11-27",
    time: "10:00 AM",
    duration: "60 min",
    type: "Video Call",
    round: "Technical Round",
    interviewers: ["Alex Chen"],
    meetingLink: "https://meet.google.com/uvw-xyz-abc",
    status: "COMPLETED",
    notes: "Candidate showed strong technical skills",
    feedback: "Recommended for next round",
  },
  {
    id: "INT-006",
    candidateName: "Sneha Reddy",
    candidateEmail: "sneha.reddy@email.com",
    candidateAvatar: "SR",
    jobTitle: "Data Analyst",
    jobId: "JOB-004",
    date: "2025-11-26",
    time: "2:00 PM",
    duration: "45 min",
    type: "Video Call",
    round: "Final Round",
    interviewers: ["John Doe"],
    meetingLink: "https://meet.google.com/def-ghi-jkl",
    status: "COMPLETED",
    notes: "Final interview completed",
    feedback: "Offer extended and accepted",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        dot: "bg-blue-500",
      };
    case "COMPLETED":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        dot: "bg-green-500",
      };
    case "CANCELLED":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
      };
    case "RESCHEDULED":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        dot: "bg-yellow-500",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        dot: "bg-gray-500",
      };
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Video Call":
      return FiVideo;
    case "Phone Call":
      return FiPhone;
    case "In-Person":
      return FiMapPin;
    default:
      return FiCalendar;
  }
};

export default function InterviewsPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Get unique dates for calendar view
  const interviewDates = [...new Set(mockInterviews.map((i) => i.date))];

  // Filter interviews
  const filteredInterviews = mockInterviews.filter((interview) => {
    const matchesStatus = filterStatus === "all" || interview.status === filterStatus;
    const matchesDate = !selectedDate || interview.date === selectedDate;
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesDate && matchesSearch;
  });

  // Group interviews by date
  const interviewsByDate = filteredInterviews.reduce((acc, interview) => {
    if (!acc[interview.date]) {
      acc[interview.date] = [];
    }
    acc[interview.date].push(interview);
    return acc;
  }, {} as Record<string, typeof mockInterviews>);

  // Stats
  const stats = {
    total: mockInterviews.length,
    scheduled: mockInterviews.filter((i) => i.status === "SCHEDULED").length,
    completed: mockInterviews.filter((i) => i.status === "COMPLETED").length,
    today: mockInterviews.filter((i) => i.date === "2025-11-28" && i.status === "SCHEDULED").length,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (dateStr: string) => {
    return dateStr === "2025-11-28"; // Mock today's date
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Schedule</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all scheduled interviews
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
        >
          <FiPlus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Interviews</p>
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
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiVideo className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-xs text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
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
                <div className={`px-3 py-1.5 rounded-lg font-semibold text-sm ${
                  isToday(date)
                    ? "bg-blue-600 text-white"
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
                  const statusColor = getStatusColor(interview.status);
                  const TypeIcon = getTypeIcon(interview.type);

                  return (
                    <div
                      key={interview.id}
                      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Time Block */}
                        <div className="lg:w-32 flex-shrink-0">
                          <div className="text-center lg:text-left">
                            <p className="text-2xl font-bold text-gray-900">{interview.time}</p>
                            <p className="text-sm text-gray-500">{interview.duration}</p>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {interview.candidateAvatar}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {interview.candidateName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {interview.jobTitle}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                              {interview.status}
                            </span>
                          </div>

                          {/* Interview Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <TypeIcon className="w-4 h-4 text-gray-400" />
                              <span>{interview.type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiBriefcase className="w-4 h-4 text-gray-400" />
                              <span>{interview.round}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiUser className="w-4 h-4 text-gray-400" />
                              <span>{interview.interviewers.join(", ")}</span>
                            </div>
                            {interview.meetingLink && (
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                              >
                                <FiExternalLink className="w-4 h-4" />
                                <span>Join Meeting</span>
                              </a>
                            )}
                            {interview.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiMapPin className="w-4 h-4 text-gray-400" />
                                <span>{interview.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Notes */}
                          {interview.notes && (
                            <div className="p-3 bg-gray-50 rounded-lg mb-4">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Notes:</span> {interview.notes}
                              </p>
                            </div>
                          )}

                          {/* Feedback (for completed) */}
                          {interview.status === "COMPLETED" && interview.feedback && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100 mb-4">
                              <p className="text-sm text-green-700">
                                <span className="font-medium">Feedback:</span> {interview.feedback}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex lg:flex-col gap-2 lg:w-32">
                          {interview.status === "SCHEDULED" && (
                            <>
                              {interview.meetingLink && (
                                <a
                                  href={interview.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm"
                                >
                                  <FiVideo className="w-4 h-4" />
                                  Join
                                </a>
                              )}
                              <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm">
                                <FiEdit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-2 rounded-lg transition-colors text-sm">
                                <FiX className="w-4 h-4" />
                                Cancel
                              </button>
                            </>
                          )}
                          {interview.status === "COMPLETED" && (
                            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm">
                              <FiMessageSquare className="w-4 h-4" />
                              Add Feedback
                            </button>
                          )}
                          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 rounded-lg transition-colors text-sm">
                            <FiMail className="w-4 h-4" />
                            Email
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
      {filteredInterviews.length === 0 && (
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
              : "No interviews scheduled yet"}
          </p>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <FiPlus className="w-5 h-5" />
            Schedule an Interview
          </button>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowScheduleModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Schedule Interview</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Candidate
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>Select candidate...</option>
                  <option>Rahul Sharma - Senior React Developer</option>
                  <option>Priya Patel - UI/UX Designer</option>
                  <option>Neha Gupta - Senior React Developer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview Type
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option>Video Call</option>
                    <option>Phone Call</option>
                    <option>In-Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                    <option>90 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Round
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>Screening Round</option>
                  <option>Technical Round</option>
                  <option>HR Round</option>
                  <option>Final Round</option>
                  <option>Portfolio Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interviewers
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>Select interviewers...</option>
                  <option>John Doe</option>
                  <option>Jane Smith</option>
                  <option>Alex Chen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add any notes for the interview..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="sendInvite" defaultChecked className="rounded" />
                <label htmlFor="sendInvite" className="text-sm text-gray-700">
                  Send calendar invite to candidate
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

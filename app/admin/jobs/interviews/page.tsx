"use client";

import { useState } from "react";
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiVideo,
  FiPhone,
  FiMapPin,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiXCircle,
  FiEye,
} from "react-icons/fi";

const interviewsData = [
  {
    id: "INT-001",
    candidate: "Rahul Sharma",
    job: "Senior React Developer",
    company: "TechCorp Solutions",
    type: "Technical",
    mode: "Video Call",
    date: "Nov 28, 2025",
    time: "10:00 AM",
    status: "SCHEDULED",
    interviewer: "John Smith",
  },
  {
    id: "INT-002",
    candidate: "Priya Patel",
    job: "UI/UX Designer",
    company: "DesignHub Inc",
    type: "Portfolio Review",
    mode: "Video Call",
    date: "Nov 28, 2025",
    time: "2:00 PM",
    status: "SCHEDULED",
    interviewer: "Sarah Johnson",
  },
  {
    id: "INT-003",
    candidate: "Amit Kumar",
    job: "Product Manager",
    company: "InnovateLabs",
    type: "HR Round",
    mode: "Phone",
    date: "Nov 27, 2025",
    time: "11:00 AM",
    status: "COMPLETED",
    interviewer: "Mike Brown",
  },
  {
    id: "INT-004",
    candidate: "Sneha Reddy",
    job: "Data Analyst",
    company: "DataDriven Co",
    type: "Technical",
    mode: "In-Person",
    date: "Nov 29, 2025",
    time: "3:00 PM",
    status: "SCHEDULED",
    interviewer: "Emily Davis",
  },
  {
    id: "INT-005",
    candidate: "Vikram Singh",
    job: "Marketing Lead",
    company: "GrowthMax Agency",
    type: "Final Round",
    mode: "Video Call",
    date: "Nov 26, 2025",
    time: "4:00 PM",
    status: "CANCELLED",
    interviewer: "David Wilson",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return { bg: "bg-blue-100", text: "text-blue-800", label: "Scheduled" };
    case "COMPLETED":
      return { bg: "bg-green-100", text: "text-green-800", label: "Completed" };
    case "CANCELLED":
      return { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" };
    case "RESCHEDULED":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "Rescheduled" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: status };
  }
};

const getModeIcon = (mode: string) => {
  switch (mode) {
    case "Video Call":
      return FiVideo;
    case "Phone":
      return FiPhone;
    case "In-Person":
      return FiMapPin;
    default:
      return FiVideo;
  }
};

export default function InterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredInterviews = interviewsData.filter((interview) => {
    const matchesSearch =
      interview.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || interview.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: interviewsData.length,
    scheduled: interviewsData.filter((i) => i.status === "SCHEDULED").length,
    completed: interviewsData.filter((i) => i.status === "COMPLETED").length,
    today: interviewsData.filter((i) => i.date === "Nov 27, 2025").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600 mt-1">Manage and track all scheduled interviews.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-xs text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job / Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInterviews.map((interview) => {
                const statusBadge = getStatusBadge(interview.status);
                const ModeIcon = getModeIcon(interview.mode);
                return (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                          {interview.candidate.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{interview.candidate}</p>
                          <p className="text-xs text-gray-500">Interviewer: {interview.interviewer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{interview.job}</p>
                      <p className="text-xs text-gray-500">{interview.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                        {interview.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4" />
                        {interview.date}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <FiClock className="w-3 h-3" />
                        {interview.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <ModeIcon className="w-4 h-4" />
                        {interview.mode}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

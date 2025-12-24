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
  FiBuilding,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiExternalLink,
  FiFilter,
  FiPlus,
} from "react-icons/fi";

// Mock data - replace with actual API call
const interviewsData = [
  {
    id: 1,
    jobTitle: "Senior Full Stack Developer",
    company: "Tech Innovations Ltd",
    companyLogo: "",
    date: "2024-11-28",
    time: "10:00 AM",
    duration: "60 mins",
    type: "video", // video, phone, in-person
    location: "Google Meet",
    interviewer: "Sarah Johnson",
    interviewerRole: "Engineering Manager",
    round: "Technical Round 2",
    status: "upcoming", // upcoming, completed, cancelled
    notes: "Prepare coding challenges and discuss previous projects",
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: 2,
    jobTitle: "Product Manager",
    company: "StartUp Hub",
    companyLogo: "",
    date: "2024-11-29",
    time: "2:00 PM",
    duration: "45 mins",
    type: "phone",
    location: "Phone Call",
    interviewer: "Mike Chen",
    interviewerRole: "Head of Product",
    round: "Initial Screening",
    status: "upcoming",
    notes: "Discuss product experience and case studies",
    phoneNumber: "+91 98765 43210",
  },
  {
    id: 3,
    jobTitle: "UI/UX Designer",
    company: "Design Studio Pro",
    companyLogo: "",
    date: "2024-11-26",
    time: "11:00 AM",
    duration: "90 mins",
    type: "in-person",
    location: "Office - Pune, MG Road",
    interviewer: "Emma Wilson",
    interviewerRole: "Design Director",
    round: "Portfolio Review",
    status: "completed",
    notes: "Showcased design portfolio and discussed design process",
  },
  {
    id: 4,
    jobTitle: "Data Scientist",
    company: "Analytics Corp",
    companyLogo: "",
    date: "2024-12-02",
    time: "3:30 PM",
    duration: "120 mins",
    type: "video",
    location: "Zoom",
    interviewer: "Dr. Raj Patel",
    interviewerRole: "Lead Data Scientist",
    round: "Technical Assessment",
    status: "upcoming",
    notes: "Live coding session - ML algorithms and data analysis",
    meetingLink: "https://zoom.us/j/123456789",
  },
  {
    id: 5,
    jobTitle: "Marketing Manager",
    company: "Growth Marketing Inc",
    companyLogo: "",
    date: "2024-11-25",
    time: "4:00 PM",
    duration: "30 mins",
    type: "phone",
    location: "Phone Call",
    interviewer: "Lisa Brown",
    interviewerRole: "HR Manager",
    round: "HR Round",
    status: "completed",
    notes: "Discussed compensation and team structure",
    phoneNumber: "+91 99887 76655",
  },
];

export default function InterviewSchedulePage() {
  const [interviews, setInterviews] = useState(interviewsData);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filteredInterviews = interviews.filter(interview => {
    const matchesStatus = filterStatus === "all" || interview.status === filterStatus;
    const matchesType = filterType === "all" || interview.type === filterType;
    return matchesStatus && matchesType;
  });

  const upcomingInterviews = filteredInterviews.filter(i => i.status === "upcoming");
  const completedInterviews = filteredInterviews.filter(i => i.status === "completed");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <FiVideo className="w-4 h-4" />;
      case "phone": return <FiPhone className="w-4 h-4" />;
      case "in-person": return <FiMapPin className="w-4 h-4" />;
      default: return <FiCalendar className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video": return "Video Call";
      case "phone": return "Phone Call";
      case "in-person": return "In-Person";
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Schedule</h1>
          <p className="text-gray-600 mt-1">
            {upcomingInterviews.length} upcoming interview{upcomingInterviews.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FiPlus className="w-4 h-4" />
          Add Interview
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingInterviews.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completedInterviews.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {interviews.filter(i => {
                  const date = new Date(i.date);
                  const today = new Date();
                  const weekFromNow = new Date(today);
                  weekFromNow.setDate(today.getDate() + 7);
                  return date >= today && date <= weekFromNow;
                }).length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FiClock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interviews List */}
      {filteredInterviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interviews Scheduled</h3>
          <p className="text-gray-600 mb-4">
            You don't have any interviews scheduled at the moment
          </p>
          <Link
            href="/buyer/applications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiBriefcase className="w-4 h-4" />
            View Applications
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Date Badge */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-bold">
                      {new Date(interview.date).getDate()}
                    </span>
                    <span className="text-xs uppercase">
                      {new Date(interview.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Interview Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.jobTitle}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(interview.status)}`}>
                          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{interview.company} • {interview.round}</p>
                    </div>
                  </div>

                  {/* Interview Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{formatDate(interview.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-blue-600" />
                      <span>{interview.time} ({interview.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(interview.type)}
                      <span>{getTypeLabel(interview.type)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-blue-600" />
                      <span className="truncate">{interview.location}</span>
                    </div>
                  </div>

                  {/* Interviewer */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{interview.interviewer}</p>
                        <p className="text-xs text-gray-600">{interview.interviewerRole}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {interview.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Notes:</span> {interview.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  {interview.status === "upcoming" && (
                    <>
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          Join Meeting
                        </a>
                      )}
                      <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                        <FiCalendar className="w-4 h-4" />
                        Reschedule
                      </button>
                    </>
                  )}
                  {interview.status === "completed" && (
                    <Link
                      href={`/buyer/applications/${interview.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0053B0] text-white rounded-lg hover:bg-[#003d85] transition-colors text-sm font-semibold"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="flex gap-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Interview Tips</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Test your audio and video setup 15 minutes before the call</li>
                <li>• Have your resume and portfolio ready to reference</li>
                <li>• Prepare questions to ask the interviewer</li>
                <li>• Join the meeting 2-3 minutes early</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { FiClock, FiCalendar, FiCheck, FiX } from "react-icons/fi";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([
    { day: "Monday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Thursday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Friday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Saturday", enabled: true, startTime: "10:00", endTime: "16:00" },
    { day: "Sunday", enabled: false, startTime: "10:00", endTime: "16:00" },
  ]);

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      customer: "Rahul Sharma",
      service: "AC Repair",
      date: "Nov 5, 2025",
      time: "10:00 AM",
      duration: "2 hours",
      status: "confirmed",
    },
    {
      id: 2,
      customer: "Priya Patel",
      service: "Plumbing",
      date: "Nov 5, 2025",
      time: "2:00 PM",
      duration: "1.5 hours",
      status: "confirmed",
    },
    {
      id: 3,
      customer: "Amit Kumar",
      service: "Electrical Work",
      date: "Nov 6, 2025",
      time: "11:00 AM",
      duration: "3 hours",
      status: "pending",
    },
  ]);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].enabled = !newSchedule[index].enabled;
    setSchedule(newSchedule);
  };

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-gray-600 mt-1">
          Manage your availability and appointments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FiClock className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Weekly Availability
              </h2>
              <p className="text-sm text-gray-600">
                Set your working hours for each day
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {schedule.map((day, index) => (
              <div
                key={day.day}
                className={`p-4 rounded-lg border-2 transition-all ${
                  day.enabled
                    ? "border-primary-200 bg-primary-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.enabled}
                      onChange={() => toggleDay(index)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span
                      className={`font-semibold ${
                        day.enabled ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {day.day}
                    </span>
                  </label>
                  <span
                    className={`text-sm ${
                      day.enabled ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {day.enabled ? "Available" : "Closed"}
                  </span>
                </div>

                {day.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          updateTime(index, "startTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          updateTime(index, "endTime", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-6 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
            Save Schedule
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Upcoming Appointments
              </h2>
              <p className="text-sm text-gray-600">
                {appointments.length} scheduled appointments
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {appointment.customer}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.service}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    {appointment.time}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  Duration: {appointment.duration}
                </div>

                {appointment.status === "pending" && (
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
                      <FiCheck className="w-4 h-4" />
                      Accept
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                      <FiX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {appointment.status === "confirmed" && (
                  <button className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700">
                    View Details
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar View Placeholder */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Calendar View</h2>
        <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Calendar integration coming soon</p>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all your appointments in one place
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

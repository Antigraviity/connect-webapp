"use client";

import { FiCalendar, FiClock, FiMapPin, FiUser } from "react-icons/fi";

export default function Schedule() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
        <p className="text-gray-600 mt-1">Manage your appointments and availability</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCalendar className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Schedule Coming Soon</h3>
        <p className="text-gray-600">
          Calendar and scheduling features will be available here soon.
        </p>
      </div>
    </div>
  );
}

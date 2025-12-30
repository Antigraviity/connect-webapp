"use client";

import { useState, useEffect } from "react";
import { FiClock, FiCalendar, FiCheck, FiX, FiRefreshCw, FiPhone, FiSave } from "react-icons/fi";

interface Booking {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  totalAmount: number;
  specialRequests?: string;
  service: {
    id: string;
    title: string;
    duration: number;
    price: number;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
  };
}

interface ScheduleDay {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleDay[]>([
    { day: "Monday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Thursday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Friday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Saturday", enabled: true, startTime: "10:00", endTime: "16:00" },
    { day: "Sunday", enabled: false, startTime: "10:00", endTime: "16:00" },
  ]);

  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleChanged, setScheduleChanged] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Load user and data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
      fetchSchedule(user.id);
      fetchAppointments(user.id);
    }
  }, []);

  // Fetch schedule from API
  const fetchSchedule = async (uid: string) => {
    try {
      const response = await fetch(`/api/vendor/schedule?userId=${uid}`);
      const data = await response.json();

      if (data.success && data.schedule) {
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  // Save schedule to API
  const saveSchedule = async () => {
    if (!userId) {
      console.error('❌ No user ID found');
      return;
    }

    try {
      setSavingSchedule(true);
      console.log('💾 Saving schedule for user:', userId);
      console.log('💾 Schedule data:', JSON.stringify(schedule, null, 2));

      const response = await fetch('/api/vendor/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, schedule })
      });

      const data = await response.json();
      console.log('💾 API Response:', data);

      if (data.success) {
        setScheduleChanged(false);
        setNotification({ type: 'success', message: 'Schedule saved successfully!' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        console.error('❌ Save failed:', data.message);
        setNotification({ type: 'error', message: data.message || 'Failed to save schedule' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('❌ Failed to save schedule:', error);
      setNotification({ type: 'error', message: 'Failed to save schedule' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSavingSchedule(false);
    }
  };

  // Fetch appointments
  const fetchAppointments = async (uid?: string) => {
    try {
      setLoading(true);
      const id = uid || userId;
      if (!id) return;

      const response = await fetch(`/api/bookings?sellerId=${id}&type=SERVICE`);
      const data = await response.json();

      if (data.success) {
        // Filter upcoming appointments (not cancelled or completed)
        const upcoming = data.bookings.filter((b: Booking) =>
          ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)
        ).sort((a: Booking, b: Booking) => {
          // Sort by date and time
          const dateA = new Date(a.bookingDate);
          const dateB = new Date(b.bookingDate);
          return dateA.getTime() - dateB.getTime();
        });
        setAppointments(upcoming);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdating(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the list
        fetchAppointments();
        setNotification({ type: 'success', message: `Booking ${newStatus.toLowerCase().replace('_', ' ')}!` });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({ type: 'error', message: data.message || 'Failed to update booking' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
      setNotification({ type: 'error', message: 'Failed to update booking' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setUpdating(null);
    }
  };

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].enabled = !newSchedule[index].enabled;
    setSchedule(newSchedule);
    setScheduleChanged(true);
  };

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
    setScheduleChanged(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your availability and appointments
          </p>
        </div>
        <button
          onClick={() => fetchAppointments()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FiClock className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                Weekly Availability
              </h2>
              <p className="text-sm text-gray-600">
                Set your working hours for each day
              </p>
            </div>
            {scheduleChanged && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="space-y-4">
            {schedule.map((day, index) => (
              <div
                key={day.day}
                className={`p-4 rounded-lg border-2 transition-all ${day.enabled
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
                      className={`font-semibold ${day.enabled ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {day.day}
                    </span>
                  </label>
                  <span
                    className={`text-sm font-medium ${day.enabled ? "text-green-600" : "text-red-600"
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

          <button
            onClick={saveSchedule}
            disabled={savingSchedule}
            className="w-full mt-6 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingSchedule ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Save Schedule
              </>
            )}
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
                {loading ? 'Loading...' : `${appointments.length} scheduled appointment${appointments.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No upcoming appointments</p>
              <p className="text-sm text-gray-500 mt-1">
                Your scheduled bookings will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.customerName || appointment.buyer?.name || 'Customer'}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium">
                        {appointment.service?.title || 'Service'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      {formatDate(appointment.bookingDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      {appointment.bookingTime || 'Time TBD'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Duration: {formatDuration(appointment.service?.duration)}</span>
                    <span className="font-semibold text-gray-900">₹{appointment.totalAmount}</span>
                  </div>

                  {/* Contact Info */}
                  {appointment.customerPhone && (
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                      <a
                        href={`tel:${appointment.customerPhone}`}
                        className="flex items-center gap-1 text-primary-600 hover:underline"
                      >
                        <FiPhone className="w-3 h-3" />
                        {appointment.customerPhone}
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {appointment.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(appointment.id, 'CONFIRMED')}
                        disabled={updating === appointment.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                      >
                        {updating === appointment.id ? (
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiCheck className="w-4 h-4" />
                        )}
                        Confirm
                      </button>
                      <button
                        onClick={() => updateBookingStatus(appointment.id, 'CANCELLED')}
                        disabled={updating === appointment.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {appointment.status === "CONFIRMED" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(appointment.id, 'IN_PROGRESS')}
                        disabled={updating === appointment.id}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating === appointment.id ? 'Updating...' : 'Start Service'}
                      </button>
                      <button
                        onClick={() => updateBookingStatus(appointment.id, 'CANCELLED')}
                        disabled={updating === appointment.id}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {appointment.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => updateBookingStatus(appointment.id, 'COMPLETED')}
                      disabled={updating === appointment.id}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating === appointment.id ? 'Updating...' : 'Mark as Completed'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar View with Today's Appointments */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Schedule</h2>
        {(() => {
          const today = new Date().toISOString().split('T')[0];
          const todaysAppointments = appointments.filter(a => {
            const bookingDate = new Date(a.bookingDate).toISOString().split('T')[0];
            return bookingDate === today;
          });

          if (todaysAppointments.length === 0) {
            return (
              <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No appointments scheduled for today</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Enjoy your free day or check upcoming bookings above
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg border-2 ${appointment.status === 'IN_PROGRESS'
                      ? 'border-blue-400 bg-blue-50'
                      : appointment.status === 'CONFIRMED'
                        ? 'border-green-400 bg-green-50'
                        : 'border-yellow-400 bg-yellow-50'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      {appointment.bookingTime || 'Time TBD'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{appointment.service?.title}</h3>
                  <p className="text-sm text-gray-600">{appointment.customerName || appointment.buyer?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {formatDuration(appointment.service?.duration)}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

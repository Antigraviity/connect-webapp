"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiChevronRight,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  favorites: number;
}

export default function CustomerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    favorites: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/bookings?limit=5');
      const data = await response.json();

      if (data.success) {
        const bookings = data.bookings || [];
        setRecentBookings(bookings);
        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => b.status === 'PENDING').length,
          completedBookings: bookings.filter((b: any) => b.status === 'COMPLETED').length,
          favorites: 0,
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: FiCalendar,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Pending",
      value: stats.pendingBookings,
      icon: FiClock,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Completed",
      value: stats.completedBookings,
      icon: FiCheckCircle,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Favorites",
      value: stats.favorites,
      icon: FiHeart,
      color: "bg-pink-500",
      lightColor: "bg-pink-50",
      textColor: "text-pink-600",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your bookings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm"
            >
              <div className={`w-12 h-12 ${stat.lightColor} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {loading ? "-" : stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/book-services"
          className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white hover:from-primary-600 hover:to-primary-800 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Book a Service</h3>
              <p className="text-primary-100 text-sm">
                Find and book professional services near you
              </p>
            </div>
            <FiChevronRight className="w-6 h-6" />
          </div>
        </Link>

        <Link
          href="/customer/bookings"
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">View Bookings</h3>
              <p className="text-gray-500 text-sm">
                Check status of your service bookings
              </p>
            </div>
            <FiChevronRight className="w-6 h-6 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <Link
              href="/customer/bookings"
              className="text-primary-600 text-sm font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="p-8 text-center">
            <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bookings yet</p>
            <Link
              href="/book-services"
              className="text-primary-600 font-semibold hover:underline mt-2 inline-block"
            >
              Book your first service
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentBookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {booking.service?.title || 'Service'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.bookingDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })} at {booking.bookingTime}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                    booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {booking.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

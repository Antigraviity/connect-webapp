import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  MoreHorizontal,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Phone,
  Building2,
  BriefcaseIcon
} from 'lucide-react';

export default function SchedulesPage() {
  const schedules = [
    {
      id: 1,
      scheduleRef: 'SCH001247',
      title: 'Home Cleaning Service',
      type: 'Service',
      client: 'Rahul Sharma',
      provider: 'Sarah Johnson',
      date: '2024-11-25',
      time: '10:00 AM - 1:00 PM',
      duration: '3 hours',
      location: 'Andheri West, Mumbai',
      meetingType: 'In-person',
      status: 'Confirmed',
      priority: 'Normal',
      notes: 'Deep cleaning required for 3BHK apartment',
      reminder: 'Set for 1 hour before'
    },
    {
      id: 2,
      scheduleRef: 'SCH001248',
      title: 'React Developer Interview',
      type: 'Interview',
      client: 'Tech Solutions Inc.',
      provider: 'Amit Kumar',
      date: '2024-11-24',
      time: '2:00 PM - 3:00 PM',
      duration: '1 hour',
      location: 'Online - Google Meet',
      meetingType: 'Video Call',
      status: 'Confirmed',
      priority: 'High',
      notes: 'Technical interview for Senior React Developer position',
      reminder: 'Set for 30 minutes before'
    },
    {
      id: 3,
      scheduleRef: 'SCH001249',
      title: 'Plumbing Repair Service',
      type: 'Service',
      client: 'Priya Patel',
      provider: 'Mike Rodriguez',
      date: '2024-11-23',
      time: '11:00 AM - 1:00 PM',
      duration: '2 hours',
      location: 'Koramangala, Bangalore',
      meetingType: 'In-person',
      status: 'Completed',
      priority: 'Normal',
      notes: 'Kitchen sink and bathroom tap repair',
      reminder: 'Completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</span>;
      case 'Completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</span>;
      case 'Rescheduled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock className="w-3 h-3 mr-1" />Rescheduled</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white text-white">
          <h1 className="text-2xl font-bold">Schedules Management</h1>
          <p className="text-primary-100 mt-2">Manage all schedules, appointments, and meetings across the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Schedules</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">+18.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Schedules</p>
                <p className="text-2xl font-bold text-gray-900">67</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Service Appointments</p>
                <p className="text-2xl font-bold text-gray-900">892</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">+15.3%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Interviews Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">355</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <BriefcaseIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">+8.7%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Schedules ({schedules.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location/Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                        <div className="text-sm text-gray-500">{schedule.scheduleRef}</div>
                        <div className="text-xs text-gray-400 mt-1">{schedule.notes}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Client: {schedule.client}</div>
                        <div className="text-sm text-gray-500">Provider: {schedule.provider}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{schedule.date}</div>
                        <div className="text-sm text-gray-500">{schedule.time}</div>
                        <div className="text-xs text-gray-400">Duration: {schedule.duration}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{schedule.meetingType}</div>
                        <div className="text-sm text-gray-500">{schedule.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing 1 to {schedules.length} of 1,247 schedules
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
                {schedules.length > 10 && (
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">2</button>
                )}
                {schedules.length > 20 && (
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">3</button>
                )}
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled={schedules.length <= 10}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

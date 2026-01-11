import AdminLayout from '@/components/admin/AdminLayout';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Eye,
  Filter,
  Search,
  Download,
  MoreHorizontal,
  User,
  Calendar,
  ShoppingBag,
  BriefcaseIcon,
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  Camera
} from 'lucide-react';

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      reviewId: 'REV001247',
      type: 'Service Review',
      serviceName: 'Home Cleaning Service',
      serviceProvider: 'Sarah Johnson',
      customer: 'Rahul Sharma',
      rating: 5,
      comment: 'Excellent service! Very thorough cleaning and professional staff. Highly recommended for deep cleaning.',
      date: '2024-11-20',
      status: 'Published',
      helpful: 12,
      reported: false,
      verified: true,
      response: 'Thank you for the wonderful review! We appreciate your feedback.',
      photos: 3
    },
    {
      id: 2,
      reviewId: 'REV001248',
      type: 'Service Review',
      serviceName: 'Plumbing Repair',
      serviceProvider: 'Mike Rodriguez',
      customer: 'Priya Patel',
      rating: 4,
      comment: 'Good work, arrived on time and fixed the issue quickly. Professional service.',
      date: '2024-11-19',
      status: 'Published',
      helpful: 8,
      reported: false,
      verified: true,
      response: null,
      photos: 1
    },
    {
      id: 3,
      reviewId: 'REV001249',
      type: 'Employer Review',
      serviceName: 'Tech Solutions Inc.',
      serviceProvider: 'Company Profile',
      customer: 'Amit Kumar',
      rating: 4,
      comment: 'Great company to work with. Good work culture and supportive management.',
      date: '2024-11-18',
      status: 'Published',
      helpful: 15,
      reported: false,
      verified: true,
      response: 'Thank you for being part of our team!',
      photos: 0
    },
    {
      id: 4,
      reviewId: 'REV001250',
      type: 'Service Review',
      serviceName: 'AC Repair',
      serviceProvider: 'David Kumar',
      customer: 'Neha Singh',
      rating: 2,
      comment: 'Service was delayed and the problem was not fully resolved. Had to call another technician.',
      date: '2024-11-17',
      status: 'Flagged',
      helpful: 2,
      reported: true,
      verified: false,
      response: 'We apologize for the inconvenience and would like to make this right.',
      photos: 0
    }
  ];

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Published</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'Flagged':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><Flag className="w-3 h-3 mr-1" />Flagged</span>;
      case 'Hidden':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Hidden</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Service Review':
        return <ShoppingBag className="h-4 w-4 text-primary-600" />;
      case 'Employer Review':
        return <BriefcaseIcon className="h-4 w-4 text-primary-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 text-gray-900 border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold">Reviews & Ratings Management</h1>
          <p className="text-gray-500 mt-2">Monitor and manage all customer reviews and ratings across the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">9,234</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">+14.2%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.6</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <ThumbsUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">+0.3</span>
              <span className="text-gray-500 ml-1">improvement</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">5-Star Reviews</p>
                <p className="text-2xl font-bold text-gray-900">5,847</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full">
                <Heart className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600 font-medium">63.3%</span>
              <span className="text-gray-500 ml-1">of all reviews</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Flagged Reviews</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Flag className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600 font-medium">0.5%</span>
              <span className="text-gray-500 ml-1">of all reviews</span>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Reviews ({reviews.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service & Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating & Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {getTypeIcon(review.type)}
                          <span className="ml-2">{review.reviewId}</span>
                          {review.verified && <CheckCircle className="h-3 w-3 text-green-500 ml-1" />}
                        </div>
                        <div className="text-sm text-gray-500">By: {review.customer}</div>
                        <div className="text-xs text-gray-400">{review.date}</div>
                        <div className="text-xs text-primary-600">{review.helpful} found helpful</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{review.serviceName}</div>
                        <div className="text-sm text-gray-500">Provider: {review.serviceProvider}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center mb-2">
                          {getRatingStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                        </div>
                        <div className="text-sm text-gray-700 max-w-xs">
                          {review.comment}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(review.status)}
                        {review.reported && (
                          <div className="flex items-center text-xs text-red-600">
                            <Flag className="h-3 w-3 mr-1" />
                            Reported
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Flag className="h-4 w-4" />
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
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

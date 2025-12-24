import { 
  Settings,
  Globe,
  Shield,
  CreditCard,
  Mail,
  Bell,
  Users,
  Database,
  Code,
  Key,
  Lock,
  Server,
  AlertCircle,
  CheckCircle,
  Save,
  Upload,
  Download
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-gray-200 mt-2">Configure system settings, preferences, and platform-wide configurations</p>
        </div>

        {/* Settings Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Settings Categories</h3>
              </div>
              <nav className="p-2">
                <div className="space-y-1">
                  <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                    <Globe className="h-4 w-4 mr-3" />
                    General Settings
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <Shield className="h-4 w-4 mr-3" />
                    Security
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <CreditCard className="h-4 w-4 mr-3" />
                    Payment Settings
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <Mail className="h-4 w-4 mr-3" />
                    Email Configuration
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <Bell className="h-4 w-4 mr-3" />
                    Notifications
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <Users className="h-4 w-4 mr-3" />
                    User Management
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <Database className="h-4 w-4 mr-3" />
                    Database
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                    <Code className="h-4 w-4 mr-3" />
                    API Settings
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* General Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    General Settings
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                      <input
                        type="text"
                        defaultValue="Connect Platform"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform URL</label>
                      <input
                        type="url"
                        defaultValue="https://connect.example.com"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Asia/Kolkata (GMT+5:30)</option>
                        <option>America/New_York (GMT-5)</option>
                        <option>Europe/London (GMT+0)</option>
                        <option>Asia/Tokyo (GMT+9)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
                    <textarea
                      rows={3}
                      defaultValue="Connect Platform - Connecting service providers and job seekers with customers and employers"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Platform Features */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Platform Features</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Service Bookings</h4>
                        <p className="text-sm text-gray-500">Allow users to book services from providers</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-400 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Job Postings</h4>
                        <p className="text-sm text-gray-500">Enable employers to post jobs and hire candidates</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-400 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">User Registration</h4>
                        <p className="text-sm text-gray-500">Allow new users to register on the platform</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-400 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Email Verification</h4>
                        <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-green-400 cursor-pointer"></label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                        <p className="text-sm text-gray-500">Send push notifications to mobile app users</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    System Status
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Database</div>
                        <div className="text-sm text-green-600">Connected</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Email Service</div>
                        <div className="text-sm text-green-600">Active</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Payment Gateway</div>
                        <div className="text-sm text-yellow-600">Warning</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">File Storage</div>
                        <div className="text-sm text-green-600">Available</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">API Services</div>
                        <div className="text-sm text-green-600">Running</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">CDN</div>
                        <div className="text-sm text-green-600">Online</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup & Maintenance */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Backup & Maintenance</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Database Backup</h4>
                      <p className="text-sm text-gray-500 mb-4">Last backup: November 23, 2024 at 3:00 AM</p>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">
                          Create Backup
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">System Maintenance</h4>
                      <p className="text-sm text-gray-500 mb-4">Last maintenance: November 20, 2024 at 2:00 AM</p>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700">
                          <Settings className="h-4 w-4 mr-2" />
                          Schedule Maintenance
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

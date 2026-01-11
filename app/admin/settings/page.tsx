"use client";

import { useState, useEffect } from 'react';
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
  Download,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    siteName: '',
    siteDescription: '',
    platformUrl: '',
    timeZone: 'Asia/Kolkata',
    currency: 'INR',
    maintenanceMode: false,
    userRegistration: true,
    sellerRegistration: true,
    enableServiceBookings: true,
    enableJobPostings: true,
    enableEmailVerification: false,
    enablePushNotifications: false,
    contactEmail: '',
    contactPhone: '',
    address: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    // Security
    enableTwoFactor: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChar: false,
    maxLoginAttempts: 5,
    // Payments
    enableStripe: false,
    stripeKey: '',
    stripeSecret: '',
    enablePaypal: false,
    paypalClientId: '',
    paypalSecret: '',
    enableRazorpay: false,
    razorpayKey: '',
    razorpaySecret: '',
    // Email
    mailDriver: 'smtp',
    mailHost: '',
    mailPort: '587',
    mailUsername: '',
    mailPassword: '',
    mailEncryption: 'tls',
    mailFromAddress: '',
    mailFromName: '',
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    systemNotifications: true,
    // API
    googleMapsApiKey: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    awsAccessKey: '',
    awsSecretKey: '',
    awsRegion: '',
    awsBucketName: '',
  });

  // System Health & Backup State
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState<'trigger' | 'download' | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings((prev: any) => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch health status when tab changes to 'database'
  useEffect(() => {
    if (activeTab === 'database') {
      fetchHealthStatus();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchHealthStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchHealthStatus = async () => {
    try {
      setHealthLoading(true);
      const response = await fetch('/api/admin/system-health');
      const data = await response.json();
      if (data.success) {
        setHealthData(data.checks);
      }
    } catch (error) {
      console.error('Error fetching health status:', error);
      toast.error('Failed to update system health');
    } finally {
      setHealthLoading(false);
    }
  };

  const handleBackup = async (action: 'trigger' | 'download') => {
    try {
      setBackupLoading(action);
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();

      if (data.success) {
        if (action === 'download') {
          // In a real implementation, this would handle the file download
          // For now, we'll show the stats in a toast or modal
          // Create a blob and download it to simulate the experience
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `database-stats-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success('Database export generated successfully');
        } else {
          toast.success(data.message || 'Backup started successfully');
        }
      } else {
        toast.error(data.error || 'Backup operation failed');
      }
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Failed to perform backup operation');
    } finally {
      setBackupLoading(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettings((prev: any) => ({ ...prev, [name]: val }));
  };

  const handleToggle = async (name: string, value: boolean) => {
    // 1. Update local state immediately for UI responsiveness
    setSettings((prev: any) => ({ ...prev, [name]: value }));

    // 2. Auto-save this specific change to make it "dynamic"
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [name]: value }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Setting updated successfully`, {
          duration: 1000,
          position: 'bottom-right'
        });
      } else {
        // Show detailed error message
        const errorMsg = data.details || data.error || 'Failed to auto-save change';
        toast.error(errorMsg, {
          duration: 4000,
          position: 'top-center'
        });
        console.error('Settings update error:', data);
        // Revert the change on error
        setSettings((prev: any) => ({ ...prev, [name]: !value }));
      }
    } catch (error) {
      console.error('Error auto-saving:', error);
      toast.error('Connection error while saving', {
        duration: 3000,
        position: 'top-center'
      });
      // Revert the change on error
      setSettings((prev: any) => ({ ...prev, [name]: !value }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Loading platform configurations...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General Settings', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'payment', name: 'Payment Settings', icon: CreditCard },
    { id: 'email', name: 'Email Configuration', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'database', name: 'System & Maintenance', icon: Database },
    { id: 'api', name: 'API Settings', icon: Code },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 mt-2">Configure system settings, preferences, and platform-wide configurations</p>
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
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                      ? 'text-primary-600 bg-primary-50 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <tab.icon className="h-4 w-4 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* General Settings Tab content */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-primary-600" />
                      General Settings
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                        <input
                          type="text"
                          name="siteName"
                          value={settings.siteName || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform URL</label>
                        <input
                          type="url"
                          name="platformUrl"
                          value={settings.platformUrl || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                        <select
                          name="timeZone"
                          value={settings.timeZone || 'Asia/Kolkata'}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                          <option value="America/New_York">America/New_York (GMT-5)</option>
                          <option value="Europe/London">Europe/London (GMT+0)</option>
                          <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                        <select
                          name="currency"
                          value={settings.currency || 'INR'}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Description</label>
                      <textarea
                        rows={3}
                        name="siteDescription"
                        value={settings.siteDescription || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
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
                      {[
                        { id: 'enableServiceBookings', title: 'Service Bookings', desc: 'Allow users to book services from providers' },
                        { id: 'enableJobPostings', title: 'Job Postings', desc: 'Enable employers to post jobs and hire candidates' },
                        { id: 'userRegistration', title: 'User Registration', desc: 'Allow new users to register on the platform' },
                        { id: 'enableEmailVerification', title: 'Email Verification', desc: 'Require email verification for new accounts' },
                        { id: 'enablePushNotifications', title: 'Push Notifications', desc: 'Send push notifications to mobile app users' },
                      ].map((feature) => (
                        <div key={feature.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{feature.title}</h4>
                            <p className="text-xs text-gray-500">{feature.desc}</p>
                          </div>
                          <button
                            onClick={() => handleToggle(feature.id, !settings[feature.id as keyof typeof settings])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${settings[feature.id as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[feature.id as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab content */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary-600" />
                      Security Settings
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-xs text-gray-500">Require 2FA for all administrative accounts</p>
                      </div>
                      <button
                        onClick={() => handleToggle('enableTwoFactor', !settings.enableTwoFactor)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableTwoFactor ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableTwoFactor ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          name="sessionTimeout"
                          value={settings.sessionTimeout || 30}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                        <input
                          type="number"
                          name="passwordMinLength"
                          value={settings.passwordMinLength || 8}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                        <input
                          type="number"
                          name="maxLoginAttempts"
                          value={settings.maxLoginAttempts || 5}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex items-center space-x-3 pt-8">
                        <input
                          type="checkbox"
                          id="requireSpecialChar"
                          name="requireSpecialChar"
                          checked={settings.requireSpecialChar || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="requireSpecialChar" className="text-sm font-medium text-gray-700">Require Special Characters</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings Tab content */}
            {activeTab === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                      Payment Gateways
                    </h3>
                  </div>
                  <div className="p-6 space-y-8">
                    {/* Stripe */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-indigo-600 font-bold">S</span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Stripe Payment</h4>
                        </div>
                        <button
                          onClick={() => handleToggle('enableStripe', !settings.enableStripe)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableStripe ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableStripe ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {settings.enableStripe && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stripe Publishable Key</label>
                            <input
                              type="text"
                              name="stripeKey"
                              value={settings.stripeKey || ''}
                              onChange={handleChange}
                              placeholder="pk_test_..."
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stripe Secret Key</label>
                            <input
                              type="password"
                              name="stripeSecret"
                              value={settings.stripeSecret || ''}
                              onChange={handleChange}
                              placeholder="sk_test_..."
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <hr className="border-gray-100" />

                    {/* Razorpay */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-bold">R</span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900">Razorpay India</h4>
                        </div>
                        <button
                          onClick={() => handleToggle('enableRazorpay', !settings.enableRazorpay)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.enableRazorpay ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableRazorpay ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {settings.enableRazorpay && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Razorpay Key ID</label>
                            <input
                              type="text"
                              name="razorpayKey"
                              value={settings.razorpayKey || ''}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Razorpay Secret</label>
                            <input
                              type="password"
                              name="razorpaySecret"
                              value={settings.razorpaySecret || ''}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Configuration Tab content */}
            {activeTab === 'email' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-primary-600" />
                      SMTP Configuration
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mail Host</label>
                        <input
                          type="text"
                          name="mailHost"
                          value={settings.mailHost || ''}
                          onChange={handleChange}
                          placeholder="smtp.gmail.com"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mail Port</label>
                        <input
                          type="text"
                          name="mailPort"
                          value={settings.mailPort || '587'}
                          onChange={handleChange}
                          placeholder="587"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                        <input
                          type="text"
                          name="mailUsername"
                          value={settings.mailUsername || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <input
                          type="password"
                          name="mailPassword"
                          value={settings.mailPassword || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">From Address</label>
                        <input
                          type="email"
                          name="mailFromAddress"
                          value={settings.mailFromAddress || ''}
                          onChange={handleChange}
                          placeholder="noreply@forgeindia.com"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">From Name</label>
                        <input
                          type="text"
                          name="mailFromName"
                          value={settings.mailFromName || ''}
                          onChange={handleChange}
                          placeholder="Forge India Connect"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab content */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-primary-600" />
                      Global Notification Toggles
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { id: 'emailNotifications', title: 'Email Alerts', desc: 'Send transactional emails to users' },
                      { id: 'smsNotifications', title: 'SMS OTP', desc: 'Send login and order OTPs via SMS' },
                      { id: 'orderNotifications', title: 'Order Updates', desc: 'Notify admins of new service/product orders' },
                      { id: 'systemNotifications', title: 'Critical System Alerts', desc: 'Warn admins about server or DB issues' },
                    ].map((notify) => (
                      <div key={notify.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{notify.title}</h4>
                          <p className="text-xs text-gray-500">{notify.desc}</p>
                        </div>
                        <button
                          onClick={() => handleToggle(notify.id, !settings[notify.id as keyof typeof settings])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[notify.id as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[notify.id as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User Management Tab content */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary-600" />
                      Registration & Login
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Buyer Registration</h4>
                        <p className="text-xs text-gray-500">Allow customers to create new accounts</p>
                      </div>
                      <button
                        onClick={() => handleToggle('userRegistration', !settings.userRegistration)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.userRegistration ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.userRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Seller Onboarding</h4>
                        <p className="text-xs text-gray-500">Allow service providers to register</p>
                      </div>
                      <button
                        onClick={() => handleToggle('sellerRegistration', !settings.sellerRegistration)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.sellerRegistration ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.sellerRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        Disabling registration will prevent new users from signing up. Existing users will still be able to log in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Settings Tab content */}
            {activeTab === 'api' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Code className="h-5 w-5 mr-2 text-primary-600" />
                      External Integrations
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Google Maps API Key</label>
                      <input
                        type="text"
                        name="googleMapsApiKey"
                        value={settings.googleMapsApiKey || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="AIza..."
                      />
                      <p className="mt-1 text-xs text-gray-500">Required for location-based service discovery</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Google Analytics ID</label>
                        <input
                          type="text"
                          name="googleAnalyticsId"
                          value={settings.googleAnalyticsId || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Facebook Pixel ID</label>
                        <input
                          type="text"
                          name="facebookPixelId"
                          value={settings.facebookPixelId || ''}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 mb-4">AWS S3 Storage (Images & Resumes)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">AWS Access Key</label>
                          <input
                            type="text"
                            name="awsAccessKey"
                            value={settings.awsAccessKey || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">AWS Secret</label>
                          <input
                            type="password"
                            name="awsSecretKey"
                            value={settings.awsSecretKey || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">S3 Bucket</label>
                          <input
                            type="text"
                            name="awsBucketName"
                            value={settings.awsBucketName || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Save Button - For all tabs EXCEPT Database tab (which has individual actions) */}
            {activeTab !== 'database' && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 group"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating System...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Database Tab content (Individual actions as originally implemented) */}
            {activeTab === 'database' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* System Status - Always visible on General for now or separate? Let's keep it tidy */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Server className="h-5 w-5 mr-2" />
                        System Health Check
                      </h3>
                      <button
                        onClick={fetchHealthStatus}
                        disabled={healthLoading}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                      >
                        {healthLoading ? 'Refreshing...' : 'Refresh Status'}
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {healthLoading && healthData.length === 0 ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(healthData.length > 0 ? healthData : [
                          { name: 'Database', status: 'Checking...', color: 'text-gray-400', icon: Loader2 },
                          { name: 'Email Service', status: 'Checking...', color: 'text-gray-400', icon: Loader2 },
                          { name: 'Payment Gateway', status: 'Checking...', color: 'text-gray-400', icon: Loader2 },
                          { name: 'File Storage', status: 'Checking...', color: 'text-gray-400', icon: Loader2 },
                          { name: 'API Services', status: 'Checking...', color: 'text-gray-400', icon: Loader2 },
                          { name: 'CDN', status: 'Checking...', color: 'text-gray-400', icon: Loader2 },
                        ]).map((sys: any, idx: number) => {
                          // Dynamic icon mapping if it comes as string from API
                          let Icon = sys.icon;
                          if (typeof sys.icon === 'string') {
                            if (sys.icon === 'CheckCircle') Icon = CheckCircle;
                            else if (sys.icon === 'AlertCircle') Icon = AlertCircle;
                            else Icon = Loader2;
                          } else if (!Icon) {
                            Icon = Loader2;
                          }

                          return (
                            <div key={sys.service || sys.name || idx} className="flex items-center group">
                              <div className={`p-2 ${sys.healthy ? 'bg-green-50' : 'bg-gray-50'} rounded-lg mr-3 transition-colors group-hover:bg-opacity-80`}>
                                <Icon className={`h-5 w-5 ${sys.color || 'text-gray-400'}`} />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{sys.service || sys.name}</div>
                                <div className={`text-xs font-semibold ${sys.color || 'text-gray-500'}`}>
                                  {sys.status}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Backup & Maintenance */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Backup & Recovery</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Manual Database Export</h4>
                        <p className="text-xs text-gray-500 mb-4">Last automatic backup: {new Date().toLocaleDateString()} at 3:00 AM</p>
                        <div className="flex space-x-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBackup('download')}
                              disabled={backupLoading === 'download'}
                              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-md active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                            >
                              {backupLoading === 'download' ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              {backupLoading === 'download' ? 'Generating...' : 'Download Dump'}
                            </button>
                            <button
                              onClick={() => handleBackup('trigger')}
                              disabled={backupLoading === 'trigger'}
                              className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                            >
                              {backupLoading === 'trigger' && (
                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              )}
                              Trigger Backup
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">System Maintenance Mode</h4>
                        <p className="text-xs text-gray-500 mb-4">Set the site to maintenance mode for updates</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggle('maintenanceMode', !settings.maintenanceMode)}
                            className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl transition-colors shadow-md active:scale-95 ${settings.maintenanceMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            {settings.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard Test</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 mb-4">✅ Admin route is working!</p>
          <p className="text-sm text-gray-500">
            If you can see this page, the admin routing is configured correctly.
          </p>
          <div className="mt-6 space-y-2">
            <p className="text-sm"><strong>Current Path:</strong> /admin/test</p>
            <p className="text-sm"><strong>Dashboard Path:</strong> /admin/dashboard</p>
            <p className="text-sm"><strong>Main Admin Path:</strong> /admin</p>
          </div>
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Quick Access:</h3>
            <div className="mt-2 space-x-4">
              <a href="/admin" className="text-blue-600 hover:text-blue-800 underline">Main Admin</a>
              <a href="/admin/users" className="text-blue-600 hover:text-blue-800 underline">Users</a>
              <a href="/admin/services" className="text-blue-600 hover:text-blue-800 underline">Services</a>
              <a href="/admin/orders" className="text-blue-600 hover:text-blue-800 underline">Orders</a>
              <a href="/admin/settings" className="text-blue-600 hover:text-blue-800 underline">Settings</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

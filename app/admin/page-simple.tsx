export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Connect Platform - Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Users</h3>
            <p className="text-gray-600 text-sm mb-4">Manage users and accounts</p>
            <a href="/admin/users" className="text-blue-600 hover:text-blue-800 font-medium">View Users →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🛍️ Services</h3>
            <p className="text-gray-600 text-sm mb-4">Manage services and listings</p>
            <a href="/admin/services" className="text-blue-600 hover:text-blue-800 font-medium">View Services →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Orders</h3>
            <p className="text-gray-600 text-sm mb-4">Track and manage orders</p>
            <a href="/admin/orders" className="text-blue-600 hover:text-blue-800 font-medium">View Orders →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📁 Categories</h3>
            <p className="text-gray-600 text-sm mb-4">Organize service categories</p>
            <a href="/admin/categories" className="text-blue-600 hover:text-blue-800 font-medium">View Categories →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Settings</h3>
            <p className="text-gray-600 text-sm mb-4">Configure platform settings</p>
            <a href="/admin/settings" className="text-blue-600 hover:text-blue-800 font-medium">View Settings →</a>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🧪 Test</h3>
            <p className="text-gray-600 text-sm mb-4">Test admin functionality</p>
            <a href="/admin/test" className="text-blue-600 hover:text-blue-800 font-medium">Test Route →</a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">567</div>
              <div className="text-sm text-gray-500">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">890</div>
              <div className="text-sm text-gray-500">Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">₹45,678</div>
              <div className="text-sm text-gray-500">Revenue</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            ✅ Admin dashboard is working! This is a simplified version for testing.
          </p>
          <p className="text-green-700 text-sm mt-1">
            Navigate to different sections using the links above.
          </p>
        </div>
      </div>
    </div>
  );
}

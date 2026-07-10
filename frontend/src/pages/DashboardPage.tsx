import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">OmniPOS</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            👤 {user?.name} ({user?.role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Revenue Today</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">₹0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Products</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Low Stock Items</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/pos')}
            className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 text-left transition"
          >
            <p className="text-2xl mb-2">🛒</p>
            <p className="font-bold text-lg">POS Terminal</p>
            <p className="text-blue-200 text-sm">Create new sale</p>
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 text-left transition"
          >
            <p className="text-2xl mb-2">📦</p>
            <p className="font-bold text-lg">Inventory</p>
            <p className="text-green-200 text-sm">Manage stock</p>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="bg-purple-600 text-white p-6 rounded-xl hover:bg-purple-700 text-left transition"
          >
            <p className="text-2xl mb-2">📋</p>
            <p className="font-bold text-lg">Orders</p>
            <p className="text-purple-200 text-sm">View all orders</p>
          </button>
        </div>
      </div>
    </div>
  );
}
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
    <div className="layout">
      <div className="main">
        <nav className="navbar">
          <h1 style={{ color: '#4f46e5', margin: 0 }}>OmniPOS</h1>
          <div className="navbar-right">
            <div className="navbar-user">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        <div className="content">
          <div className="page">
            <div className="dashboard-header">
              <h1>Dashboard</h1>
              <p>Welcome back, here's what's happening today.</p>
            </div>

            <div className="dashboard-grid">
              <div className="stat-card">
                <p className="stat-title">Total Orders</p>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card accent-green">
                <p className="stat-title">Revenue Today</p>
                <p className="stat-value">₹0</p>
              </div>
              <div className="stat-card accent-blue">
                <p className="stat-title">Products</p>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card accent-red">
                <p className="stat-title">Low Stock Items</p>
                <p className="stat-value">0</p>
              </div>
            </div>

            <div className="dashboard-panels">
              <div className="panel">
                <h3>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="primary-btn" onClick={() => navigate('/pos')}>
                    🛒 POS Terminal
                  </button>
                  <button className="primary-btn" onClick={() => navigate('/inventory')}>
                    📦 Inventory
                  </button>
                  <button className="primary-btn" onClick={() => navigate('/orders')}>
                    📋 Orders
                  </button>
                </div>
              </div>
              <div className="panel">
                <h3>Recent Activity</h3>
                <p className="muted-text">No recent activity yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
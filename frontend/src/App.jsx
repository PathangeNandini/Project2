import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PosPage from './pages/PosPage';
import ProtectedRoute from './components/ProtectedRoute';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <PosPage />
          </ProtectedRoute>
        }
      />
      <Route
  path="/inventory"
  element={
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  }
  />
  <Route
  path="/orders"
  element={
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  }
/>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
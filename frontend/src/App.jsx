import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Stores from "./pages/Stores";
import Users from "./pages/Users";
import POS from "./pages/POS";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/users" element={<Users />} />
        <Route path="/pos" element={<POS />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
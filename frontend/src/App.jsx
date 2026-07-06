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
        <Route path="/pos" element={<POS />} />
        <Route path="/orders" element={<Orders />} />

        <Route
          path="/products"
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute roles={["admin", "manager"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Stores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

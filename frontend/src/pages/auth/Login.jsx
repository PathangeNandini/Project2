import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-overlay" />
        <div className="auth-brand">
          <span className="brand-badge">Omnichannel Retail</span>
          <h1>Point of Sale &amp; Inventory</h1>
          <p>
            Unified checkout, live inventory visibility, and role-based
            operations across every store from one system.
          </p>
          <div className="auth-points">
            <div className="point-card">
              <h3>Fast checkout</h3>
              <p>Barcode-ready POS built for quick, accurate billing.</p>
            </div>
            <div className="point-card">
              <h3>Live inventory</h3>
              <p>Track stock across stores with low-stock alerts.</p>
            </div>
            <div className="point-card">
              <h3>Role-based access</h3>
              <p>Cashier, manager, and admin roles from day one.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="card-top">
            <h2>Welcome back</h2>
            <p>Login to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@store.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="login-footer-text">
            <span>
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

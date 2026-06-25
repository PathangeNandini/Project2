import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);

      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-overlay" />
        <div className="auth-brand">
          <span className="brand-badge">Infotact Internship Project</span>
          <h1>Omnichannel Retail POS</h1>
          <p>
            Unified checkout, smart inventory visibility, and modern
            omnichannel operations from one system.
          </p>

          <div className="auth-points">
            <div className="point-card">
              <h3>Fast checkout</h3>
              <p>Built for responsive cashier operations and quick billing flow.</p>
            </div>

            <div className="point-card">
              <h3>Live inventory</h3>
              <p>Track products across stores, warehouses, and sales channels.</p>
            </div>

            <div className="point-card">
              <h3>Role-based access</h3>
              <p>Separate cashier, manager, and admin access from day one.</p>
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
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          {error && <p className="error-text">{error}</p>}

          <div className="login-footer-text">
            <span>Week 1 Frontend - Authentication Module</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

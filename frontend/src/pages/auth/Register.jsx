import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success("Account created successfully!");
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
          <h1>Create your account</h1>
          <p>Join your store's POS system and start managing sales and inventory today.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="card-top">
            <h2>Create account</h2>
            <p>Fill in the details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Full name</label>
            <input
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
            />

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
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />

            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="login-footer-text">
            <span>
              Already have an account? <Link to="/login">Login</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

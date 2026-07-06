import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import dashboardApi from "../services/dashboardApi";
import Card from "../components/Card";
import Loader from "../components/Loader";
import useAuthStore from "../store/authStore";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    dashboardApi
      .getSummary(user?.storeId ? { storeId: user.storeId } : {})
      .then((data) => mounted && setSummary(data))
      .catch((err) => mounted && setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (error) return <p className="error-text">{error}</p>;

  const currency = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name || "there"} 👋</h1>
          <p>Here's what's happening across your stores today.</p>
        </div>
      </header>

      <section className="dashboard-grid">
        <Card title="Today's Revenue" value={currency(summary.todayRevenue)} accent="green" />
        <Card title="Today's Orders" value={summary.todayOrders} accent="blue" />
        <Card title="Total Revenue" value={currency(summary.totalRevenue)} accent="purple" />
        <Card title="Total Orders" value={summary.totalOrders} accent="default" />
        <Card title="Active Products" value={summary.totalProducts} accent="default" />
        <Card
          title="Low Stock Items"
          value={summary.lowStockCount}
          accent={summary.lowStockCount > 0 ? "red" : "green"}
        />
      </section>

      <section className="dashboard-panels">
        <div className="panel">
          <h3>Sales — last 7 days</h3>
          {summary.salesTrend?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={summary.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => currency(value)} />
                <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted-text">No sales recorded in the last 7 days.</p>
          )}
        </div>

        <div className="panel">
          <h3>Recent Orders</h3>
          {summary.recentOrders?.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Store</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.storeId?.name || "—"}</td>
                    <td>{currency(o.totalAmount)}</td>
                    <td>
                      <span className={`badge badge-${o.status}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted-text">No orders yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import orderApi from "../services/orderApi";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import useAuthStore from "../store/authStore";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);

export default function Orders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const data = await orderApi.getAll(params);
      setOrders(data.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilter = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    load(val ? { status: val } : {});
  };

  const canManage = user?.role === "admin" || user?.role === "manager";

  const handleStatusChange = async (order, status) => {
    try {
      await orderApi.updateStatus(order._id, status);
      toast.success(`Order marked as ${status}`);
      setSelected(null);
      load(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <select value={statusFilter} onChange={handleFilter} className="store-filter">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Store</th>
              <th>Cashier</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="muted-text">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.storeId?.name || "—"}</td>
                <td>{o.cashierId?.name || "—"}</td>
                <td>{o.items?.length || 0}</td>
                <td>{currency(o.totalAmount)}</td>
                <td>{o.paymentMethod}</td>
                <td>
                  <span className={`badge badge-${o.status}`}>{o.status}</span>
                </td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => setSelected(o)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <Modal title={`Order ${selected.orderNumber}`} onClose={() => setSelected(null)} width="600px">
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selected.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productName}</td>
                  <td>{item.variantSku}</td>
                  <td>{item.quantity}</td>
                  <td>{currency(item.unitPrice)}</td>
                  <td>{currency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="order-summary">
            <p>
              <span>Subtotal</span> <span>{currency(selected.subtotal)}</span>
            </p>
            <p>
              <span>Discount</span> <span>-{currency(selected.totalDiscount)}</span>
            </p>
            <p>
              <span>Tax</span> <span>{currency(selected.totalTax)}</span>
            </p>
            <p className="total-row">
              <span>Total</span> <span>{currency(selected.totalAmount)}</span>
            </p>
          </div>

          {canManage && selected.status !== "cancelled" && selected.status !== "refunded" && (
            <div className="row-actions" style={{ marginTop: "1rem" }}>
              <button className="danger" onClick={() => handleStatusChange(selected, "cancelled")}>
                Cancel Order
              </button>
              <button onClick={() => handleStatusChange(selected, "refunded")}>Refund Order</button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

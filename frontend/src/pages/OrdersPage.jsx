import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleRefund = async () => {
    if (!selectedOrder) return;
    if (!confirm('Refund this order? This will restore inventory stock.')) return;
    setRefunding(true);
    try {
      await api.post(`/orders/${selectedOrder._id}/refund`);
      closeModal();
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Refund failed.');
    } finally {
      setRefunding(false);
    }
  };

  const statusBadgeClass = (status) => {
    if (status === 'confirmed') return 'badge-confirmed';
    if (status === 'pending') return 'badge-pending';
    if (status === 'cancelled') return 'badge-cancelled';
    if (status === 'refunded') return 'badge-refunded';
    return '';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
      </div>

      {loading ? (
        <div className="loader-wrap">
          <div className="spinner"></div>
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <p className="muted-text">No orders yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Cashier</th>
              <th>Store</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderNumber}</td>
                <td>{order.cashierId?.name || '—'}</td>
                <td>{order.storeId?.name || '—'}</td>
                <td>{order.items?.length || 0}</td>
                <td>₹{order.totalAmount?.toFixed(2)}</td>
                <td>
                  <span className={`badge ${statusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td className="row-actions">
                  <button onClick={() => openOrder(order)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order {selectedOrder.orderNumber}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-content">
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge ${statusBadgeClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </p>
              <p><strong>Cashier:</strong> {selectedOrder.cashierId?.name || '—'}</p>
              <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>

              <table className="data-table compact" style={{ marginTop: '14px' }}>
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
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName}</td>
                      <td>{item.variantSku}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.unitPrice}</td>
                      <td>₹{item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="order-summary">
                <p><span>Subtotal</span><span>₹{selectedOrder.subtotal.toFixed(2)}</span></p>
                <p><span>Discount</span><span>₹{selectedOrder.totalDiscount.toFixed(2)}</span></p>
                <p><span>Tax</span><span>₹{selectedOrder.totalTax.toFixed(2)}</span></p>
                <p className="total-row"><span>Total</span><span>₹{selectedOrder.totalAmount.toFixed(2)}</span></p>
              </div>

              {selectedOrder.status !== 'refunded' && (
                <button
                  className="primary-btn danger"
                  style={{ marginTop: '16px', width: '100%' }}
                  onClick={handleRefund}
                  disabled={refunding}
                >
                  {refunding ? 'Processing refund...' : 'Refund Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
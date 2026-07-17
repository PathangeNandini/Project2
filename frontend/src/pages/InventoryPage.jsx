import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [operation, setOperation] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setInventory(res.data.inventory || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = inventory.filter((item) => {
    const name = item.productId?.name?.toLowerCase() || '';
    const sku = item.variantSku?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || sku.includes(search.toLowerCase());
  });

  const openAdjustModal = (item) => {
    setModalItem(item);
    setOperation('add');
    setQuantity('');
  };

  const closeModal = () => {
    setModalItem(null);
    setQuantity('');
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0) return;
    setSaving(true);
    try {
      await api.put('/inventory/update-stock', {
        productId: modalItem.productId?._id,
        storeId: modalItem.storeId?._id,
        variantSku: modalItem.variantSku,
        quantity: Number(quantity),
        operation,
      });
      closeModal();
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Inventory</h1>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loader-wrap">
          <div className="spinner"></div>
          Loading inventory...
        </div>
      ) : filtered.length === 0 ? (
        <p className="muted-text">No inventory records found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Store</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isLow = item.quantity <= item.lowStockThreshold;
              return (
                <tr key={item._id}>
                  <td>{item.productId?.name || '—'}</td>
                  <td>{item.variantSku}</td>
                  <td>{item.productId?.category || '—'}</td>
                  <td>{item.storeId?.name || '—'}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <span className={`badge ${isLow ? 'badge-cancelled' : 'badge-confirmed'}`}>
                      {isLow ? 'Low stock' : 'In stock'}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button onClick={() => openAdjustModal(item)}>Adjust</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {modalItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adjust Stock — {modalItem.productId?.name}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-content">
              <form className="modal-form" onSubmit={handleAdjust}>
                <label>SKU</label>
                <input type="text" value={modalItem.variantSku} disabled />

                <label>Current Stock</label>
                <input type="text" value={modalItem.quantity} disabled />

                <label>Operation</label>
                <select value={operation} onChange={(e) => setOperation(e.target.value)}>
                  <option value="add">Add stock</option>
                  <option value="subtract">Remove stock</option>
                  <option value="set">Set exact quantity</option>
                </select>

                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />

                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Update Stock'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
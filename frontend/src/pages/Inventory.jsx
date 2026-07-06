import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import inventoryApi from "../services/inventoryApi";
import storeApi from "../services/storeApi";
import Modal from "../components/Modal";
import Loader from "../components/Loader";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeFilter, setStoreFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [stockModal, setStockModal] = useState(null); // inventory row being adjusted
  const [stockForm, setStockForm] = useState({ operation: "add", quantity: "" });

  const [transferModal, setTransferModal] = useState(null);
  const [transferForm, setTransferForm] = useState({ toStoreId: "", quantity: "" });

  const [saving, setSaving] = useState(false);

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const data = await inventoryApi.getAll(params);
      setInventory(data.inventory || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    storeApi.getAll().then((d) => setStores(d.stores || [])).catch(() => {});
  }, []);

  const handleFilter = (e) => {
    const val = e.target.value;
    setStoreFilter(val);
    load(val ? { storeId: val } : {});
  };

  const openStockModal = (row) => {
    setStockModal(row);
    setStockForm({ operation: "add", quantity: "" });
  };

  const submitStockUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryApi.updateStock({
        productId: stockModal.productId._id || stockModal.productId,
        storeId: stockModal.storeId._id || stockModal.storeId,
        variantSku: stockModal.variantSku,
        operation: stockForm.operation,
        quantity: Number(stockForm.quantity),
      });
      toast.success("Stock updated");
      setStockModal(null);
      load(storeFilter ? { storeId: storeFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const openTransferModal = (row) => {
    setTransferModal(row);
    setTransferForm({ toStoreId: "", quantity: "" });
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryApi.transfer({
        productId: transferModal.productId._id || transferModal.productId,
        variantSku: transferModal.variantSku,
        fromStoreId: transferModal.storeId._id || transferModal.storeId,
        toStoreId: transferForm.toStoreId,
        quantity: Number(transferForm.quantity),
      });
      toast.success("Stock transferred");
      setTransferModal(null);
      load(storeFilter ? { storeId: storeFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Inventory</h1>
        <select value={storeFilter} onChange={handleFilter} className="store-filter">
          <option value="">All Stores</option>
          {stores.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Store</th>
              <th>Quantity</th>
              <th>Reserved</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 && (
              <tr>
                <td colSpan={7} className="muted-text">
                  No inventory records found.
                </td>
              </tr>
            )}
            {inventory.map((row) => {
              const isLow = row.quantity <= row.lowStockThreshold;
              return (
                <tr key={row._id}>
                  <td>{row.productId?.name || "—"}</td>
                  <td>{row.variantSku}</td>
                  <td>{row.storeId?.name || "—"}</td>
                  <td>{row.quantity}</td>
                  <td>{row.reserved}</td>
                  <td>
                    <span className={`badge ${isLow ? "badge-cancelled" : "badge-confirmed"}`}>
                      {isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button onClick={() => openStockModal(row)}>Adjust</button>
                    <button onClick={() => openTransferModal(row)}>Transfer</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {stockModal && (
        <Modal title={`Adjust Stock — ${stockModal.productId?.name || ""}`} onClose={() => setStockModal(null)}>
          <form className="modal-form" onSubmit={submitStockUpdate}>
            <label>Operation</label>
            <select
              value={stockForm.operation}
              onChange={(e) => setStockForm((p) => ({ ...p, operation: e.target.value }))}
            >
              <option value="add">Add stock</option>
              <option value="subtract">Remove stock</option>
              <option value="set">Set exact quantity</option>
            </select>

            <label>Quantity</label>
            <input
              type="number"
              min="0"
              value={stockForm.quantity}
              onChange={(e) => setStockForm((p) => ({ ...p, quantity: e.target.value }))}
              required
            />

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Saving..." : "Update Stock"}
            </button>
          </form>
        </Modal>
      )}

      {transferModal && (
        <Modal title={`Transfer Stock — ${transferModal.productId?.name || ""}`} onClose={() => setTransferModal(null)}>
          <form className="modal-form" onSubmit={submitTransfer}>
            <label>Destination Store</label>
            <select
              value={transferForm.toStoreId}
              onChange={(e) => setTransferForm((p) => ({ ...p, toStoreId: e.target.value }))}
              required
            >
              <option value="">Select store</option>
              {stores
                .filter((s) => s._id !== (transferModal.storeId._id || transferModal.storeId))
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>

            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max={transferModal.quantity}
              value={transferForm.quantity}
              onChange={(e) => setTransferForm((p) => ({ ...p, quantity: e.target.value }))}
              required
            />
            <p className="muted-text">Available: {transferModal.quantity}</p>

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Transferring..." : "Transfer Stock"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

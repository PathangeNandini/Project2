import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import storeApi from "../services/storeApi";
import Modal from "../components/Modal";
import Loader from "../components/Loader";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  taxRate: 18,
  street: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await storeApi.getAll();
      setStores(data.stores || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (store) => {
    setEditing(store);
    setForm({
      name: store.name,
      phone: store.phone,
      email: store.email,
      taxRate: store.taxRate,
      street: store.address?.street || "",
      city: store.address?.city || "",
      state: store.address?.state || "",
      country: store.address?.country || "",
      zipCode: store.address?.zipCode || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        taxRate: Number(form.taxRate),
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          zipCode: form.zipCode,
        },
      };
      if (editing) {
        await storeApi.update(editing._id, payload);
        toast.success("Store updated");
      } else {
        await storeApi.create(payload);
        toast.success("Store created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (store) => {
    if (!window.confirm(`Deactivate "${store.name}"?`)) return;
    try {
      await storeApi.remove(store._id);
      toast.success("Store deactivated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stores</h1>
        <button className="primary-btn" onClick={openCreate}>
          + Add Store
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Tax Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 && (
              <tr>
                <td colSpan={6} className="muted-text">
                  No stores found.
                </td>
              </tr>
            )}
            {stores.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.address?.city}</td>
                <td>{s.phone}</td>
                <td>{s.email}</td>
                <td>{s.taxRate}%</td>
                <td className="row-actions">
                  <button onClick={() => openEdit(s)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(s)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <Modal title={editing ? "Edit Store" : "Add Store"} onClose={() => setShowModal(false)}>
          <form className="modal-form" onSubmit={handleSubmit}>
            <label>Store Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <div className="form-row">
              <div>
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div>
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <label>Street</label>
            <input name="street" value={form.street} onChange={handleChange} required />

            <div className="form-row form-row-3">
              <div>
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div>
                <label>State</label>
                <input name="state" value={form.state} onChange={handleChange} required />
              </div>
              <div>
                <label>Zip Code</label>
                <input name="zipCode" value={form.zipCode} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Country</label>
                <input name="country" value={form.country} onChange={handleChange} required />
              </div>
              <div>
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={form.taxRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Store" : "Create Store"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

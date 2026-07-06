import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import userApi from "../services/userApi";
import storeApi from "../services/storeApi";
import Modal from "../components/Modal";
import Loader from "../components/Loader";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "cashier",
  storeId: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    storeApi.getAll().then((d) => setStores(d.stores || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      storeId: user.storeId?._id || user.storeId || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await userApi.update(editing._id, {
          name: form.name,
          role: form.role,
          storeId: form.storeId || undefined,
        });
        toast.success("User updated");
      } else {
        await userApi.create(form);
        toast.success("User created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Deactivate "${user.name}"?`)) return;
    try {
      await userApi.remove(user._id);
      toast.success("User deactivated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <button className="primary-btn" onClick={openCreate}>
          + Add User
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Store</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="muted-text">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge-role-${u.role}`}>{u.role}</span>
                </td>
                <td>{u.storeId?.name || "—"}</td>
                <td className="row-actions">
                  <button onClick={() => openEdit(u)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(u)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <Modal title={editing ? "Edit User" : "Add User"} onClose={() => setShowModal(false)}>
          <form className="modal-form" onSubmit={handleSubmit}>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={!!editing}
              required
            />

            {!editing && (
              <>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </>
            )}

            <div className="form-row">
              <div>
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label>Store</label>
                <select name="storeId" value={form.storeId} onChange={handleChange}>
                  <option value="">No store</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update User" : "Create User"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

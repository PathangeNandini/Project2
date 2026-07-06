import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import productApi from "../services/productApi";
import storeApi from "../services/storeApi";
import Modal from "../components/Modal";
import Loader from "../components/Loader";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  basePrice: "",
  barcode: "",
  storeId: "",
  variantSku: "",
  variantPrice: "",
  variantStock: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = async (params = {}) => {
    setLoading(true);
    try {
      const data = await productApi.getAll(params);
      setProducts(data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    storeApi.getAll().then((d) => setStores(d.stores || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(search ? { search } : {});
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    const v = product.variants?.[0] || {};
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      basePrice: product.basePrice,
      barcode: product.barcode || "",
      storeId: product.storeId?._id || product.storeId || "",
      variantSku: v.sku || "",
      variantPrice: v.price ?? product.basePrice,
      variantStock: v.stock ?? 0,
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
        description: form.description,
        category: form.category,
        basePrice: Number(form.basePrice),
        barcode: form.barcode,
        storeId: form.storeId,
        variants: [
          {
            sku: form.variantSku,
            price: Number(form.variantPrice || form.basePrice),
            stock: Number(form.variantStock || 0),
          },
        ],
      };

      if (editing) {
        await productApi.update(editing._id, payload);
        toast.success("Product updated");
      } else {
        await productApi.create(payload);
        toast.success("Product created");
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await productApi.remove(product._id);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products</h1>
        <button className="primary-btn" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products by name, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Base Price</th>
              <th>Barcode</th>
              <th>Store</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="muted-text">
                  No products found.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.basePrice}</td>
                <td>{p.barcode || "—"}</td>
                <td>{p.storeId?.name || "—"}</td>
                <td className="row-actions">
                  <button onClick={() => openEdit(p)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setShowModal(false)}>
          <form className="modal-form" onSubmit={handleSubmit}>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} />

            <div className="form-row">
              <div>
                <label>Category</label>
                <input name="category" value={form.category} onChange={handleChange} required />
              </div>
              <div>
                <label>Base Price</label>
                <input
                  type="number"
                  name="basePrice"
                  value={form.basePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Barcode</label>
                <input name="barcode" value={form.barcode} onChange={handleChange} />
              </div>
              <div>
                <label>Store</label>
                <select name="storeId" value={form.storeId} onChange={handleChange} required>
                  <option value="">Select store</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="section-label">Default variant</p>
            <div className="form-row form-row-3">
              <div>
                <label>SKU</label>
                <input name="variantSku" value={form.variantSku} onChange={handleChange} required />
              </div>
              <div>
                <label>Price</label>
                <input
                  type="number"
                  name="variantPrice"
                  value={form.variantPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label>Stock</label>
                <input
                  type="number"
                  name="variantStock"
                  value={form.variantStock}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Product" : "Create Product"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

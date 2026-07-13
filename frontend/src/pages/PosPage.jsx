import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    setReceipt(null);
    try {
      const res = await api.post('/orders', {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.qty,
          price: item.price,
        })),
        subtotal,
        tax,
        total,
      });
      setReceipt(res.data);
      setCart([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed. Try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>POS Terminal</h1>
      </div>

      <div className="pos-page">
        {/* Left: Product grid */}
        <div>
          <div className="pos-toolbar">
            <input
              className="pos-search"
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loader-wrap">
              <div className="spinner"></div>
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="muted-text">No products found.</p>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <button
                  key={product._id}
                  className="product-tile"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  <span className="tile-name">{product.name}</span>
                  <span className="tile-sku">{product.sku}</span>
                  <span className="tile-price">₹{product.price}</span>
                  <span className={`tile-stock ${product.stock === 0 ? 'out' : ''}`}>
                    {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Cart */}
        <div className="pos-cart">
          <h3>Current Sale</h3>

          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="muted-text">Cart is empty. Click a product to add it.</p>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item._id}>
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-sku">{item.sku}</span>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQty(item._id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item._id, 1)}>+</button>
                  </div>
                  <span className="cart-item-total">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item._id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <p className="total-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </p>
            <p className="total-row">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </p>
            <p className="total-row" style={{ fontWeight: 700, fontSize: '16px' }}>
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </p>

            <button
              className="primary-btn checkout-btn"
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkingOut}
            >
              {checkingOut ? 'Processing...' : 'Checkout'}
            </button>

            {receipt && (
              <div className="receipt">
                ✅ Order placed successfully! Order ID: {receipt._id || receipt.orderId}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
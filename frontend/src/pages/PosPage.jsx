import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    loadProducts('');
  }, []);

  // Debounced search: wait 350ms after typing stops before hitting the backend
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadProducts(search);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadProducts = async (searchTerm) => {
    setLoading(true);
    try {
      const params = searchTerm ? { search: searchTerm, limit: 50 } : { limit: 50 };
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const tiles = products.flatMap((product) =>
    (product.variants || []).map((variant) => ({
      key: variant.sku,
      productId: product._id,
      storeId: product.storeId,
      productName: product.name,
      variantLabel: [variant.size, variant.color].filter(Boolean).join(' / '),
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      image: product.images?.[0] || null,
    }))
  );

  const addToCart = (tile) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === tile.sku);
      if (existing) {
        return prev.map((item) =>
          item.sku === tile.sku ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...tile, qty: 1 }];
    });
  };

  const updateQty = (sku, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.sku === sku ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (sku) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    setReceipt(null);
    try {
      const storeId = cart[0].storeId;

      const res = await api.post('/orders', {
        storeId,
        paymentMethod: 'cash',
        items: cart.map((item) => ({
          productId: item.productId,
          variantSku: item.sku,
          quantity: item.qty,
          unitPrice: item.price,
          discount: 0,
          taxRate: 5,
        })),
      });
      setReceipt(res.data.order || res.data);
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
          ) : tiles.length === 0 ? (
            <p className="muted-text">No products found.</p>
          ) : (
            <div className="product-grid">
              {tiles.map((tile) => (
                <button
                  key={tile.key}
                  className="product-tile"
                  onClick={() => addToCart(tile)}
                  disabled={tile.stock === 0}
                >
                  {tile.image && (
                    <img
                      src={tile.image}
                      alt={tile.productName}
                      style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }}
                    />
                  )}
                  <span className="tile-name">{tile.productName}</span>
                  {tile.variantLabel && (
                    <span className="tile-sku">{tile.variantLabel}</span>
                  )}
                  <span className="tile-sku">{tile.sku}</span>
                  <span className="tile-price">₹{tile.price}</span>
                  <span className={`tile-stock ${tile.stock === 0 ? 'out' : ''}`}>
                    {tile.stock === 0 ? 'Out of stock' : `${tile.stock} in stock`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pos-cart">
          <h3>Current Sale</h3>

          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="muted-text">Cart is empty. Click a product to add it.</p>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.sku}>
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.productName}</span>
                    <span className="cart-item-sku">{item.sku}</span>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQty(item.sku, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.sku, 1)}>+</button>
                  </div>
                  <span className="cart-item-total">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>
                  <button className="cart-item-remove" onClick={() => removeItem(item.sku)}>
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
                ✅ Order placed successfully! Order ID: {receipt._id}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
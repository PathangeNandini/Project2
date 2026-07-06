import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import productApi from "../services/productApi";
import storeApi from "../services/storeApi";
import orderApi from "../services/orderApi";
import Loader from "../components/Loader";
import useAuthStore from "../store/authStore";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);

export default function POS() {
  const { user } = useAuthStore();
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState(user?.storeId || "");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [placing, setPlacing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  useEffect(() => {
    storeApi.getAll().then((d) => {
      setStores(d.stores || []);
      if (!storeId && d.stores?.length) setStoreId(d.stores[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!storeId) return;
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const loadProducts = async (params = {}) => {
    setLoadingProducts(true);
    try {
      const data = await productApi.getAll({ storeId, ...params });
      setProducts(data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(search ? { search } : {});
  };

  const addToCart = (product, variant) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === product._id && i.variantSku === variant.sku
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id && i.variantSku === variant.sku
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          productName: product.name,
          variantSku: variant.sku,
          unitPrice: variant.price ?? product.basePrice,
          quantity: 1,
          maxStock: variant.stock ?? 0,
        },
      ];
    });
  };

  const updateQuantity = (productId, variantSku, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId && i.variantSku === variantSku
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId, variantSku) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variantSku === variantSku)));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const handleCheckout = async () => {
    if (!storeId) {
      toast.error("Select a store first");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setPlacing(true);
    try {
      const data = await orderApi.checkout({
        storeId,
        paymentMethod,
        items: cart.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku,
          quantity: i.quantity,
        })),
      });
      toast.success(`Order ${data.order.orderNumber} placed!`);
      setLastReceipt(data.order);
      setCart([]);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="pos-page">
      <div className="pos-left">
        <div className="pos-toolbar">
          <select value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            {stores.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <form onSubmit={handleSearch} className="search-bar pos-search">
            <input
              type="text"
              placeholder="Search products or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        {loadingProducts ? (
          <Loader />
        ) : (
          <div className="product-grid">
            {products.length === 0 && <p className="muted-text">No products found for this store.</p>}
            {products.map((product) =>
              (product.variants?.length ? product.variants : [{ sku: "default", price: product.basePrice, stock: 0 }]).map(
                (variant) => (
                  <button
                    key={`${product._id}-${variant.sku}`}
                    className="product-tile"
                    onClick={() => addToCart(product, variant)}
                    disabled={variant.stock <= 0}
                  >
                    <span className="tile-name">{product.name}</span>
                    <span className="tile-sku">{variant.sku}</span>
                    <span className="tile-price">{currency(variant.price ?? product.basePrice)}</span>
                    <span className={`tile-stock ${variant.stock <= 0 ? "out" : ""}`}>
                      {variant.stock <= 0 ? "Out of stock" : `${variant.stock} in stock`}
                    </span>
                  </button>
                )
              )
            )}
          </div>
        )}
      </div>

      <div className="pos-cart">
        <h3>Cart</h3>
        <div className="cart-items">
          {cart.length === 0 && <p className="muted-text">Cart is empty. Tap a product to add it.</p>}
          {cart.map((item) => (
            <div className="cart-item" key={`${item.productId}-${item.variantSku}`}>
              <div className="cart-item-info">
                <span className="cart-item-name">{item.productName}</span>
                <span className="cart-item-sku">{item.variantSku}</span>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => updateQuantity(item.productId, item.variantSku, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.variantSku, 1)}>+</button>
              </div>
              <span className="cart-item-total">{currency(item.unitPrice * item.quantity)}</span>
              <button className="cart-item-remove" onClick={() => removeItem(item.productId, item.variantSku)}>
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <p className="total-row">
            <span>Subtotal</span>
            <span>{currency(subtotal)}</span>
          </p>

          <label>Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="digital_wallet">Digital Wallet</option>
          </select>

          <button className="primary-btn checkout-btn" onClick={handleCheckout} disabled={placing}>
            {placing ? "Processing..." : `Checkout ${currency(subtotal)}`}
          </button>
        </div>

        {lastReceipt && (
          <div className="receipt">
            <p>
              ✅ Order <strong>{lastReceipt.orderNumber}</strong> completed —{" "}
              {currency(lastReceipt.totalAmount)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Header from "./Header";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, purchases = [], logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview"); // overview | orders | wishlist | coupons | help | account
  const [wishlist, setWishlist] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [cards, setCards] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [language, setLanguage] = useState("en");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // edit profile form state (local/demo)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    try {
      const w = JSON.parse(localStorage.getItem("krushee_wishlist") || "[]");
      const c = JSON.parse(localStorage.getItem("krushee_coupons") || "[]");
      const cr = JSON.parse(localStorage.getItem("krushee_cards") || "[]");
      const a = JSON.parse(localStorage.getItem("krushee_addresses") || "[]");
      const lang = localStorage.getItem("krushee_lang") || "en";
      setWishlist(w);
      setCoupons(c);
      setCards(cr);
      setAddresses(a);
      setLanguage(lang);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (key, val, setter) => {
    localStorage.setItem(key, JSON.stringify(val));
    setter(val);
    window.dispatchEvent(new Event("storage"));
  };

  const addCard = (card) => {
    const next = [...cards, card];
    persist("krushee_cards", next, setCards);
  };
  const removeCard = (idx) => {
    const next = cards.filter((_, i) => i !== idx);
    persist("krushee_cards", next, setCards);
  };

  const addAddress = (addr) => {
    const next = [...addresses, addr];
    persist("krushee_addresses", next, setAddresses);
  };
  const removeAddress = (idx) => {
    const next = addresses.filter((_, i) => i !== idx);
    persist("krushee_addresses", next, setAddresses);
  };

  const removeWishlistItem = (idx) => {
    const next = wishlist.filter((_, i) => i !== idx);
    persist("krushee_wishlist", next, setWishlist);
  };

  const applyCoupon = (coupon) => {
    // demo: mark used (simple)
    const next = coupons.map((c) =>
      c.code === coupon.code ? { ...c, used: true } : c
    );
    persist("krushee_coupons", next, setCoupons);
  };

  const saveProfile = () => {
    // demo: persist locally and show message
    setSaveMsg("Profile saved (demo)");
    setTimeout(() => setSaveMsg(""), 2500);
    // real app: call API to update profile
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("krushee_lang", lang);
  };

  const downloadInvoicePDF = async (order) => {
    // ensure order is enriched (if raw order passed, enrich it first)
    const enriched = order._enrichedForInvoice ? order : await enrichOrderForInvoice(order);

    // Generate PDF content
    const invoiceHTML = await generateInvoiceHTML(enriched);

    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(invoiceHTML);
    doc.close();

    // Print the iframe content
    iframe.contentWindow.print();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const handleOpenInvoice = async (order) => {
    try {
      const enriched = order._enrichedForInvoice ? order : await enrichOrderForInvoice(order);
      setSelectedOrder(enriched);
      setShowInvoiceModal(true);
    } catch (e) {
      console.error('Failed to open invoice', e);
      setSelectedOrder(order);
      setShowInvoiceModal(true);
    }
  };

  const generateInvoiceHTML = async (order) => {
    const orderDate = new Date(order.orderDate || order.createdAt || order.date || Date.now());
    const invoiceNumber = `INV-${order.id || Date.now()}`;
    const paymentMethodLabel = order._paymentMethodLabel || order.paymentMethod || order.payment_method || 'N/A';
    const paymentStatusLabel = order._paymentStatusLabel || order.paymentStatus || order.payment_status || 'N/A';
    const orderStatusLabel = order._orderStatusLabel || order.status || order.orderStatus || 'Pending';
    const productCategory = order._productCategory || order.productCategory || order.category || order.productType || order.type || 'N/A';
    const unitPrice = order._unitPrice != null ? order._unitPrice : (order.unitPrice || order.price || 0);
    const totalPrice = order._totalPrice != null ? order._totalPrice : (order.totalPrice || order.amount || unitPrice * (order.quantity || 1));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #10b981; }
          .invoice-title { font-size: 20px; margin: 10px 0; }
          .invoice-info { margin: 20px 0; }
          .customer-info, .order-info { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 16px; color: #10b981; margin-bottom: 10px; }
          .info-row { margin: 5px 0; }
          .product-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .product-table th, .product-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .product-table th { background-color: #10b981; color: white; }
          .total-section { margin-top: 20px; text-align: right; }
          .total-amount { font-size: 18px; font-weight: bold; color: #10b981; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">🌾 KrusheeMart</div>
          <div>Agricultural Products & Equipment</div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="invoice-info">
          <div class="section-title">Invoice Details</div>
          <div class="info-row"><strong>Invoice Number:</strong> ${invoiceNumber}</div>
          <div class="info-row"><strong>Order Date:</strong> ${orderDate.toLocaleDateString()}</div>
          <div class="info-row"><strong>Order ID:</strong> ${order.id || 'N/A'}</div>
          <div class="info-row"><strong>Payment Method:</strong> ${paymentMethodLabel}</div>
          <div class="info-row"><strong>Payment Status:</strong> ${paymentStatusLabel}</div>
          <div class="info-row"><strong>Order Status:</strong> ${orderStatusLabel}</div>
          ${order.trackingNumber ? `<div class="info-row"><strong>Tracking Number:</strong> ${order.trackingNumber}</div>` : ''}
        </div>

        <div class="customer-info">
          <div class="section-title">Customer Information</div>
          <div class="info-row"><strong>Name:</strong> ${order.customerName || user?.name || 'N/A'}</div>
          <div class="info-row"><strong>Email:</strong> ${order.customerEmail || user?.email || 'N/A'}</div>
          ${order.customerPhone ? `<div class="info-row"><strong>Phone:</strong> ${order.customerPhone}</div>` : ''}
          ${order.customerAddress ? `<div class="info-row"><strong>Address:</strong> ${order.customerAddress}</div>` : ''}
        </div>

        <table class="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.productName || order._productName || 'N/A'}</td>
              <td>${productCategory}</td>
              <td>₹${unitPrice}</td>
              <td>${order.quantity || 1}</td>
              <td>₹${totalPrice}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-amount">Total Amount: ₹${totalPrice}</div>
        </div>

        ${order.notes ? `
        <div class="order-info">
          <div class="section-title">Notes</div>
          <div>${order.notes}</div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for choosing KrusheeMart!</p>
          <p>For any queries, please contact our support team.</p>
          <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
      </body>
      </html>
    `;
  };

  // helper: normalize/mapping for display labels
  const mapPaymentMethod = (m) => {
    console.log("🔍 Profile mapPaymentMethod input:", m);
    if (!m || m === '' || m === 'undefined') return 'Cash on Delivery';
    const s = String(m).toLowerCase().trim();
    if (s.includes('cod') || s.includes('cash_on_delivery') || s.includes('cash on delivery')) return 'Cash on Delivery';
    if (s.includes('upi')) return 'UPI';
    if (s.includes('card') || s.includes('credit') || s.includes('debit')) return 'Credit/Debit Card';
    if (s.includes('netbank') || s.includes('net') || s.includes('bank')) return 'Net Banking';
    console.log("🔍 Profile mapPaymentMethod returning as-is:", String(m));
    return String(m); // Return as-is if already proper format
  };

  const mapPaymentStatus = (st) => {
    console.log("🔍 Profile mapPaymentStatus input:", st);
    if (!st || st === '' || st === 'undefined') return 'Completed';
    const s = String(st).toLowerCase().trim();
    if (s.includes('paid') || s.includes('completed') || s.includes('complete') || s.includes('success')) return 'Completed';
    if (s.includes('pending')) return 'Pending';
    if (s.includes('fail') || s.includes('failed')) return 'Failed';
    console.log("🔍 Profile mapPaymentStatus returning as-is:", String(st));
    return String(st); // Return as-is if already proper format
  };

  const mapOrderStatus = (status, paymentStatusLabel) => {
    if (!status) {
      if (paymentStatusLabel && paymentStatusLabel.toLowerCase() === 'completed') return 'Completed';
      return 'Pending';
    }
    const s = String(status);
    if (s.toLowerCase() === 'pending' && paymentStatusLabel && paymentStatusLabel.toLowerCase() === 'completed') return 'Completed';
    return s;
  };

  // enrich order: fetch product doc if needed to obtain category/price
  const enrichOrderForInvoice = async (order) => {
    try {
      const copy = { ...order };
      
      // payment labels - use stored payment data
      const rawPayment = order.paymentMethod || order.payment_method || order.payment || (order.paymentInfo && order.paymentInfo.method) || 'Cash on Delivery';
      const rawPaymentStatus = order.paymentStatus || order.payment_status || order.status || order.statusText || 'Completed';
      
      console.log("🔍 Profile enrichOrderForInvoice - Payment data:", {
        orderId: order.id,
        rawPayment: rawPayment,
        rawPaymentStatus: rawPaymentStatus,
        orderFields: Object.keys(order)
      });
      
      const paymentMethodLabel = mapPaymentMethod(rawPayment);
      const paymentStatusLabel = mapPaymentStatus(rawPaymentStatus);
      const orderStatusLabel = mapOrderStatus(order.status || order.orderStatus || order.order_status || 'completed', paymentStatusLabel);

      copy._paymentMethodLabel = paymentMethodLabel;
      copy._paymentStatusLabel = paymentStatusLabel;
      copy._orderStatusLabel = orderStatusLabel;

      // product info
      let productCategory = order.productCategory || order.category || order.productType || order.type;
      let unitPrice = order.unitPrice || order.price;
      let productName = order.productName;

      const pid = order.productId || order.product_id || order.pid;
      if ((!productCategory || unitPrice == null || !productName) && pid) {
        try {
          const pd = await getDoc(doc(db, 'products', pid));
          if (pd && pd.exists()) {
            const pdata = pd.data();
            productCategory = productCategory || pdata.category || pdata.type || pdata.categoryName;
            unitPrice = unitPrice != null ? unitPrice : (pdata.price || pdata.unitPrice || pdata.mrp || 0);
            productName = productName || pdata.name || pdata.title;
          }
        } catch (e) {
          // ignore product fetch errors
          console.warn('Failed to fetch product for invoice enrichment', e);
        }
      }

      copy._productCategory = productCategory || 'N/A';
      copy._unitPrice = unitPrice != null ? unitPrice : 0;
      copy._productName = productName || copy.productName || 'N/A';
      copy._totalPrice = copy.totalPrice || copy.amount || copy._unitPrice * (copy.quantity || 1);
      copy._enrichedForInvoice = true;
      return copy;
    } catch (err) {
      console.error('enrichOrderForInvoice error', err);
      return order;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded shadow-sm text-sm"
          >
            ← Back
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-2xl">
                🌾
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  {user?.name || "Farmer"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || "-"}
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setTab("overview")}
                className={`w-full text-left px-3 py-2 rounded ${
                  tab === "overview"
                    ? "bg-emerald-50 font-medium"
                    : "hover:bg-gray-50"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setTab("orders")}
                className={`w-full text-left px-3 py-2 rounded ${
                  tab === "orders"
                    ? "bg-emerald-50 font-medium"
                    : "hover:bg-gray-50"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setTab("wishlist")}
                className={`w-full text-left px-3 py-2 rounded ${
                  tab === "wishlist"
                    ? "bg-emerald-50 font-medium"
                    : "hover:bg-gray-50"
                }`}
              >
                Wishlist
              </button>
              <button
                onClick={() => setTab("coupons")}
                className={`w-full text-left px-3 py-2 rounded ${
                  tab === "coupons"
                    ? "bg-emerald-50 font-medium"
                    : "hover:bg-gray-50"
                }`}
              >
                Coupons
              </button>
              <button
                onClick={() => setTab("help")}
                className={`w-full text-left px-3 py-2 rounded ${
                  tab === "help"
                    ? "bg-emerald-50 font-medium"
                    : "hover:bg-gray-50"
                }`}
              >
                Help Center
              </button>
              <button
                onClick={() => setTab("account")}
                className={`w-full text-left px-3 py-2 rounded ${
                  tab === "account"
                    ? "bg-emerald-50 font-medium"
                    : "hover:bg-gray-50"
                }`}
              >
                Account Settings
              </button>
              <button
                onClick={async () => {
                  await logout();
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-red-600 mt-3"
              >
                Logout
              </button>
            </nav>
          </aside>

          {/* Content */}
          <section className="lg:col-span-3 space-y-6">
            {tab === "overview" && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-3">Overview</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Welcome back, {user?.name || "Farmer"} — here are quick links
                  to manage your account.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/orders"
                    className="p-4 rounded border hover:shadow-sm"
                  >
                    <div className="font-medium">Orders</div>
                    <div className="text-sm text-gray-500">
                      {purchases.length} recent
                    </div>
                  </Link>
                  <button
                    onClick={() => setTab("wishlist")}
                    className="p-4 rounded border hover:shadow-sm text-left"
                  >
                    <div className="font-medium">Wishlist</div>
                    <div className="text-sm text-gray-500">
                      {wishlist.length} items
                    </div>
                  </button>
                  <button
                    onClick={() => setTab("account")}
                    className="p-4 rounded border hover:shadow-sm text-left"
                  >
                    <div className="font-medium">Account</div>
                    <div className="text-sm text-gray-500">
                      Manage profile & payment
                    </div>
                  </button>
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Orders</h2>
                {purchases.length === 0 ? (
                  <div className="text-gray-600">You have no orders yet.</div>
                ) : (
                  <ul className="space-y-3">
                    {purchases.map((o) => (
                      <li
                        key={o.id}
                        className="p-4 border rounded"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">
                              {o.productName || `Order #${o.id}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              Qty: {o.quantity} • ₹{o.totalPrice || o.amount}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Status: {o.paymentStatus || 'Completed'} 
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-sm text-gray-500">
                              {new Date(o.orderDate || o.date || Date.now()).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  await handleOpenInvoice(o);
                                }}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                View Invoice
                              </button>
                              <button
                                onClick={async () => await downloadInvoicePDF(o)}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Download PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === "wishlist" && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-gray-600">Your wishlist is empty.</div>
                ) : (
                  <ul className="space-y-3">
                    {wishlist.map((it, i) => (
                      <li
                        key={i}
                        className="p-3 border rounded flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-12 h-12 object-contain"
                            />
                          ) : null}
                          <div>
                            <div className="font-medium">{it.name}</div>
                            <div className="text-sm text-gray-500">
                              ₹{it.price}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeWishlistItem(i)}
                            className="text-red-500 px-3 py-1 rounded border"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => {
                              /* quick add to cart logic */ localStorage.setItem(
                                "krushee_cart",
                                JSON.stringify([
                                  ...JSON.parse(
                                    localStorage.getItem("krushee_cart") || "[]"
                                  ),
                                  {
                                    id: `wish-${i}`,
                                    name: it.name,
                                    image: it.image,
                                    price: it.price,
                                    qty: 1,
                                  },
                                ])
                              );
                              window.dispatchEvent(new Event("storage"));
                            }}
                            className="px-3 py-1 rounded bg-emerald-600 text-white"
                          >
                            Add to cart
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === "coupons" && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Coupons</h2>
                {coupons.length === 0 ? (
                  <div className="text-gray-600">No coupons available.</div>
                ) : (
                  <ul className="space-y-3">
                    {coupons.map((c, i) => (
                      <li
                        key={i}
                        className="p-3 border rounded flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{c.code}</div>
                          <div className="text-sm text-gray-500">{c.desc}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={c.used}
                            onClick={() => applyCoupon(c)}
                            className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50"
                          >
                            {c.used ? "Used" : "Apply"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {tab === "help" && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Help Center</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    <a className="hover:underline" href="/help/orders">
                      Orders & tracking
                    </a>
                  </li>
                  <li>
                    <a className="hover:underline" href="/help/returns">
                      Returns & refunds
                    </a>
                  </li>
                  <li>
                    <a className="hover:underline" href="/help/payments">
                      Payments & issues
                    </a>
                  </li>
                  <li>
                    <a className="hover:underline" href="/help/contact">
                      Contact support
                    </a>
                  </li>
                </ul>
              </div>
            )}

            {tab === "account" && (
              <div className="bg-white p-6 rounded-xl shadow space-y-6">
                <h2 className="text-lg font-semibold">Account Settings</h2>

                {/* Edit profile */}
                <div>
                  <h3 className="font-medium mb-2">Edit profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="p-2 border rounded"
                      placeholder="Full name"
                    />
                    <input
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="p-2 border rounded"
                      placeholder="Email"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={saveProfile}
                      className="px-4 py-2 bg-emerald-600 text-white rounded"
                    >
                      Save
                    </button>
                    {saveMsg && (
                      <div className="text-sm text-emerald-600">{saveMsg}</div>
                    )}
                  </div>
                </div>

                {/* Saved cards */}
                <div>
                  <h3 className="font-medium mb-2">
                    Saved credit / debit cards
                  </h3>
                  {cards.length === 0 ? (
                    <div className="text-gray-600">No saved cards.</div>
                  ) : (
                    <ul className="space-y-2">
                      {cards.map((c, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {c.brand || "Card"}
                            </div>
                            <div className="text-sm text-gray-500">
                              **** **** **** {c.last4}
                            </div>
                          </div>
                          <button
                            onClick={() => removeCard(i)}
                            className="text-red-500 px-3 py-1 rounded border"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* quick add (demo) */}
                  <AddCardForm onAdd={(c) => addCard(c)} />
                </div>

                {/* Saved addresses */}
                <div>
                  <h3 className="font-medium mb-2">Saved addresses</h3>
                  {addresses.length === 0 ? (
                    <div className="text-gray-600">No saved addresses.</div>
                  ) : (
                    <ul className="space-y-2">
                      {addresses.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {a.label || `Address ${i + 1}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {a.line}
                            </div>
                          </div>
                          <button
                            onClick={() => removeAddress(i)}
                            className="text-red-500 px-3 py-1 rounded border"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <AddAddressForm onAdd={(a) => addAddress(a)} />
                </div>

                {/* Language */}
                <div>
                  <h3 className="font-medium mb-2">Language</h3>
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="mr">मराठी</option>
                    <option value="kn">ಕನ್ನಡ</option>
                  </select>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowInvoiceModal(false)}
          />
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Invoice Details</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              {/* Header */}
              <div className="text-center border-b-2 border-emerald-500 pb-4 mb-6">
                <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-2">
                  🌾 KrusheeMart
                </div>
                <div className="text-gray-600">Agricultural Products & Equipment</div>
                <div className="text-lg font-semibold mt-2">INVOICE</div>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-emerald-600 mb-3">Invoice Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Invoice Number:</strong> INV-{selectedOrder.id || Date.now()}</div>
                    <div><strong>Order Date:</strong> {new Date(selectedOrder.orderDate || selectedOrder.createdAt || selectedOrder.date || Date.now()).toLocaleDateString()}</div>
                    <div><strong>Order ID:</strong> {selectedOrder.id || 'N/A'}</div>
                    <div><strong>Payment Method:</strong> {selectedOrder._paymentMethodLabel || selectedOrder.paymentMethod || 'N/A'}</div>
                    <div><strong>Payment Status:</strong> {selectedOrder._paymentStatusLabel || selectedOrder.paymentStatus || 'N/A'}</div>
                    <div><strong>Order Status:</strong> {selectedOrder._orderStatusLabel || selectedOrder.status || 'Pending'}</div>
                    {selectedOrder.trackingNumber && (
                      <div><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-emerald-600 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedOrder.customerName || user?.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedOrder.customerEmail || user?.email || 'N/A'}</div>
                    {selectedOrder.customerPhone && (
                      <div><strong>Phone:</strong> {selectedOrder.customerPhone}</div>
                    )}
                    {selectedOrder.customerAddress && (
                      <div><strong>Address:</strong> {selectedOrder.customerAddress}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-emerald-600 mb-3">Product Details</h4>
                <div className="bg-white rounded border">
                  <table className="w-full">
                    <thead className="bg-emerald-500 text-white">
                      <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">{selectedOrder._productName || selectedOrder.productName || 'N/A'}</td>
                        <td className="p-3">{selectedOrder._productCategory || selectedOrder.productType || selectedOrder.type || 'N/A'}</td>
                        <td className="p-3 text-right">₹{selectedOrder._unitPrice != null ? selectedOrder._unitPrice : (selectedOrder.unitPrice || selectedOrder.price || 0)}</td>
                        <td className="p-3 text-right">{selectedOrder.quantity || 1}</td>
                        <td className="p-3 text-right font-semibold">₹{selectedOrder._totalPrice != null ? selectedOrder._totalPrice : (selectedOrder.totalPrice || selectedOrder.amount || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="text-right mb-6">
                <div className="text-xl font-bold text-emerald-600">
                  Total Amount: ₹{selectedOrder.totalPrice || selectedOrder.amount || 0}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-emerald-600 mb-3">Notes</h4>
                  <div className="bg-white p-3 rounded border text-sm">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 border-t pt-4">
                <p>Thank you for choosing KrusheeMart!</p>
                <p>For any queries, please contact our support team.</p>
                <p className="mt-2">Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await downloadInvoicePDF(selectedOrder);
                  setShowInvoiceModal(false);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Small helper components for forms (kept in same file for brevity) */
function AddCardForm({ onAdd }) {
  const [brand, setBrand] = useState("");
  const [last4, setLast4] = useState("");
  return (
    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
      <input
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Brand (Visa)"
        className="p-2 border rounded col-span-1"
      />
      <input
        value={last4}
        onChange={(e) => setLast4(e.target.value)}
        placeholder="Last 4 digits"
        className="p-2 border rounded col-span-1"
      />
      <button
        onClick={() => {
          if (!last4) return;
          onAdd({ brand, last4 });
          setBrand("");
          setLast4("");
        }}
        className="px-3 py-2 bg-emerald-600 text-white rounded col-span-1"
      >
        Add card
      </button>
    </div>
  );
}

function AddAddressForm({ onAdd }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    label: "Home",
    name: "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    type: "home", // home | work | other
  });

  const setField = (k) => (e) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const saveLocalAndNotify = (addr) => {
    try {
      const cur = JSON.parse(localStorage.getItem("krushee_addresses") || "[]");
      const next = [...cur, addr];
      localStorage.setItem("krushee_addresses", JSON.stringify(next));
      window.dispatchEvent(new Event("storage"));
      onAdd && onAdd(addr);
    } catch (e) {
      console.error("persist address failed", e);
    }
  };

  const handleSave = async () => {
    setError("");
    // basic validation
    if (
      !form.name ||
      !form.phone ||
      !form.house ||
      !form.city ||
      !form.pincode
    ) {
      setError(
        "Please fill required fields: name, phone, house, city, pincode."
      );
      return;
    }
    setLoading(true);
    const payload = {
      label: form.label,
      name: form.name,
      phone: form.phone,
      line: `${form.house}, ${form.street ? form.street + "," : ""} ${
        form.city
      } - ${form.pincode}`,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      landmark: form.landmark,
      type: form.type,
      createdAt: new Date().toISOString(),
    };

    try {
      // Try saving to backend (if available)
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        // server may return saved object
        const saved = data?.address || payload;
        saveLocalAndNotify(saved);
      } else {
        // fallback: persist locally
        saveLocalAndNotify(payload);
      }
      setOpen(false);
      // reset form
      setForm({
        label: "Home",
        name: "",
        phone: "",
        house: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        type: "home",
      });
    } catch (e) {
      // network error -> persist locally but show message
      console.warn("address save failed, persisting locally", e);
      saveLocalAndNotify(payload);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-3">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md"
        >
          Add address
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add delivery address</h3>
              <button
                onClick={() => !loading && setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Label (Home/Work)"
                value={form.label}
                onChange={setField("label")}
                className="p-2 border rounded"
              />
              <select
                value={form.type}
                onChange={setField("type")}
                className="p-2 border rounded"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>

              <input
                placeholder="Full name"
                value={form.name}
                onChange={setField("name")}
                className="p-2 border rounded"
              />
              <input
                placeholder="Phone number"
                value={form.phone}
                onChange={setField("phone")}
                className="p-2 border rounded"
              />

              <input
                placeholder="House / Flat No."
                value={form.house}
                onChange={setField("house")}
                className="p-2 border rounded"
              />
              <input
                placeholder="Street / Locality"
                value={form.street}
                onChange={setField("street")}
                className="p-2 border rounded"
              />

              <input
                placeholder="City"
                value={form.city}
                onChange={setField("city")}
                className="p-2 border rounded"
              />
              <input
                placeholder="State"
                value={form.state}
                onChange={setField("state")}
                className="p-2 border rounded"
              />

              <input
                placeholder="Pincode"
                value={form.pincode}
                onChange={setField("pincode")}
                className="p-2 border rounded"
              />
              <input
                placeholder="Landmark (optional)"
                value={form.landmark}
                onChange={setField("landmark")}
                className="p-2 border rounded"
              />
            </div>

            {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded"
              >
                {loading ? "Saving..." : "Save address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

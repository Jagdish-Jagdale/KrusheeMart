import React, { useState, useMemo } from "react";
import Header from "./Header";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function readCart() {
  try {
    const raw = localStorage.getItem("krushee_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, purchaseProduct } = useAuth
  ();
  const single = location.state?.product;
  const cart = readCart();
  const items = useMemo(
    () => (single ? [{ ...single, qty: 1 }] : cart),
    [single, cart]
  );

  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ cardNumber: "", cardName: "", upi: "" });
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const subtotal = items.reduce(
    (s, it) => s + (it.price || 0) * (it.qty || 0),
    0
  );

  const onPay = async () => {
    setError("");
    console.log("🔄 Payment: Starting payment process...");
    console.log("👤 Payment: User status:", user ? `Logged in as ${user.email}` : "NOT LOGGED IN");
    console.log("🛒 Payment: Items to purchase:", items);
    
    if (!items.length) {
      console.error("❌ Payment: No items in cart");
      setError("No items to pay for.");
      return;
    }
    if (!user) {
      console.error("❌ Payment: User not logged in, redirecting to login");
      navigate("/login", { state: { redirectTo: "/payment" } });
      return;
    }
    
    console.log("✅ Payment: Pre-checks passed, starting purchase...");
    setProcessing(true);
    setTimeout(async () => {
      try {
        console.log("🔄 Payment: Starting purchase process for items:", items);
        
        for (const it of items) {
          console.log("🔄 Payment: Processing purchase for item:", it);
          try {
            const additionalData = {
              paymentMethod: method === "card" ? "Credit/Debit Card" : 
                           method === "upi" ? "UPI" : 
                           "Cash on Delivery",
              paymentStatus: method === "cod" ? "Pending" : "Completed",
              customerAddress: user?.address || '',
              productType: it.category || 'product'
            };
            
            await purchaseProduct(it.id, it.qty || 1, additionalData);
            console.log("✅ Payment: Successfully purchased item:", it.id);
          } catch (itemError) {
            console.error("💥 Payment: Error purchasing item:", it.id, itemError);
            throw itemError;
          }
        }
        
        console.log("🎉 Payment: All items purchased successfully");
        localStorage.removeItem("krushee_cart");
        window.dispatchEvent(new Event("storage"));
        setShowSuccess(true);
      } catch (err) {
        console.error("💥 Payment: Purchase error:", err);
        console.error("💥 Payment: Error details:", err.message, err.stack);
        setError(`Failed to complete order: ${err.message}`);
      } finally {
        setProcessing(false);
      }
    }, 1200);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm inline-flex items-center gap-2 px-3 py-2 bg-white border rounded shadow-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Payment</h1>
          <div className="ml-auto text-sm text-gray-600">
            {items.length} item(s)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-4">Choose payment method</h2>

            <div className="space-y-3">
              <div
                className={`p-3 rounded-lg border ${
                  method === "card"
                    ? "border-emerald-300 bg-emerald-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setMethod("card")}
              >
                <div className="font-medium">Card</div>
                {method === "card" && (
                  <div className="mt-3">
                    <input
                      className="w-full p-2 mb-2 border rounded"
                      placeholder="Card number"
                      value={form.cardNumber}
                      onChange={(e) =>
                        setForm({ ...form, cardNumber: e.target.value })
                      }
                    />
                    <input
                      className="w-full p-2 border rounded"
                      placeholder="Name on card"
                      value={form.cardName}
                      onChange={(e) =>
                        setForm({ ...form, cardName: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  method === "upi"
                    ? "border-emerald-300 bg-emerald-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setMethod("upi")}
              >
                <div className="font-medium">UPI</div>
                {method === "upi" && (
                  <input
                    className="w-full p-2 mt-3 border rounded"
                    placeholder="example@bank"
                    value={form.upi}
                    onChange={(e) => setForm({ ...form, upi: e.target.value })}
                  />
                )}
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  method === "cod"
                    ? "border-emerald-300 bg-emerald-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setMethod("cod")}
              >
                <div className="font-medium">Cash on delivery</div>
              </div>

              {error && (
                <div className="text-sm text-red-600 mt-2">{error}</div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onPay}
                  disabled={processing}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-md disabled:opacity-60"
                >
                  {processing
                    ? "Processing..."
                    : method === "cod"
                    ? "Place order (COD)"
                    : "Pay now"}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>

          <aside className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Order summary</h3>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">Qty {it.qty}</div>
                  </div>
                  <div className="font-semibold">
                    ₹{((it.price || 0) * (it.qty || 0)).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
          </aside>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleSuccessClose}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center z-[10000] animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Purchase Successful!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Your order has been placed successfully. Thank you for shopping
              with us!
            </p>
            <button
              onClick={handleSuccessClose}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

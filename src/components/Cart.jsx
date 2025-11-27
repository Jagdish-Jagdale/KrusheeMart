import React, { useEffect, useState, useMemo } from "react";
import Header from "./Header";
import { FiTrash2, FiPlus, FiMinus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

function readCart() {
  try {
    const raw = localStorage.getItem("krushee_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeCart(arr) {
  try {
    localStorage.setItem("krushee_cart", JSON.stringify(arr));
    window.dispatchEvent(new Event("storage"));
  } catch {}
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(readCart());
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressToEditIdx, setAddressToEditIdx] = useState(null);

  useEffect(() => {
    setCart(readCart());
    try {
      setAddresses(
        JSON.parse(localStorage.getItem("krushee_addresses") || "[]")
      );
    } catch {
      setAddresses([]);
    }
    try {
      setCoupons(JSON.parse(localStorage.getItem("krushee_coupons") || "[]"));
    } catch {
      setCoupons([]);
    }
  }, []);

  const changeQty = (id, delta) => {
    const next = cart
      .map((it) =>
        it.id === id ? { ...it, qty: Math.max(0, (it.qty || 0) + delta) } : it
      )
      .filter((it) => it.qty > 0);
    writeCart(next);
    setCart(next);
  };

  const removeItem = (id) => {
    const next = cart.filter((it) => it.id !== id);
    writeCart(next);
    setCart(next);
  };

  const saveForLater = (idx) => {
    try {
      const wishRaw = localStorage.getItem("krushee_wishlist") || "[]";
      const wish = JSON.parse(wishRaw);
      const item = cart[idx];
      wish.push({
        name: item.name,
        image: item.image,
        price: item.price,
        mrp: item.mrp,
      });
      localStorage.setItem("krushee_wishlist", JSON.stringify(wish));
      // remove from cart
      const next = cart.filter((_, i) => i !== idx);
      writeCart(next);
      setCart(next);
    } catch (e) {
      console.error(e);
    }
  };

  const clearCart = () => {
    writeCart([]);
    setCart([]);
  };

  const buyNow = (item) => {
    // normalize id number if stored as prod-1 or fert-1
    let numericId = null;
    if (typeof item.id === "string") {
      const m = item.id.match(/(\d+)$/);
      if (m) numericId = parseInt(m[1], 10);
    } else numericId = item.id;
    navigate("/payment", {
      state: { product: { id: numericId, name: item.name, price: item.price } },
    });
  };

  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0),
    [cart]
  );
  const mrpTotal = useMemo(
    () =>
      cart.reduce((s, it) => s + (it.mrp || it.price || 0) * (it.qty || 0), 0),
    [cart]
  );
  const qtyCount = useMemo(
    () => cart.reduce((s, it) => s + (it.qty || 0), 0),
    [cart]
  );
  const autoCoupon = coupons && coupons.length ? coupons[0] : null;
  const couponValue = appliedCoupon ? appliedCoupon.value || 0 : 0;
  const discount = mrpTotal - subtotal + couponValue; // mrp diff + coupon (coupon.value should be negative or positive? treat as additional discount)
  const totalAmount = Math.max(
    0,
    subtotal - (appliedCoupon ? appliedCoupon.value || 0 : 0)
  );
  const youSave = mrpTotal - totalAmount;

  // open modal to add or edit address
  const openAddressModal = (editIdx = null) => {
    setAddressToEditIdx(editIdx);
    setAddressModalOpen(true);
  };

  // handle address saved from modal
  const handleAddressSaved = (savedAddr, editIdx = null) => {
    try {
      const cur = JSON.parse(localStorage.getItem("krushee_addresses") || "[]");
      let next;
      if (editIdx != null && cur[editIdx]) {
        cur[editIdx] = savedAddr;
        next = cur;
      } else {
        next = [...cur, savedAddr];
      }
      localStorage.setItem("krushee_addresses", JSON.stringify(next));
      setAddresses(next);
      // select the new/edited address
      setSelectedAddressIdx(editIdx != null ? editIdx : next.length - 1);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
    setAddressModalOpen(false);
    setAddressToEditIdx(null);
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

        {/* Delivery address row */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="text-sm text-gray-500">Deliver to</div>
            {addresses && addresses.length > 0 ? (
              <div className="font-semibold">
                {addresses[selectedAddressIdx].label || "Home"} —{" "}
                {addresses[selectedAddressIdx].line}
                <div className="text-sm text-gray-500 mt-1">
                  {addresses[selectedAddressIdx].name} •{" "}
                  {addresses[selectedAddressIdx].phone}
                </div>
              </div>
            ) : (
              <div className="font-semibold text-gray-700">
                No address saved
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() =>
                openAddressModal(
                  selectedAddressIdx >= 0 && addresses[selectedAddressIdx]
                    ? selectedAddressIdx
                    : null
                )
              }
              className="px-4 py-2 border rounded-md text-sm"
            >
              Change
            </button>
            <button
              onClick={() => openAddressModal(null)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm"
            >
              Add Address
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products list (cards) */}
          <section className="lg:col-span-2 space-y-4">
            {cart.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow text-center">
                <div className="text-4xl mb-3">🛒</div>
                <h3 className="font-semibold mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add items from the catalog to checkout.
                </p>
                <Link
                  to="/"
                  className="inline-block px-5 py-2 bg-emerald-600 text-white rounded-md"
                >
                  Shop now
                </Link>
              </div>
            ) : (
              cart.map((it, idx) => {
                const expectedDelivery = new Date();
                expectedDelivery.setDate(expectedDelivery.getDate() + 3);
                const expectedStr = expectedDelivery.toLocaleDateString();
                return (
                  <article
                    key={it.id}
                    className="bg-white p-4 rounded-xl shadow flex gap-4 hover:shadow-lg transition"
                  >
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-28 h-28 object-contain rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-gray-800">
                          {it.name}
                        </h3>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 line-through">
                            ₹{(it.mrp || it.price).toFixed(0)}
                          </div>
                          <div className="text-lg font-bold text-emerald-600">
                            ₹{(it.price || 0).toFixed(0)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                        <div className="px-2 py-1 bg-amber-100 rounded text-amber-700">
                          ⭐ 4.5
                        </div>
                        <div>•</div>
                        <div>
                          Expected delivery:{" "}
                          <span className="text-gray-700 font-medium">
                            {expectedStr}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => removeItem(it.id)}
                          className="px-3 py-1 border rounded text-sm text-red-600"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => saveForLater(idx)}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          Save for later
                        </button>
                        <button
                          onClick={() => buyNow(it)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-sm"
                        >
                          Buy now
                        </button>

                        {/* qty controls */}
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => changeQty(it.id, -1)}
                            className="p-2 bg-white border rounded"
                          >
                            <FiMinus />
                          </button>
                          <div className="px-3 py-1 border rounded text-sm">
                            {it.qty}
                          </div>
                          <button
                            onClick={() => changeQty(it.id, 1)}
                            className="p-2 bg-white border rounded"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>

          {/* Price details card */}
          <aside className="bg-white p-6 rounded-xl shadow sticky top-24">
            <h4 className="text-lg font-semibold mb-4">Price details</h4>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Price ({qtyCount} items)</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-emerald-600">
                  - ₹{(mrpTotal - subtotal).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm">Coupon for you</div>
                  <div className="text-xs text-gray-500">
                    {autoCoupon
                      ? autoCoupon.code + " — " + (autoCoupon.desc || "")
                      : "No coupons available"}
                  </div>
                </div>
                {autoCoupon ? (
                  <button
                    onClick={() => {
                      if (
                        appliedCoupon &&
                        appliedCoupon.code === autoCoupon.code
                      ) {
                        setAppliedCoupon(null);
                      } else {
                        setAppliedCoupon(autoCoupon);
                      }
                    }}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    {appliedCoupon && appliedCoupon.code === autoCoupon.code
                      ? "Remove"
                      : "Apply"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="border-t my-4" />

            <div className="flex justify-between font-bold text-lg">
              <div>Total amount</div>
              <div>₹{totalAmount.toFixed(0)}</div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              You will save{" "}
              <span className="font-semibold">₹{youSave.toFixed(0)}</span> on
              this order
            </div>

            <button
              onClick={() => navigate("/payment")}
              disabled={cart.length === 0}
              className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-md disabled:opacity-60"
            >
              Proceed to payment
            </button>

            <button
              onClick={clearCart}
              className="w-full mt-3 py-2 border rounded-md text-gray-700"
            >
              Clear cart
            </button>
          </aside>
        </div>
      </main>

      {/* Address modal */}
      {addressModalOpen && (
        <AddressModal
          initial={
            addressToEditIdx != null ? addresses[addressToEditIdx] : null
          }
          onClose={() => {
            setAddressModalOpen(false);
            setAddressToEditIdx(null);
          }}
          onSave={(addr) => handleAddressSaved(addr, addressToEditIdx)}
        />
      )}
    </div>
  );
}

/* Address Modal Component */
function AddressModal({ initial = null, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => ({
    label: initial?.label || "Home",
    name: initial?.name || "",
    phone: initial?.phone || "",
    house: initial?.house || "",
    street: initial?.street || "",
    city: initial?.city || "",
    state: initial?.state || "",
    pincode: initial?.pincode || "",
    landmark: initial?.landmark || "",
    type: initial?.type || "home",
  }));

  useEffect(() => {
    setForm({
      label: initial?.label || "Home",
      name: initial?.name || "",
      phone: initial?.phone || "",
      house: initial?.house || "",
      street: initial?.street || "",
      city: initial?.city || "",
      state: initial?.state || "",
      pincode: initial?.pincode || "",
      landmark: initial?.landmark || "",
      type: initial?.type || "home",
    });
  }, [initial]);

  const setField = (k) => (e) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const saveLocalAndNotify = (addr) => {
    try {
      const cur = JSON.parse(localStorage.getItem("krushee_addresses") || "[]");
      // if editing, replace by matching line/name maybe; parent will pass index for edit
      // parent handles persistence with index — here just return payload
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("persist address failed", e);
    }
  };

  const handleSave = async () => {
    setError("");
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
      house: form.house,
      street: form.street,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      landmark: form.landmark,
      type: form.type,
      line: `${form.house}${form.street ? ", " + form.street : ""}, ${
        form.city
      } - ${form.pincode}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const saved = data?.address || payload;
        // persist locally as fallback
        const cur = JSON.parse(
          localStorage.getItem("krushee_addresses") || "[]"
        );
        // if editing (initial exists), try to replace existing by line match
        if (initial) {
          const idx = cur.findIndex(
            (a) => a.line === initial.line && a.name === initial.name
          );
          if (idx >= 0) cur[idx] = saved;
          else cur.push(saved);
        } else {
          cur.push(saved);
        }
        localStorage.setItem("krushee_addresses", JSON.stringify(cur));
        window.dispatchEvent(new Event("storage"));
        onSave(saved);
      } else {
        // fallback persist locally
        const cur = JSON.parse(
          localStorage.getItem("krushee_addresses") || "[]"
        );
        if (initial) {
          const idx = cur.findIndex(
            (a) => a.line === initial.line && a.name === initial.name
          );
          if (idx >= 0) cur[idx] = payload;
          else cur.push(payload);
        } else {
          cur.push(payload);
        }
        localStorage.setItem("krushee_addresses", JSON.stringify(cur));
        window.dispatchEvent(new Event("storage"));
        onSave(payload);
      }
    } catch (e) {
      // network error -> persist locally
      const cur = JSON.parse(localStorage.getItem("krushee_addresses") || "[]");
      if (initial) {
        const idx = cur.findIndex(
          (a) => a.line === initial.line && a.name === initial.name
        );
        if (idx >= 0) cur[idx] = payload;
        else cur.push(payload);
      } else {
        cur.push(payload);
      }
      localStorage.setItem("krushee_addresses", JSON.stringify(cur));
      window.dispatchEvent(new Event("storage"));
      onSave(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {initial ? "Edit address" : "Add delivery address"}
          </h3>
          <button
            onClick={() => !loading && onClose()}
            className="text-gray-500 hover:text-gray-700 text-2xl"
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
            onClick={() => onClose()}
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
  );
}

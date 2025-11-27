import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Reports() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [prodSnap, userSnap, purchSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "purchases")),
        ]);
        if (!mounted) return;
        const prods = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const usrsAll = userSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const usrs = usrsAll.filter((u) => u.role !== "admin");
        const purch = purchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(prods);
        setUsers(usrs);
        setPurchases(purch);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const totalProducts = products.length;
  const totalCustomers = users.length;
  const totalRevenue = useMemo(
    () => purchases.reduce((a, p) => a + Number(p.totalPrice || 0), 0),
    [purchases]
  );
  const totalDeliveries = purchases.length;

  const productsById = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const lastDays = 30;
  const dailyRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: lastDays }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (lastDays - 1 - i));
      return d;
    });
    const fmt = (d) => d.toISOString().slice(0, 10);
    const map = Object.fromEntries(days.map((d) => [fmt(d), 0]));
    purchases.forEach((p) => {
      let dt = p.purchaseDate;
      if (dt && typeof dt.toDate === "function") dt = dt.toDate();
      else if (dt) dt = new Date(dt);
      if (!dt || Number.isNaN(dt.getTime())) return;
      const k = fmt(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()));
      if (map[k] === undefined) return;
      map[k] += Number(p.totalPrice || 0);
    });
    const labels = days.map((d) =>
      d.toLocaleDateString(undefined, { day: "numeric", month: "short" })
    );
    const values = days.map((d) => map[fmt(d)] || 0);
    return { labels, values };
  }, [purchases]);

  const maxLine = Math.max(...dailyRevenue.values, 1);
  const lineStep = 12;
  const lineHeight = 120;
  const lineWidth = dailyRevenue.values.length * lineStep;
  const linePoints = dailyRevenue.values
    .map((v, i) => {
      const x = i * lineStep;
      const y = lineHeight - Math.round((v / maxLine) * 100);
      return `${x},${y}`;
    })
    .join(" ");

  const categoryRevenue = useMemo(() => {
    const m = new Map();
    purchases.forEach((p) => {
      const prod = productsById.get(p.productId);
      const cat = prod?.category || "Unknown";
      const v = Number(p.totalPrice || 0);
      m.set(cat, (m.get(cat) || 0) + v);
    });
    const entries = Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((a, [, v]) => a + v, 0);
    return { entries, total };
  }, [purchases, productsById]);

  const pieColors = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#06b6d4",
    "#10b981",
    "#f97316",
  ];
  const pieGradient = useMemo(() => {
    if (!categoryRevenue.total) return "conic-gradient(#e5e7eb 0 100%)";
    let acc = 0;
    const parts = categoryRevenue.entries.map(([_, v], i) => {
      const start = (acc / categoryRevenue.total) * 100;
      acc += v;
      const end = (acc / categoryRevenue.total) * 100;
      const color = pieColors[i % pieColors.length];
      return `${color} ${start}% ${end}%`;
    });
    return `conic-gradient(${parts.join(", ")})`;
  }, [categoryRevenue]);

  const nameByUserId = useMemo(() => {
    const m = new Map();
    users.forEach((u) => {
      m.set(u.id, u.name || u.email || u.uid || "User");
      if (u.uid) m.set(u.uid, u.name || u.email || u.uid);
    });
    return m;
  }, [users]);

  const exportCSV = () => {
    const rows = purchases.map((p) => {
      let dt = p.purchaseDate;
      if (dt && typeof dt.toDate === "function") dt = dt.toDate();
      else if (dt) dt = new Date(dt);
      const dateStr = dt && !Number.isNaN(dt.getTime()) ? dt.toISOString() : "";
      const prod = productsById.get(p.productId);
      const userName = nameByUserId.get(p.userId) || p.userId || "";
      const productName = p.productName || prod?.name || "Unknown Product";
      return [
        dateStr,
        p.userId || "",
        userName,
        p.productId || "",
        productName,
        String(p.quantity ?? ""),
        String(p.totalPrice ?? ""),
      ];
    });
    const header = [
      "date",
      "userId",
      "userName",
      "productId",
      "productName",
      "quantity",
      "totalPrice",
    ];
    const escape = (v) => {
      const s = String(v ?? "");
      if (/[",\n]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
      return s;
    };
    const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krushee-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const recentPurchases = useMemo(() => {
    const arr = purchases.slice();
    arr.sort((a, b) => {
      const ad = a.purchaseDate?.toDate ? a.purchaseDate.toDate() : new Date(a.purchaseDate || 0);
      const bd = b.purchaseDate?.toDate ? b.purchaseDate.toDate() : new Date(b.purchaseDate || 0);
      return (bd?.getTime?.() || 0) - (ad?.getTime?.() || 0);
    });
    return arr.slice(0, 10);
  }, [purchases]);

  return (
    <div className="animate-fade-in space-y-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Reports</h1>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-blue-500 border border-slate-100 hover:shadow-lg hover:border-blue-400 hover:shadow-blue-400/20 transition-all duration-300 cursor-pointer">
          <div className="text-sm text-slate-500">Total Products</div>
          <div className="text-2xl font-bold mt-2">{totalProducts}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-green-500 border border-slate-100 hover:shadow-lg hover:border-green-400 hover:shadow-green-400/20 transition-all duration-300 cursor-pointer">
          <div className="text-sm text-slate-500">Total Customers</div>
          <div className="text-2xl font-bold mt-2">{totalCustomers}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-purple-500 border border-slate-100 hover:shadow-lg hover:border-purple-400 hover:shadow-purple-400/20 transition-all duration-300 cursor-pointer">
          <div className="text-sm text-slate-500">Total Revenue</div>
          <div className="text-2xl font-bold mt-2">₹{Number(totalRevenue || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-orange-500 border border-slate-100 hover:shadow-lg hover:border-orange-400 hover:shadow-orange-400/20 transition-all duration-300 cursor-pointer">
          <div className="text-sm text-slate-500">Total Deliveries</div>
          <div className="text-2xl font-bold mt-2">{totalDeliveries}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-green-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Revenue Trend (Last 30 days)</h2>
            <div className="text-sm text-slate-500">₹{dailyRevenue.values.reduce((a, b) => a + b, 0).toLocaleString()}</div>
          </div>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${lineWidth} ${lineHeight + 20}`}
              className="w-full h-40"
              style={{ minWidth: lineWidth }}
            >
              {dailyRevenue.values.map((_, i) => (
                <line
                  key={i}
                  x1={i * lineStep}
                  x2={i * lineStep}
                  y1={0}
                  y2={lineHeight}
                  stroke="#f1f5f9"
                />
              ))}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                points={linePoints}
              />
              {dailyRevenue.labels.map((lab, i) =>
                i % 3 === 0 ? (
                  <text
                    key={lab + i}
                    x={i * lineStep}
                    y={lineHeight + 14}
                    fontSize="11"
                    fill="#666"
                  >
                    {lab}
                  </text>
                ) : null
              )}
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-green-50">
          <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full" style={{ background: pieGradient }}>
              <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-slate-500">Total</div>
                  <div className="text-base md:text-lg font-bold">₹{Number(categoryRevenue.total || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <ul className="space-y-2">
                {categoryRevenue.entries.map(([name, val], i) => {
                  const pct = categoryRevenue.total ? Math.round((val / categoryRevenue.total) * 100) : 0;
                  const color = pieColors[i % pieColors.length];
                  return (
                    <li key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-sm text-slate-700">{name}</span>
                      </div>
                      <div className="text-sm text-slate-700">₹{Number(val).toLocaleString()} ({pct}%)</div>
                    </li>
                  );
                })}
                {categoryRevenue.entries.length === 0 && (
                  <li className="text-sm text-slate-400">No data</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-50">
        <h2 className="text-lg font-semibold mb-4">Recent Purchases</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-blue-600 bg-blue-50">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map((p) => {
                let dt = p.purchaseDate;
                if (dt && typeof dt.toDate === "function") {
                  dt = dt.toDate();
                } else if (dt) {
                  dt = new Date(dt);
                }
                const dStr = dt && !Number.isNaN(dt.getTime()) 
                  ? dt.toLocaleDateString() + " " + dt.toLocaleTimeString()
                  : "N/A";
                const prod = productsById.get(p.productId);
                const productName = p.productName || prod?.name || "Unknown Product";
                const userName = nameByUserId.get(p.userId) || p.userId || "Unknown User";
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="px-4 py-2 text-sm">{dStr}</td>
                    <td className="px-4 py-2">{userName}</td>
                    <td className="px-4 py-2 text-black">{productName}</td>
                    <td className="px-4 py-2">{p.quantity}</td>
                    <td className="px-4 py-2 text-black">₹{Number(p.totalPrice || 0).toLocaleString()}</td>
                  </tr>
                );
              })}
              {recentPurchases.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-400">No purchases found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-slate-200">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-slate-800">Loading Reports...</div>
            <div className="text-sm text-slate-500">Fetching data from database</div>
          </div>
        </div>
      )}
    </div>
  );
}


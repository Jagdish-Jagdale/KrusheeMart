import React, { useMemo, useState, useEffect } from "react";
import { FiAlertCircle, FiBell, FiTrendingUp } from "react-icons/fi";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
  query,
} from "firebase/firestore";

// Default empty data
const defaultSales = [];
const defaultOrders = [];
const defaultPopular = [];
const defaultRegistrations = [];
const defaultAlerts = [];

function formatCurrency(v) {
  return `₹${Number(v || 0).toLocaleString()}`;
}

export default function AdminDashboard() {
  // Filter state for sales graph
  const [salesFilter, setSalesFilter] = useState("monthly");
  // Real data state
  const [orders, setOrders] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalOrders: 0,
  });
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real order data from Firebase with real-time updates
  useEffect(() => {
    const fetchOrderData = () => {
      try {
        setLoading(true);

        // Set up real-time listener for orders collection
        const unsubscribe = onSnapshot(
          collection(db, "orders"),
          (snapshot) => {
            console.log(
              "Orders snapshot received:",
              snapshot.docs.length,
              "documents"
            );

            const ordersData = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              console.log("Raw Firebase order data:", data);

              ordersData.push({
                id: doc.id,
                ...data,
                orderDate: data.orderDate?.toDate
                  ? data.orderDate.toDate()
                  : data.createdAt?.toDate
                  ? data.createdAt.toDate()
                  : new Date(data.orderDate || data.createdAt || Date.now()),
                productName:
                  data.productName ||
                  data["Product name"] ||
                  data.name ||
                  data.title ||
                  "Unknown Product",
                totalPrice:
                  data.totalPrice ||
                  data["Total price"] ||
                  data.totalAmount ||
                  data.amount ||
                  data.price ||
                  0,
                status: data.status || data.Status || "Complete",
                productType:
                  data.productType || data.Type || data.type || "product",
                quantity: data.quantity || data.Quantity || 1,
                userId: data.userId || data.uId || data.uid || "",
              });
              console.log(
                "Processed order:",
                ordersData[ordersData.length - 1]
              );
            });

            console.log("Processed orders data:", ordersData);
            setOrders(ordersData);

            // Calculate revenue stats
            const now = new Date();
            const today = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate()
            );
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(
              today.getTime() - 30 * 24 * 60 * 60 * 1000
            );

            const stats = {
              today: ordersData
                .filter((order) => order.orderDate >= today)
                .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
              week: ordersData
                .filter((order) => order.orderDate >= weekAgo)
                .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
              month: ordersData
                .filter((order) => order.orderDate >= monthAgo)
                .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
              pendingOrders: ordersData.filter(
                (order) => order.status === "pending"
              ).length,
              completedOrders: ordersData.filter(
                (order) => order.status !== "pending"
              ).length,
              totalOrders: ordersData.length,
            };

            console.log("Revenue stats:", stats);
            setRevenueStats(stats);

            // Calculate popular products
            const productMap = new Map();
            ordersData.forEach((order) => {
              const productName = order.productName;
              if (productName && productName !== "Unknown Product") {
                const existing = productMap.get(productName) || {
                  name: productName,
                  qty: 0,
                };
                existing.qty += order.quantity || 1;
                productMap.set(productName, existing);
              }
            });

            const popular = Array.from(productMap.values())
              .sort((a, b) => b.qty - a.qty)
              .slice(0, 5);

            console.log("Popular products:", popular);
            setPopularProducts(popular);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching orders:", error);
            setOrders([]);
            setPopularProducts([]);
            setLoading(false);
          }
        );

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up orders listener:", error);
        setLoading(false);
      }
    };

    const unsubscribe = fetchOrderData();

    // Cleanup listener on component unmount
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Get sales data for charts using orders
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const calculateSalesData = () => {
      try {
        const salesMap = new Map();

        orders.forEach((order) => {
          const date = order.orderDate;
          let dateKey;

          if (salesFilter === "yearly") {
            dateKey = `${date.getFullYear()}-${date.getMonth()}`;
          } else {
            dateKey = date.toDateString();
          }

          const existing = salesMap.get(dateKey) || {
            date:
              salesFilter === "yearly"
                ? new Date(date.getFullYear(), date.getMonth(), 1)
                : date,
            amount: 0,
          };
          existing.amount += order.totalPrice || 0;
          salesMap.set(dateKey, existing);
        });

        let sales = Array.from(salesMap.values()).sort(
          (a, b) => a.date - b.date
        );

        // Filter based on period
        if (salesFilter === "weekly") {
          sales = sales.slice(-7);
        } else if (salesFilter === "monthly") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          sales = sales.filter((sale) => sale.date >= thirtyDaysAgo);
        }

        setSalesData(sales);
      } catch (error) {
        console.error("Error calculating sales data:", error);
        setSalesData([]);
      }
    };

    if (orders.length > 0) {
      calculateSalesData();
    } else {
      setSalesData([]);
    }
  }, [orders, salesFilter]);

  // Process sales data for chart
  const salesLabels = salesData.map((s) =>
    salesFilter === "yearly"
      ? s.date.toLocaleDateString(undefined, { month: "short" })
      : s.date.toLocaleDateString(undefined, { day: "numeric", month: "short" })
  );
  const salesValues = salesData.map((s) => s.amount);
  const maxSale = Math.max(...salesValues, 1);

  // Fix for maxPopular
  const maxPopular = useMemo(() => {
    return Math.max(...popularProducts.map((p) => p.qty), 1);
  }, [popularProducts]);

  // Fix for maxReg (for user registration chart) - using default empty array
  const maxReg = useMemo(() => {
    return Math.max(...defaultRegistrations.map((r) => r.count), 1);
  }, []);

  // Responsive bar chart width for large screens
  const chartBarWidth =
    salesValues.length > 0
      ? Math.max(36, Math.floor(window.innerWidth / (salesValues.length * 2.5)))
      : 36;
  const chartSvgWidth = Math.max(salesValues.length * chartBarWidth, 300);

  // Utility function to update orders without payment method
  const updateHistoricalOrders = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      let updatedCount = 0;
      let checkedCount = 0;

      console.log("🔍 Checking orders for payment method data...");

      for (const docRef of ordersSnapshot.docs) {
        const order = docRef.data();
        checkedCount++;

        console.log(`Order ${docRef.id}:`, {
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          productName: order.productName,
        });

        // Update if payment method is missing, empty, or set to old values
        const needsUpdate =
          !order.paymentMethod ||
          order.paymentMethod === "" ||
          order.paymentMethod === "cash_on_delivery" ||
          !order.paymentStatus ||
          order.paymentStatus === "" ||
          order.paymentStatus === "completed";

        if (needsUpdate) {
          const newPaymentMethod =
            order.paymentMethod === "cash_on_delivery"
              ? "Cash on Delivery"
              : order.paymentMethod || "Cash on Delivery";
          const newPaymentStatus =
            order.paymentStatus === "completed"
              ? "Completed"
              : order.paymentStatus || "Completed";

          console.log(`Updating order ${docRef.id}:`, {
            from: {
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus,
            },
            to: {
              paymentMethod: newPaymentMethod,
              paymentStatus: newPaymentStatus,
            },
          });

          await updateDoc(doc(db, "orders", docRef.id), {
            paymentMethod: newPaymentMethod,
            paymentStatus: newPaymentStatus,
          });
          updatedCount++;
        }
      }

      console.log(
        `✅ Checked ${checkedCount} orders, updated ${updatedCount} orders`
      );
      alert(
        `Checked ${checkedCount} orders and updated ${updatedCount} with proper payment method format.`
      );
    } catch (error) {
      console.error("Error updating historical orders:", error);
      alert("Error updating orders. Check console for details.");
    }
  };

  return (
    <div className="animate-fade-in space-y-8 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <button
          onClick={updateHistoricalOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          title="Update historical orders without payment method"
        >
          Fix Payment Data
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-lg text-gray-500">Loading dashboard data...</div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-50 flex flex-col">
          <div className="text-sm text-slate-500">Total Revenue (Today)</div>
          <div className="text-2xl font-bold text-black mt-2">
            {formatCurrency(revenueStats.today)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-50 flex flex-col">
          <div className="text-sm text-slate-500">Total Revenue (Week)</div>
          <div className="text-2xl font-bold text-black mt-2">
            {formatCurrency(revenueStats.week)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-50 flex flex-col">
          <div className="text-sm text-slate-500">Total Revenue (Month)</div>
          <div className="text-2xl font-bold text-black mt-2">
            {formatCurrency(revenueStats.month)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-50 flex flex-col">
          <div className="text-sm text-slate-500">Pending Orders</div>
          <div className="text-2xl font-bold text-black mt-2">
            {revenueStats.pendingOrders}
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Completed Orders:{" "}
            <span className="font-bold text-black">
              {revenueStats.completedOrders}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Sales Bar Chart with Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-green-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sales Trend</h2>
          <div className="flex items-center gap-3">
            <select
              value={salesFilter}
              onChange={(e) => setSalesFilter(e.target.value)}
              className="px-3 py-1 rounded border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="text-sm text-slate-500">
              {formatCurrency(salesValues.reduce((a, b) => a + b, 0))} total
            </div>
          </div>
        </div>
        <div className="overflow-x-auto pb-6">
          {salesValues.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No sales data available</div>
              <div className="text-sm text-gray-400">
                Sales will appear here when customers make purchases
              </div>
            </div>
          ) : (
            <div className="relative w-full">
              <svg
                viewBox={`0 0 ${chartSvgWidth} 140`}
                className="w-full h-40"
                style={{ minWidth: chartSvgWidth }}
              >
                {/* Y axis grid lines and labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <g key={i}>
                    <line
                      x1={0}
                      x2={chartSvgWidth}
                      y1={120 - t * 100}
                      y2={120 - t * 100}
                      stroke="#e5e7eb"
                      strokeDasharray="4 2"
                    />
                    <text x={0} y={124 - t * 100} fontSize="11" fill="#888">
                      {formatCurrency(Math.round(maxSale * t))}
                    </text>
                  </g>
                ))}
                {/* Bars */}
                {salesValues.map((v, i) => {
                  const barHeight = Math.max(
                    4,
                    Math.round((v / maxSale) * 100)
                  );
                  return (
                    <rect
                      key={i}
                      x={i * chartBarWidth + chartBarWidth / 2}
                      y={120 - barHeight}
                      width={chartBarWidth * 0.5}
                      height={barHeight}
                      rx="4"
                      fill="#22c55e"
                    />
                  );
                })}
                {/* X axis labels */}
                {salesLabels.map((label, i) =>
                  i %
                    (salesFilter === "yearly"
                      ? 1
                      : salesFilter === "monthly"
                      ? Math.max(1, Math.floor(salesLabels.length / 10))
                      : 1) ===
                  0 ? (
                    <text
                      key={i}
                      x={i * chartBarWidth + chartBarWidth}
                      y={134}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#222"
                    >
                      {label}
                    </text>
                  ) : null
                )}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Most Popular Products Bar */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-green-50">
        <h2 className="text-lg font-semibold mb-4">Most Popular Products</h2>
        <div className="space-y-3">
          {popularProducts.map((p, idx) => {
            const w = Math.round((p.qty / maxPopular) * 100);
            return (
              <div key={p.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-sm text-slate-500">{p.qty}</div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-2 bg-blue-600 rounded"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {popularProducts.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No product data available yet
            </div>
          )}
        </div>
      </div>

      {/* User Registration Line Chart - Hidden since no real data */}
      <div
        className="bg-white rounded-xl shadow-sm p-6 border border-blue-50"
        style={{ display: "none" }}
      >
        <h2 className="text-lg font-semibold text-blue- mb-4">
          User Registration Over Time
        </h2>
        <div className="text-center py-4 text-gray-500">
          User registration tracking not implemented yet
        </div>
      </div>

      {/* Alerts & Notifications - Hidden since no real data */}
      <div
        className="bg-white rounded-xl shadow-sm p-6 border border-blue-50"
        style={{ display: "none" }}
      >
        <h2 className="text-lg font-semibold text-blue- mb-4">
          Alerts & Notifications
        </h2>
        <div className="text-center py-4 text-gray-500">
          No alerts at this time
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white overflow-x-auto h-[500px] rounded-xl shadow-sm p-6 border border-blue-50">
        <h2 className="text-lg font-semibold text-blue- mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-blue-600 bg-blue-50">
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Total Price</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-blue-50"
                >
                  <td className="px-4 py-2">{order.id.substring(0, 8)}...</td>
                  <td className="px-4 py-2 text-black">{order.productName}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.productType === "pesticide"
                          ? "bg-green-100 text-green-800"
                          : order.productType === "equipment"
                          ? "bg-purple-100 text-purple-800"
                          : order.productType === "fertilizer"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.productType}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-black">
                    {formatCurrency(order.totalPrice)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "confirmed"
                          ? "bg-purple-100 text-purple-700"
                          : order.status === "processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {order.orderDate.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    No orders found. Orders will appear here when customers make
                    purchases.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

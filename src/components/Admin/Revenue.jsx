import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FiCalendar, FiTrendingUp, FiPackage, FiDownload } from "react-icons/fi";

export default function Revenue() {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [prodSnap, purchSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "purchases")),
        ]);
        if (!mounted) return;
        const prods = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const purch = purchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(prods);
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

  const productsById = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(p.id, p));
    return m;
  }, [products]);

  const getFilteredPurchases = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return purchases.filter((p) => {
      let dt = p.purchaseDate;
      if (dt && typeof dt.toDate === "function") dt = dt.toDate();
      else if (dt) dt = new Date(dt);
      if (!dt || Number.isNaN(dt.getTime())) return false;

      switch (timeFilter) {
        case "today":
          return dt >= today;
        case "weekly":
          return dt >= weekStart;
        case "monthly":
          return dt >= monthStart;
        default:
          return true;
      }
    });
  }, [purchases, timeFilter]);

  const revenueStats = useMemo(() => {
    const totalRevenue = getFilteredPurchases.reduce((a, p) => a + Number(p.totalPrice || 0), 0);
    const totalOrders = getFilteredPurchases.length;
    const totalQuantity = getFilteredPurchases.reduce((a, p) => a + Number(p.quantity || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, totalQuantity, avgOrderValue };
  }, [getFilteredPurchases]);

  const productSalesData = useMemo(() => {
    const salesMap = new Map();
    
    getFilteredPurchases.forEach((p) => {
      const productId = p.productId;
      const quantity = Number(p.quantity || 0);
      const revenue = Number(p.totalPrice || 0);
      
      if (salesMap.has(productId)) {
        const existing = salesMap.get(productId);
        existing.quantity += quantity;
        existing.revenue += revenue;
        existing.orders += 1;
      } else {
        const product = productsById.get(productId);
        salesMap.set(productId, {
          productId,
          productName: product?.name || "Unknown Product",
          category: product?.category || "Unknown",
          price: product?.price || 0,
          quantity,
          revenue,
          orders: 1,
        });
      }
    });

    return Array.from(salesMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [getFilteredPurchases, productsById]);

  const categoryPerformanceData = useMemo(() => {
    const categoryMap = new Map();
    
    productSalesData.forEach((item) => {
      const category = item.category;
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category);
        existing.totalRevenue += item.revenue;
        existing.totalQuantity += item.quantity;
        existing.totalOrders += item.orders;
        existing.products.push(item);
      } else {
        categoryMap.set(category, {
          category,
          totalRevenue: item.revenue,
          totalQuantity: item.quantity,
          totalOrders: item.orders,
          products: [item]
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [productSalesData]);

  const downloadPerformanceMatrix = () => {
    const matrixHTML = generatePerformanceMatrixPDF();
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(matrixHTML);
    doc.close();
    
    // Print the iframe content
    iframe.contentWindow.print();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const generatePerformanceMatrixPDF = () => {
    const maxRevenue = categoryPerformanceData[0]?.totalRevenue || 1;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Performance Matrix Report - ${getFilterLabel()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #10b981; }
          .report-title { font-size: 20px; margin: 10px 0; }
          .period-info { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 16px; color: #10b981; margin-bottom: 10px; }
          .matrix-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .matrix-table th, .matrix-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .matrix-table th { background-color: #10b981; color: white; }
          .performance-bar { background-color: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; }
          .performance-fill { background: linear-gradient(to right, #3b82f6, #10b981); height: 100%; transition: width 0.3s; }
          .summary-section { margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">🌾 KrusheeMart</div>
          <div>Agricultural Products & Equipment</div>
          <div class="report-title">PERFORMANCE MATRIX REPORT</div>
        </div>

        <div class="period-info">
          <div class="section-title">Report Details</div>
          <div><strong>Period:</strong> ${getFilterLabel()}</div>
          <div><strong>Total Categories:</strong> ${categoryPerformanceData.length}</div>
          <div><strong>Report Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        </div>

        <table class="matrix-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Category</th>
              <th>Total Revenue</th>
              <th>Products Sold</th>
              <th>Total Orders</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            ${categoryPerformanceData.map((category, index) => {
              const performanceWidth = Math.round((category.totalRevenue / maxRevenue) * 100);
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${category.category}</td>
                  <td>₹${category.totalRevenue.toLocaleString()}</td>
                  <td>${category.totalQuantity}</td>
                  <td>${category.totalOrders}</td>
                  <td>
                    <div class="performance-bar">
                      <div class="performance-fill" style="width: ${performanceWidth}%"></div>
                    </div>
                    ${performanceWidth}%
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="summary-section">
          <div class="section-title">Summary</div>
          <div><strong>Best Performing Category:</strong> ${categoryPerformanceData[0]?.category || 'N/A'}</div>
          <div><strong>Total Revenue (All Categories):</strong> ₹${categoryPerformanceData.reduce((sum, cat) => sum + cat.totalRevenue, 0).toLocaleString()}</div>
          <div><strong>Total Products Sold:</strong> ${categoryPerformanceData.reduce((sum, cat) => sum + cat.totalQuantity, 0)}</div>
        </div>

        <div class="footer">
          <p>Thank you for choosing KrusheeMart!</p>
          <p>This performance matrix shows category-wise sales analytics for the selected period.</p>
        </div>
      </body>
      </html>
    `;
  };

  const getFilterLabel = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "weekly": return "This Week";
      case "monthly": return "This Month";
      default: return "All Time";
    }
  };

  return (
    <div className="animate-fade-in space-y-6 text-black">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-slate-200">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-slate-800">Loading Revenue Data...</div>
            <div className="text-sm text-slate-500">Analyzing sales performance</div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Revenue Analytics</h1>
          <p className="text-sm text-slate-500">Track product sales and revenue performance</p>
        </div>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-slate-500" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-green-500 border border-slate-100 hover:shadow-lg hover:border-green-400 hover:shadow-green-400/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Revenue ({getFilterLabel()})</div>
              <div className="text-2xl font-bold mt-2">₹{Number(revenueStats.totalRevenue || 0).toLocaleString()}</div>
            </div>
            <span className="text-green-500 text-2xl font-bold">₹</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-blue-500 border border-slate-100 hover:shadow-lg hover:border-blue-400 hover:shadow-blue-400/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Orders</div>
              <div className="text-2xl font-bold mt-2">{revenueStats.totalOrders}</div>
            </div>
            <FiTrendingUp className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-purple-500 border border-slate-100 hover:shadow-lg hover:border-purple-400 hover:shadow-purple-400/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Items Sold</div>
              <div className="text-2xl font-bold mt-2">{revenueStats.totalQuantity}</div>
            </div>
            <FiPackage className="text-purple-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-l-orange-500 border border-slate-100 hover:shadow-lg hover:border-orange-400 hover:shadow-orange-400/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Avg Order Value</div>
              <div className="text-2xl font-bold mt-2">₹{Number(revenueStats.avgOrderValue || 0).toLocaleString()}</div>
            </div>
            <span className="text-orange-500 text-2xl font-bold">₹</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Product Sales Performance</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadPerformanceMatrix}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <FiDownload className="w-4 h-4" />
              Download Performance Matrix
            </button>
            <div className="text-sm text-slate-500">
              Showing {productSalesData.length} products for {getFilterLabel().toLowerCase()}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-blue-600 bg-blue-50 border-b">
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Product Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Unit Price</th>
                <th className="px-4 py-3 font-semibold">Qty Sold</th>
                <th className="px-4 py-3 font-semibold">Orders</th>
                <th className="px-4 py-3 font-semibold">Revenue</th>
                <th className="px-4 py-3 font-semibold">Performance</th>
              </tr>
            </thead>
            <tbody>
              {productSalesData.map((item, index) => {
                const maxRevenue = productSalesData[0]?.revenue || 1;
                const performanceWidth = Math.round((item.revenue / maxRevenue) * 100);
                
                return (
                  <tr key={item.productId} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-semibold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{item.productName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      ₹{Number(item.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.orders}
                    </td>
                    <td className="px-4 py-3 font-bold text-green-600">
                      ₹{Number(item.revenue).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${performanceWidth}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-10">{performanceWidth}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {productSalesData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <FiPackage className="text-4xl" />
                      <div>No sales data found for the selected period</div>
                    </div>
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

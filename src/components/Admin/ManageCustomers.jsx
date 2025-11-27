import React, { useState, useEffect } from "react";
import {
  FiTrash,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiX,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import { db } from "../../firebase";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Snackbar component
const Snackbar = ({ message, type = "success", onClose }) => (
  <div
    className={`fixed top-6 right-6 z-[9999] px-6 py-3 rounded-lg shadow-lg text-base font-medium flex items-center gap-2
      ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
  >
    {type === "success" ? "✅" : "❌"} {message}
    <button className="ml-2" onClick={onClose}>
      <FiX />
    </button>
  </div>
);

// Delete modal component with stronger blur and perfectly centered modal
const DeleteModal = ({ onConfirm, onCancel }) => {
  React.useEffect(() => {
    document.body.classList.add("krushee-blur-sidebar");
    return () => {
      document.body.classList.remove("krushee-blur-sidebar");
    };
  }, []);
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Full-screen white blur overlay, covers everything including sidebar */}
      <div
        className="fixed inset-0 bg-white/70 backdrop-blur-[14px]"
        style={{ zIndex: 9999 }}
        onClick={onCancel}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center z-[10000]">
        <div className="text-4xl mb-4 text-red-500">⚠️</div>
        <div className="text-lg font-semibold mb-4 text-center">
          Are you sure you want to delete this user?
        </div>
        <div className="flex gap-4 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Add this style globally (e.g. in App.jsx or index.css), but for inline demo:
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (!document.getElementById("krushee-blur-sidebar-style")) {
    const style = document.createElement("style");
    style.id = "krushee-blur-sidebar-style";
    style.innerHTML = `
      body.krushee-blur-sidebar aside {
        filter: blur(6px) brightness(0.95);
        pointer-events: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function ManageCustomers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [deleteId, setDeleteId] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users"); // Fetch from 'users' collection
        const usersSnapshot = await getDocs(usersCollection);
        const userList = usersSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.role !== "admin"); // Exclude admin users
        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      const userRef = doc(db, "users", deleteId);
      await deleteDoc(userRef);
      const updatedUsers = users.filter((user) => user.id !== deleteId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setSnackbarMsg("User deleted successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      setSnackbarMsg("Error deleting user. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    }
    setDeleteId(null);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleSort = () => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const nameA = a.name?.toLowerCase() || "";
      const nameB = b.name?.toLowerCase() || "";
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
    setFilteredUsers(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handlePreview = (user) => {
    navigate(`/admin/manage-customers/${user.id}`, { state: { user } });
  };

  const handleViewOrders = async (user) => {
    setLoadingOrders(true);
    setSelectedUserName(user.name || "Unknown User");
    setShowOrdersModal(true);
    
    console.log("🔍 ManageCustomers: Full user object:", user);
    console.log("🔍 ManageCustomers: Trying to fetch orders for user uid:", user.uid || user.id);
    
    try {
      const ordersCollection = collection(db, "orders");
      
      // Try multiple query approaches to find orders
      const queries = [
        query(ordersCollection, where("uid", "==", user.uid || user.id)),
        query(ordersCollection, where("userId", "==", user.uid || user.id)),
        query(ordersCollection, where("userEmail", "==", user.email))
      ];
      
      let allOrders = [];
      
      for (let i = 0; i < queries.length; i++) {
        try {
          const ordersSnapshot = await getDocs(queries[i]);
          console.log(`📊 ManageCustomers: Query ${i + 1} snapshot size:`, ordersSnapshot.size);
          
          if (ordersSnapshot.size > 0) {
            ordersSnapshot.docs.forEach((doc) => {
              const data = doc.data();
              console.log(`📦 ManageCustomers: Query ${i + 1} order data:`, doc.id, data);
              allOrders.push({
                id: doc.id,
                ...data,
              });
            });
            break; // Stop once we find orders with one of the queries
          }
        } catch (queryError) {
          console.error(`❌ Query ${i + 1} failed:`, queryError);
        }
      }
      
      // Remove duplicates if any
      const uniqueOrders = allOrders.filter((order, index, self) => 
        index === self.findIndex(o => o.id === order.id)
      );
      
      console.log("📋 ManageCustomers: Final unique orders list:", uniqueOrders);
      setSelectedUserOrders(uniqueOrders);
    } catch (error) {
      console.error("❌ ManageCustomers: Error fetching orders:", error);
      setSnackbarMsg("Error fetching orders. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } finally {
      setLoadingOrders(false);
    }
  };

  const downloadOrdersPDF = () => {
    const ordersHTML = generateOrdersPDF();
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(ordersHTML);
    doc.close();
    
    // Print the iframe content
    iframe.contentWindow.print();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  const generateOrdersPDF = () => {
    const totalAmount = selectedUserOrders.reduce((sum, order) => sum + (order.totalPrice || order.amount || 0), 0);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Customer Orders Report - ${selectedUserName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #10b981; }
          .report-title { font-size: 20px; margin: 10px 0; }
          .customer-info { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 16px; color: #10b981; margin-bottom: 10px; }
          .orders-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .orders-table th, .orders-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .orders-table th { background-color: #10b981; color: white; }
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
          <div class="report-title">CUSTOMER ORDERS REPORT</div>
        </div>

        <div class="customer-info">
          <div class="section-title">Customer Details</div>
          <div><strong>Customer Name:</strong> ${selectedUserName}</div>
          <div><strong>Total Orders:</strong> ${selectedUserOrders.length}</div>
          <div><strong>Report Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
        </div>

        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            ${selectedUserOrders.map(order => {
              const orderDate = order.orderDate || order.createdAt || order.purchaseDate;
              let formattedDate = 'N/A';
              
              if (orderDate) {
                let date;
                if (orderDate.toDate && typeof orderDate.toDate === 'function') {
                  // Firebase Timestamp
                  date = orderDate.toDate();
                } else if (orderDate.seconds) {
                  // Firebase Timestamp object
                  date = new Date(orderDate.seconds * 1000);
                } else if (typeof orderDate === 'string' || typeof orderDate === 'number') {
                  // String or number timestamp
                  date = new Date(orderDate);
                } else {
                  // Already a Date object or other
                  date = new Date(orderDate);
                }
                
                // Check if date is valid
                if (!isNaN(date.getTime())) {
                  formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }
              }
              
              return `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.productName || 'N/A'}</td>
                  <td>${order.quantity || 1}</td>
                  <td>₹${order.totalPrice || order.amount || 0}</td>
                  <td>${formattedDate}</td>
                  <td>${order.status || 'Pending'}</td>
                  <td>${order.paymentMethod || 'Cash on Delivery'}</td>
                  <td>${order.paymentStatus || 'Completed'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-amount">Total Amount: ₹${totalAmount}</div>
        </div>

        <div class="footer">
          <p>Thank you for choosing KrusheeMart!</p>
          <p>This report contains all orders for the selected customer.</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="animate-fade-in space-y-6 text-black">
      {showSnackbar && (
        <Snackbar
          message={snackbarMsg}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
        Manage Users
      </h1>
      <p className="text-sm text-slate-500">View and manage user records.</p>

      {/* Search, Sort, and Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex items-center w-full">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSort}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base flex items-center gap-2"
          >
            {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />} Sort
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm md:text-base flex items-center gap-2">
            <FiFilter /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-50 rounded-xl shadow-sm p-4 md:p-6 border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse">
            <thead className="bg-slate-300 text-slate-700 border-b">
              <tr className="text-sm">
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Sr No
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Name
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Email
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Password
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-slate-50"
                >
                  <td className="px-4 md:px-6 py-1 text-center align-middle">
                    {i + 1}
                  </td>
                  <td className="px-4 md:px-6 py-1 text-center align-middle">
                    {user.name || "N/A"}
                  </td>
                  <td className="px-4 md:px-6 py-1 text-center align-middle">
                    {user.email}
                  </td>
                  <td className="px-4 md:px-6 py-1 text-center align-middle">
                    {user.password || "N/A"}
                  </td>
                  <td className="px-4 md:px-6 py-1 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePreview(user)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Preview"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleViewOrders(user)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded"
                        title="View Orders"
                      >
                        <FiFileText />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Delete Modal */}
          {deleteId && (
            <DeleteModal
              onConfirm={confirmDelete}
              onCancel={() => setDeleteId(null)}
            />
          )}
          
          {/* Orders Modal */}
          {showOrdersModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowOrdersModal(false)}
              />
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden z-[10000]">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-800">
                    Orders for {selectedUserName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={downloadOrdersPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => setShowOrdersModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <div className="text-gray-500">Loading orders...</div>
                    </div>
                  ) : selectedUserOrders.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Total Orders: <span className="font-semibold">{selectedUserOrders.length}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Payment Method</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Payment Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUserOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2 text-sm font-mono">
                                  {order.id.substring(0, 8)}...
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {order.productName || 'N/A'}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  {order.quantity || 1}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 font-semibold text-green-600">
                                  ₹{order.totalPrice || order.amount || 0}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-sm">
                                  {(() => {
                                    const orderDate = order.orderDate || order.createdAt || order.purchaseDate;
                                    if (!orderDate) return 'N/A';
                                    
                                    let date;
                                    if (orderDate.toDate && typeof orderDate.toDate === 'function') {
                                      // Firebase Timestamp
                                      date = orderDate.toDate();
                                    } else if (orderDate.seconds) {
                                      // Firebase Timestamp object
                                      date = new Date(orderDate.seconds * 1000);
                                    } else if (typeof orderDate === 'string' || typeof orderDate === 'number') {
                                      // String or number timestamp
                                      date = new Date(orderDate);
                                    } else {
                                      // Already a Date object or other
                                      date = new Date(orderDate);
                                    }
                                    
                                    // Check if date is valid
                                    if (isNaN(date.getTime())) {
                                      return 'N/A';
                                    }
                                    
                                    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                  })()}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.status === 'Complete' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {order.status || 'Pending'}
                                  </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-sm">
                                  {(() => {
                                    console.log("🔍 ManageCustomers: Order payment data:", {
                                      orderId: order.id,
                                      paymentMethod: order.paymentMethod,
                                      paymentStatus: order.paymentStatus,
                                      allFields: Object.keys(order)
                                    });
                                    return order.paymentMethod || 'Cash on Delivery';
                                  })()}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-sm">
                                  {order.paymentStatus || 'Completed'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-6 text-right">
                        <div className="text-lg font-bold text-green-600">
                          Total Amount: ₹{selectedUserOrders.reduce((sum, order) => sum + (order.totalPrice || order.amount || 0), 0)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-lg">No orders found</div>
                      <div className="text-gray-400 text-sm mt-2">
                        This customer hasn't placed any orders yet.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

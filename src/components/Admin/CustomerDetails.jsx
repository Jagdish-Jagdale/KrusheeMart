import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { FiArrowLeft } from "react-icons/fi";

export default function CustomerDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(location.state?.user || null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(!customer);
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  useEffect(() => {
   
      // Fetch from Firestore if not passed via state
      const fetchCustomer = async () => {
        setLoading(true);
        try {
          const ref = doc(db, "users", id);
          const snap = await getDoc(ref);
          console.log("🔍 CustomerDetails: Fetched user document:", snap.data());

          if (snap.exists()) 
            setUserId(snap.data().uid);
            setCustomer({ id: snap.data().uid, ...snap.data() });
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
  }, []);

  useEffect(() => {
    // Fetch purchases from orders collection instead of purchases
    const fetchPurchases = async () => {
      if (!id) return;
      setLoadingPurchases(true);
      try {
          const ref = doc(db, "users", id);
          const snap = await getDoc(ref);
      console.log("🔍 CustomerDetails: Fetching orders for user uid:", snap.data().uid);

        const q = query(collection(db, "orders"), where("uId", "==", snap.data().uid));
        const snapshot = await getDocs(q);
        console.log("📊 CustomerDetails: Orders query snapshot size:", snapshot.size);
        
        const purchaseList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("📦 CustomerDetails: Raw order data:", doc.id, data);
          
          const processedOrder = {
            id: doc.id,
            productName: data.productName || data["Product name"] || "Unknown Product",
            quantity: data.quantity || 0,
            totalPrice: data.totalPrice || data["Total price"] || 0,
            date: data.orderDate?.toDate ? data.orderDate.toDate() : 
                  data.createdAt?.toDate ? data.createdAt.toDate() : 
                  new Date(data.orderDate || data.createdAt || Date.now()),
            status: data.status || "Pending",
            paymentMethod: data.paymentMethod || "N/A",
            expectedDeliveryDate: data.expectedDeliveryDate?.toDate ? data.expectedDeliveryDate.toDate() : null
          };
          
          console.log("✅ CustomerDetails: Processed order:", processedOrder);
          purchaseList.push(processedOrder);
        });
        
        // Sort by date (newest first)
        purchaseList.sort((a, b) => b.date - a.date);
        console.log("📋 CustomerDetails: Final purchase list:", purchaseList);
        setPurchases(purchaseList);
      } catch (error) {
        console.error("❌ CustomerDetails: Error fetching purchases:", error);
      } finally {
        setLoadingPurchases(false);
      }
    };
    fetchPurchases();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-blue-600 font-semibold">Loading...</span>
      </div>
    );

  if (!customer)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-red-600 font-semibold">Customer not found.</span>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-10 mt-8">
      <button
        onClick={() => navigate("/admin/manage-customers")}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
      >
        <FiArrowLeft /> Back to Customers
      </button>
      <div className="flex items-center gap-8 mb-10">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-bold shadow">
          {customer.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-700">
            {customer.name}
          </div>
          <div className="text-lg text-gray-500">{customer.email}</div>
          <div className="text-xs text-gray-400 mt-1">
            User ID: {customer.id}
          </div>
        </div>
      </div>
      <hr className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="mb-4">
            <span className="font-medium text-gray-700">Password:</span>{" "}
            <span className="text-gray-600">{customer.password || "N/A"}</span>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-700">Role:</span>{" "}
            <span className="text-gray-600">{customer.role || "user"}</span>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-700">Phone:</span>{" "}
            <span className="text-gray-600">{customer.phone || "N/A"}</span>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-700">Address:</span>{" "}
            <span className="text-gray-600">{customer.address || "N/A"}</span>
          </div>
        </div>
        <div>
          <div className="font-medium text-gray-700 mb-3">
            Purchase History:
          </div>
          {loadingPurchases ? (
            <div className="text-gray-500 text-sm">Loading purchases...</div>
          ) : (
            <ul className="space-y-4 text-gray-600">
              {purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <li key={purchase.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="font-semibold text-gray-800">{purchase.productName}</div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Qty:</span> {purchase.quantity} • 
                      <span className="font-medium"> Amount:</span> ₹{purchase.totalPrice.toFixed(0)} • 
                      <span className="font-medium"> Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        purchase.status === 'Complete' ? 'bg-green-100 text-green-800' :
                        purchase.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <div>
                        <span className="font-medium">Order Date:</span> {purchase.date.toLocaleDateString()} {purchase.date.toLocaleTimeString()}
                      </div>
                      <div>
                        <span className="font-medium">Payment:</span> {purchase.paymentMethod}
                      </div>
                      {purchase.expectedDeliveryDate && (
                        <div>
                          <span className="font-medium">Expected Delivery:</span> {purchase.expectedDeliveryDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No orders found.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

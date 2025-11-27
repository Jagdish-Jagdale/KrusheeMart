import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot } from "firebase/firestore";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      console.log("OrderManagement: Orders snapshot received");
      
      const ordersData = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          ...data,
          orderDate: data.orderDate?.toDate ? data.orderDate.toDate() : new Date(data.orderDate || Date.now()),
          productName: data.productName || data['Product name'] || 'Unknown Product',
          totalPrice: data.totalPrice || data['Total price'] || 0,
          status: data.status || 'pending',
          productType: data.productType || data.Type || 'product',
          quantity: data.quantity || 1,
          customerName: data.customerName || '',
          customerEmail: data.customerEmail || ''
        });
      });
      
      setOrders(ordersData.sort((a, b) => b.orderDate - a.orderDate));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });
    
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No orders found</div>
            <div className="text-gray-400 text-sm mt-2">
              Orders will appear here when customers make purchases
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                      <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderDate.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
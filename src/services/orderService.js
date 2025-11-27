import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const order = {
      userId: orderData.userId,
      customerName: orderData.customerName || '',
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone || '',
      customerAddress: orderData.customerAddress || '',
      
      // Product details
      productId: orderData.productId,
      productName: orderData.productName,
      productType: orderData.productType || 'product',
      quantity: orderData.quantity,
      unitPrice: orderData.unitPrice,
      totalPrice: orderData.totalPrice,
      
      // Order management
      status: ORDER_STATUS.PENDING,
      paymentStatus: orderData.paymentStatus || 'Pending',
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      
      // Timestamps
      orderDate: new Date(),
      confirmedAt: null,
      shippedAt: null,
      deliveredAt: null,
      
      // Additional info
      notes: orderData.notes || '',
      trackingNumber: null
    };

    const docRef = await addDoc(collection(db, "orders"), order);
    return { id: docRef.id, ...order };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Get all orders (for admin)
export const getAllOrders = async () => {
  try {
    const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        orderDate: data.orderDate?.toDate() || new Date(),
        confirmedAt: data.confirmedAt?.toDate() || null,
        shippedAt: data.shippedAt?.toDate() || null,
        deliveredAt: data.deliveredAt?.toDate() || null
      });
    });
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// Get orders by user
export const getOrdersByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "orders"), 
      where("userId", "==", userId),
      orderBy("orderDate", "desc")
    );
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        orderDate: data.orderDate?.toDate() || new Date(),
        confirmedAt: data.confirmedAt?.toDate() || null,
        shippedAt: data.shippedAt?.toDate() || null,
        deliveredAt: data.deliveredAt?.toDate() || null
      });
    });
    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const q = query(
      collection(db, "orders"), 
      where("status", "==", status),
      orderBy("orderDate", "desc")
    );
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        orderDate: data.orderDate?.toDate() || new Date(),
        confirmedAt: data.confirmedAt?.toDate() || null,
        shippedAt: data.shippedAt?.toDate() || null,
        deliveredAt: data.deliveredAt?.toDate() || null
      });
    });
    return orders;
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    return [];
  }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const updateData = { status: newStatus };
    
    // Add timestamp for status changes
    const now = new Date();
    switch (newStatus) {
      case ORDER_STATUS.CONFIRMED:
        updateData.confirmedAt = now;
        break;
      case ORDER_STATUS.SHIPPED:
        updateData.shippedAt = now;
        break;
      case ORDER_STATUS.DELIVERED:
        updateData.deliveredAt = now;
        break;
    }
    
    await updateDoc(doc(db, "orders", orderId), updateData);
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Update order with tracking number
export const updateOrderTracking = async (orderId, trackingNumber) => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      trackingNumber,
      status: ORDER_STATUS.SHIPPED,
      shippedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error updating order tracking:", error);
    throw error;
  }
};

// Get revenue statistics
export const getRevenueStats = async () => {
  try {
    const orders = await getAllOrders();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Filter completed orders (delivered orders contribute to revenue)
    const completedOrders = orders.filter(order => 
      order.status === ORDER_STATUS.DELIVERED || 
      order.status === ORDER_STATUS.CONFIRMED ||
      order.status === ORDER_STATUS.PROCESSING ||
      order.status === ORDER_STATUS.SHIPPED
    );
    
    const stats = {
      today: completedOrders
        .filter(order => order.orderDate >= today)
        .reduce((sum, order) => sum + order.totalPrice, 0),
      
      week: completedOrders
        .filter(order => order.orderDate >= weekAgo)
        .reduce((sum, order) => sum + order.totalPrice, 0),
      
      month: completedOrders
        .filter(order => order.orderDate >= monthAgo)
        .reduce((sum, order) => sum + order.totalPrice, 0),
      
      pendingOrders: orders.filter(order => order.status === ORDER_STATUS.PENDING).length,
      completedOrders: completedOrders.length,
      totalOrders: orders.length
    };
    
    return stats;
  } catch (error) {
    console.error("Error calculating revenue stats:", error);
    return {
      today: 0,
      week: 0,
      month: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalOrders: 0
    };
  }
};

// Get popular products
export const getPopularProducts = async () => {
  try {
    const orders = await getAllOrders();
    const productMap = new Map();
    
    orders.forEach(order => {
      const productName = order.productName;
      const existing = productMap.get(productName) || { 
        name: productName, 
        qty: 0, 
        revenue: 0,
        type: order.productType 
      };
      existing.qty += order.quantity;
      existing.revenue += order.totalPrice;
      productMap.set(productName, existing);
    });
    
    return Array.from(productMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  } catch (error) {
    console.error("Error getting popular products:", error);
    return [];
  }
};

// Get sales data for charts
export const getSalesData = async (period = 'month') => {
  try {
    const orders = await getAllOrders();
    const salesMap = new Map();
    const now = new Date();
    
    // Filter orders based on period
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const filteredOrders = orders.filter(order => 
      order.orderDate >= startDate && 
      (order.status === ORDER_STATUS.DELIVERED || 
       order.status === ORDER_STATUS.CONFIRMED ||
       order.status === ORDER_STATUS.PROCESSING ||
       order.status === ORDER_STATUS.SHIPPED)
    );
    
    filteredOrders.forEach(order => {
      const dateKey = period === 'year' 
        ? `${order.orderDate.getFullYear()}-${order.orderDate.getMonth()}`
        : order.orderDate.toDateString();
      
      const existing = salesMap.get(dateKey) || { 
        date: period === 'year' 
          ? new Date(order.orderDate.getFullYear(), order.orderDate.getMonth(), 1)
          : order.orderDate, 
        amount: 0 
      };
      existing.amount += order.totalPrice;
      salesMap.set(dateKey, existing);
    });
    
    return Array.from(salesMap.values()).sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error("Error getting sales data:", error);
    return [];
  }
};
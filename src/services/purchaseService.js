import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export const purchaseProduct = async (userId, productId, quantity, totalPrice, productName = "", additionalData = {}) => {
  try {
    console.log("🔄 purchaseService: Starting purchase process...");
    console.log("📋 Parameters:", { userId, productId, quantity, totalPrice, productName, additionalData });
    
    // Test Firebase write permission first
    console.log("🔄 purchaseService: Testing Firebase connection...");
    try {
      const testDoc = await addDoc(collection(db, "test"), { test: true, timestamp: new Date() });
      console.log("✅ purchaseService: Firebase connection works, test doc ID:", testDoc.id);
    } catch (testError) {
      console.error("❌ purchaseService: Firebase connection failed:", testError);
      throw new Error("Database connection failed: " + testError.message);
    }
    
    // Create order data with proper structure to match Firebase format
    const currentDate = new Date();
    const expectedDeliveryDate = new Date(currentDate);
    expectedDeliveryDate.setDate(currentDate.getDate() + 3); // Add 3 days for delivery
    
    const orderData = {
      // Firebase format fields (matching your manual entry)
      "Product name": productName || 'Unknown Product',
      "Total price": totalPrice || 0,
      "Type": additionalData.productType || 'product',
      "status": 'Complete',
      "createdAt": currentDate,
      "uId": userId,
      
      // Additional fields for compatibility
      userId: userId,
      productId: productId,
      productName: productName || 'Unknown Product',
      quantity: quantity || 1,
      totalPrice: totalPrice || 0,
      unitPrice: totalPrice ? Math.round(totalPrice / quantity) : 0,
      productType: additionalData.productType || 'product',
      customerName: additionalData.customerName || '',
      customerEmail: additionalData.customerEmail || '',
      customerPhone: additionalData.customerPhone || '',
      customerAddress: additionalData.customerAddress || '',
      paymentMethod: additionalData.paymentMethod || 'cash_on_delivery',
      paymentStatus: 'completed',
      orderDate: currentDate,
      expectedDeliveryDate: expectedDeliveryDate, // Add expected delivery date
      confirmedAt: null,
      shippedAt: null,
      deliveredAt: null,
      notes: additionalData.notes || '',
      trackingNumber: null
    };
    
    console.log("📝 purchaseService: Order data to be saved:", orderData);
    
    // Save to orders collection
    console.log("🔄 purchaseService: Saving to orders collection...");
    const orderRef = await addDoc(collection(db, "orders"), orderData);
    console.log("✅ purchaseService: Order saved to orders collection with ID:", orderRef.id);
    
    // Keep backward compatibility - also save to purchases collection
    console.log("🔄 purchaseService: Saving to purchases collection...");
    const purchaseData = {
      userId,
      productId,
      quantity,
      totalPrice,
      productName,
      orderId: orderRef.id,
      purchaseDate: new Date()
    };
    
    const purchaseRef = await addDoc(collection(db, "purchases"), purchaseData);
    console.log("✅ purchaseService: Purchase saved to purchases collection with ID:", purchaseRef.id);
    
    console.log("🎉 purchaseService: Purchase completed successfully!");
    
    return { 
      orderId: orderRef.id, 
      purchaseId: purchaseRef.id,
      ...orderData 
    };
  } catch (error) {
    console.error("💥 purchaseService: Error in purchaseProduct:", error);
    console.error("💥 Error details:", error.message, error.stack);
    throw error;
  }
};

export const getPurchasesByUser = async (userId) => {
  const q = query(collection(db, "purchases"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const items = [];
  snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
  return items;
};

export const getAllPurchases = async () => {
  const snapshot = await getDocs(collection(db, "purchases"));
  const items = [];
  snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
  return items;
};

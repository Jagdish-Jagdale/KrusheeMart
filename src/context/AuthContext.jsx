import React, { createContext, useContext, useState, useEffect } from "react";
import {
  register as registerService,
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  getUserData,
} from "../services/authService";
import {
  addProduct as addProductService,
  getProducts,
} from "../services/productService";
import {
  purchaseProduct as purchaseProductService,
  getPurchasesByUser,
} from "../services/purchaseService";
import { db } from "../firebase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [authReady, setAuthReady] = useState(false); // new: indicates initial auth resolved

  useEffect(() => {
    // wait for initial auth state; set authReady after first callback
    let initial = true;
    const unsubscribe = getCurrentUser(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        setUser(
          userData
            ? { ...userData, email: firebaseUser.email, uid: firebaseUser.uid }
            : { email: firebaseUser.email, uid: firebaseUser.uid }
        );
      } else {
        setUser(null);
      }
      if (initial) {
        setAuthReady(true);
        initial = false;
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const items = await getProducts();
      setProducts(items);
      
      // Clean up cart items and remove prefixes from existing cart data
      try {
        const cart = JSON.parse(localStorage.getItem("krushee_cart") || "[]");
        let cartChanged = false;
        
        const cleanCart = cart.map(cartItem => {
          // Remove prod- or fert- prefix if it exists
          if (cartItem.id.startsWith('prod-') || cartItem.id.startsWith('fert-')) {
            cartChanged = true;
            const cleanId = cartItem.id.replace(/^(prod-|fert-)/, '');
            console.log("🧹 Cleaning cart item ID:", cartItem.id, "→", cleanId);
            return { ...cartItem, id: cleanId };
          }
          return cartItem;
        });
        
        // Filter out items that don't match any products
        const validCart = cleanCart.filter(cartItem => 
          items.some(product => product.id === cartItem.id)
        );
        
        if (cartChanged || validCart.length !== cart.length) {
          console.log("🧹 Cart cleanup completed");
          console.log("📦 Before cleanup:", cart.map(c => c.id));
          console.log("✅ After cleanup:", validCart.map(c => c.id));
          localStorage.setItem("krushee_cart", JSON.stringify(validCart));
          window.dispatchEvent(new Event("storage"));
        }
      } catch (error) {
        console.log("Cart cleanup error:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchPurchases = async () => {
      const items = await getPurchasesByUser(user.uid);
      setPurchases(items);
    };
    fetchPurchases();
  }, [user]);

  const register = async (name, email, password, role) => {
    try {
      await registerService(name, email, password, role);
      return true;
    } catch {
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      await loginService(email, password);
      // wait briefly for auth state to update via getCurrentUser listener
      const firebaseUser = await new Promise((resolve) => {
        const unsubscribe = getCurrentUser((u) => {
          try {
            unsubscribe();
          } catch {}
          resolve(u);
        });
        // timeout fallback after 2s
        setTimeout(() => {
          try {
            unsubscribe();
          } catch {}
          resolve(null);
        }, 2000);
      });

      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          const merged = userData
            ? { ...userData, email: firebaseUser.email, uid: firebaseUser.uid }
            : { email: firebaseUser.email, uid: firebaseUser.uid };
          setUser(merged);
          return { success: true, role: userData?.role || "user" };
        } catch {
          // if getUserData fails, still return success with default role
          return { success: true, role: "user" };
        }
      }
      // fallback: success but unknown role
      return { success: true, role: "user" };
    } catch {
      return { success: false };
    }
  };

  const logout = async () => {
    await logoutService();
    // clear in-memory state
    setUser(null);
    setProducts([]);
    setPurchases([]);
    // remove client-side persisted data used by the app
    try {
      const keys = [
        "krushee_cart",
        "krushee_addresses",
        "krushee_wishlist",
        "krushee_coupons",
        "krushee_cards",
      ];
      keys.forEach((k) => localStorage.removeItem(k));
      // notify other windows/components
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      /* ignore storage errors */
    }
  };

  const addProduct = async (product) => {
    await addProductService(product);
    const items = await getProducts();
    setProducts(items);
  };

  const purchaseProduct = async (productId, quantity, additionalData = {}) => {
    console.log("🔄 AuthContext: purchaseProduct called with productId:", productId, "quantity:", quantity, "additionalData:", additionalData);
    console.log("🔍 AuthContext: Payment method from additionalData:", additionalData.paymentMethod);
    
    try {
      // Check if user is logged in
      if (!user) {
        console.error("❌ AuthContext: No user logged in");
        throw new Error("Please login to purchase");
      }
      
      console.log("✅ AuthContext: User verified:", user.uid);
      
      // Check if products are loaded, if not try to fetch them
      let currentProducts = products;
      if (!currentProducts || currentProducts.length === 0) {
        console.warn("⚠️ AuthContext: Products not loaded, attempting to fetch...");
        try {
          const { getProducts } = await import("../services/productService");
          currentProducts = await getProducts();
          console.log("✅ AuthContext: Fresh products fetched:", currentProducts.length);
          setProducts(currentProducts); // Update state for future use
        } catch (fetchError) {
          console.error("❌ AuthContext: Failed to fetch products:", fetchError);
          throw new Error("Unable to load products. Please refresh the page and try again.");
        }
        
        // Check again after fetch attempt
        if (!currentProducts || currentProducts.length === 0) {
          console.error("❌ AuthContext: Products still not loaded after fetch attempt");
          throw new Error("Products not available. Please refresh the page and try again.");
        }
      }
      
      console.log("✅ AuthContext: Products available, count:", currentProducts.length);
      console.log("🔍 AuthContext: Looking for product with ID:", productId, "Type:", typeof productId);
      console.log("🔍 AuthContext: Available product IDs:", currentProducts.map(p => ({id: p.id, type: typeof p.id, name: p.name})));
      
      // Find the product by exact ID match
      let product = currentProducts.find((p) => p.id === productId);
      
      // If not found, try string comparison in case of type mismatch
      if (!product) {
        console.warn("⚠️ AuthContext: Product not found with exact match, trying string comparison...");
        product = currentProducts.find((p) => String(p.id) === String(productId));
      }
      
      if (!product) {
        console.error("❌ AuthContext: Product not found. ProductId:", productId);
        console.error("❌ Available products:", currentProducts.map(p => ({id: p.id, name: p.name || p.title})));
        console.error("❌ Searching for product with ID:", productId, "Type:", typeof productId);
        console.error("❌ Available product IDs:", currentProducts.map(p => ({id: p.id, type: typeof p.id})));
        throw new Error("Product not found");
      }
      
      console.log("✅ AuthContext: Product found:", product);
      console.log("🔍 AuthContext: Product fields available:", Object.keys(product));
      console.log("🔍 AuthContext: Product type field:", product.type, product.category, product.productType);
      
      // Check stock
      if (product.stock < quantity) {
        console.error("❌ AuthContext: Insufficient stock. Required:", quantity, "Available:", product.stock);
        throw new Error("Insufficient stock");
      }
      
      console.log("✅ AuthContext: Stock verified");
      
      // Get user data for order
      console.log("🔄 AuthContext: Getting user data...");
      const userData = await getUserData(user.uid);
      console.log("✅ AuthContext: User data retrieved:", userData);
      
      // Determine the correct product type from available fields
      const productType = product.type || product.category || product.productType || 'product';
      console.log("✅ AuthContext: Using productType:", productType);
      
      console.log("🔄 AuthContext: Calling purchaseProductService...");
      await purchaseProductService(
        user.uid,
        productId,
        quantity,
        product.price * quantity,
        product.name,
        {
          productType: additionalData.productType || productType,
          customerName: additionalData.customerName || userData?.name || user.displayName || '',
          customerEmail: additionalData.customerEmail || userData?.email || user.email || '',
          customerPhone: additionalData.customerPhone || userData?.phone || '',
          customerAddress: additionalData.customerAddress || userData?.address || '',
          paymentMethod: additionalData.paymentMethod || 'Cash on Delivery',
          paymentStatus: additionalData.paymentStatus || 'Completed'
        }
      );
      console.log("✅ AuthContext: Purchase service completed successfully");
      
      // Update stock
      console.log("🔄 AuthContext: Updating stock...");
      const newStock = product.stock - quantity;
      const { updateDoc, doc, addDoc, collection, serverTimestamp } =
        await import("firebase/firestore");
      await updateDoc(doc(db, "products", productId), { stock: newStock });
      console.log("✅ AuthContext: Stock updated from", product.stock, "to", newStock);
      
      // Add revenue
      console.log("🔄 AuthContext: Adding revenue record...");
      await addDoc(collection(db, "revenue"), {
        amount: product.price * quantity,
        productId,
        quantity,
        userId: user.uid,
        date: serverTimestamp(),
      });
      console.log("✅ AuthContext: Revenue record added:", product.price * quantity);
      
      // Update local state
      const items = await getPurchasesByUser(user.uid);
      setPurchases(items);
      setProducts(
        currentProducts.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      
      console.log("🎉 AuthContext: Purchase process completed successfully");
      
    } catch (error) {
      console.error("💥 AuthContext: Purchase failed with error:", error);
      console.error("💥 Error details:", error.message, error.stack);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        products,
        purchases,
        authReady,
        login,
        register,
        logout,
        addProduct,
        purchaseProduct,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

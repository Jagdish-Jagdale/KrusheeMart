import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  // Function to get cart items from localStorage
  const getCartItems = () => {
    try {
      const cartData = localStorage.getItem("krushee_cart");
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error("Error reading cart data:", error);
      return [];
    }
  };

  // Function to calculate total cart count
  const updateCartCount = () => {
    const cartItems = getCartItems();
    const totalCount = cartItems.reduce((total, item) => total + (item.qty || 0), 0);
    setCartCount(totalCount);
  };

  // Update cart count on component mount
  useEffect(() => {
    updateCartCount();
  }, []);

  // Listen for storage changes to update cart count
  useEffect(() => {
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg animate-fade-in">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🌾 KrusheeMart</h1>
            <span className="text-sm bg-green-800 px-3 py-1 rounded-full">
              Farmer Portal
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-sm">Welcome, {user?.name}!</span>
            
            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              className="relative flex items-center gap-2 bg-green-800 hover:bg-green-900 px-4 py-2 rounded-lg transition-all"
            >
              <FiShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;

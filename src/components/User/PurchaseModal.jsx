import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const PurchaseModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [address, setAddress] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { purchaseProduct } = useAuth();

  const handlePurchase = async () => {
    setLoading(true);
    setError("");
    
    try {
      const additionalData = {
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Completed",
        customerAddress: address,
        productType: product.category
      };
      
      console.log("🔍 PurchaseModal: Payment method selected:", paymentMethod);
      console.log("🔍 PurchaseModal: Additional data being sent:", additionalData);
      
      await purchaseProduct(product.id, quantity, additionalData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err.message || "Failed to complete purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-8 max-w-md w-full animate-slide-in">
        {!success ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Purchase {product.name}
            </h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{product.price} per unit
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="input-field"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="UPI">UPI</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows="3"
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  ₹{product.price * quantity}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">
                  ₹{product.price * quantity}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onClose} 
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase} 
                className="btn-primary flex-1"
                disabled={loading || quantity > product.stock}
              >
                {loading ? "Processing..." : "Confirm Purchase"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center animate-bounce-slow">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-600">
              Purchase Successful!
            </h3>
            <p className="text-gray-600 mt-2">Thank you for your order</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseModal;

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PurchaseModal from "./PurchaseModal";
import { FiShoppingCart, FiHeart, FiEye } from "react-icons/fi";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const ProductList = () => {
  const { products, user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const { categorySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to convert slug back to category name
  const slugToCategory = (slug) => {
    if (!slug) return null;
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Set initial filter based on category slug
  useEffect(() => {
    if (categorySlug) {
      const categoryName = slugToCategory(categorySlug);
      setFilter(categoryName.toLowerCase());
    } else {
      setFilter("all");
    }
  }, [categorySlug]);

  const filteredProducts = (() => {
    if (filter === "all") return products;
    
    // If we have a category slug, filter by that category
    if (categorySlug) {
      const categoryName = slugToCategory(categorySlug);
      return products.filter((p) => {
        const productCategory = p.category || p.type || '';
        return productCategory.toLowerCase().includes(categoryName.toLowerCase()) ||
               productCategory.toLowerCase() === categoryName.toLowerCase();
      });
    }
    
    // Otherwise filter by type (for pesticide/equipment buttons)
    return products.filter((p) => p.type === filter);
  })();

  // Add to cart using localStorage (similar to LandingPage)
  const handleAddToCart = (product) => {
    try {
      const raw = localStorage.getItem("krushee_cart") || "[]";
      const currentCart = JSON.parse(raw);
      
      const existingItemIndex = currentCart.findIndex((item) => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Item already exists, increase quantity
        currentCart[existingItemIndex].qty = (currentCart[existingItemIndex].qty || 0) + 1;
      } else {
        // Add new item to cart
        currentCart.push({
          id: product.id,
          name: product.name,
          image: product.image || product.imageUrl,
          price: product.price,
          mrp: product.mrp,
          discountPrice: product.discountPrice,
          qty: 1,
        });
      }
      
      localStorage.setItem("krushee_cart", JSON.stringify(currentCart));
      // Notify other components about cart update
      window.dispatchEvent(new Event("storage"));
      
      setSnackbarMsg(`${product.name} added to cart!`);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackbarMsg("Failed to add item to cart");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    }
  };

  // Handle Buy Now - navigate to payment page
  const handleBuyNow = (product) => {
    navigate('/payment', {
      state: {
        product: {
          id: product.id,
          name: product.name,
          image: product.image || product.imageUrl,
          price: product.price,
          mrp: product.mrp,
          discountPrice: product.discountPrice
        },
        quantity: 1,
        fromBuyNow: true
      }
    });
  };

  const getProductImage = (product) => {
    return product.image || "https://via.placeholder.com/300x200?text=No+Image";
  };

  const getDiscountPercentage = (mrp, price) => {
    if (!mrp || !price || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 mb-8">
        <div className="container mx-auto px-4">
          {categorySlug ? (
            <>
              <h1 className="text-4xl font-bold mb-2">
                🌾 {slugToCategory(categorySlug)} Products
              </h1>
              <p className="text-green-100 text-lg">
                Explore our {slugToCategory(categorySlug).toLowerCase()} collection for your farming needs
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-2">🌾 Available Products</h1>
              <p className="text-green-100 text-lg">Discover quality agricultural products for your farming needs</p>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Breadcrumb Navigation */}
        {categorySlug && (
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <a href="/" className="hover:text-green-600">Home</a>
              <span>›</span>
              <span className="text-green-600 font-medium">{slugToCategory(categorySlug)}</span>
            </nav>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {categorySlug ? `Filter ${slugToCategory(categorySlug)} Products` : 'Filter Products'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-full transition-all font-medium ${
                filter === "all"
                  ? "bg-green-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              🌾 All {categorySlug ? slugToCategory(categorySlug) : 'Products'}
            </button>
            {!categorySlug && (
              <>
                <button
                  onClick={() => setFilter("pesticide")}
                  className={`px-6 py-3 rounded-full transition-all font-medium ${
                    filter === "pesticide"
                      ? "bg-green-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                  }`}
                >
                  🧪 Pesticides
                </button>
                <button
                  onClick={() => setFilter("equipment")}
                  className={`px-6 py-3 rounded-full transition-all font-medium ${
                    filter === "equipment"
                      ? "bg-green-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                  }`}
                >
                  🚜 Equipment
                </button>
              </>
            )}
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-green-600">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredProducts.map((product) => {
            const discountPercent = getDiscountPercentage(product.mrp, product.price);
            return (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{discountPercent}% OFF
                    </div>
                  )}
                  {/* Product Type Badge */}
                  <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {product.type === "pesticide" ? "🧪 Pesticide" : "🚜 Equipment"}
                  </div>
                  {/* Stock Status */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Product Category */}
                  <p className="text-sm text-green-600 font-medium mb-2">
                    {product.category || product.type}
                  </p>

                  {/* Product Description */}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description || product.overview || product.benefits || "Quality agricultural product"}
                  </p>

                  {/* Price Section */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">
                          ₹{product.price}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock > 0 ? product.stock : 'Out of stock'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all font-medium ${
                        product.stock > 0
                          ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 py-2 px-3 rounded-lg transition-all font-medium ${
                        product.stock > 0
                          ? "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {categorySlug 
                ? `No ${slugToCategory(categorySlug).toLowerCase()} products found`
                : 'No products found'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {categorySlug
                ? `We don't have any ${slugToCategory(categorySlug).toLowerCase()} products available right now.`
                : "We couldn't find any products matching your criteria."
              }
            </p>
            <button
              onClick={() => setFilter("all")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all"
            >
              {categorySlug ? `View All ${slugToCategory(categorySlug)} Products` : 'View All Products'}
            </button>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedProduct && (
        <PurchaseModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Snackbar Notification */}
      {showSnackbar && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <FiShoppingCart className="w-4 h-4" />
            {snackbarMsg}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;



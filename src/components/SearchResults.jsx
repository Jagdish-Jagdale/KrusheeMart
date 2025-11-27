import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { purchaseProduct } = useAuth();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        setSearchPerformed(false);
        return;
      }

      setLoading(true);
      setSearchPerformed(true);

      try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        
        const allProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || doc.data().productName,
          image: doc.data().image || doc.data().imageUrl,
          price: doc.data().price || doc.data().sellingPrice,
          mrp: doc.data().mrp || doc.data().originalPrice
        }));

        // Filter products based on search query (case-insensitive)
        const searchTerm = query.toLowerCase();
        const filteredProducts = allProducts.filter(product => {
          const name = (product.name || '').toLowerCase();
          const category = (product.category || '').toLowerCase();
          const type = (product.type || '').toLowerCase();
          const description = (product.description || '').toLowerCase();
          
          return name.includes(searchTerm) || 
                 category.includes(searchTerm) || 
                 type.includes(searchTerm) ||
                 description.includes(searchTerm);
        });

        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error searching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  const addToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("krushee_cart") || "[]");
      const existingIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        cart[existingIndex].qty += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.discountPrice || product.price,
          mrp: product.price,
          discountPrice: product.discountPrice,
          qty: 1
        });
      }
      
      localStorage.setItem("krushee_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const buyNow = (product) => {
    // Navigate to payment page with product data
    navigate('/payment', {
      state: {
        product: {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.discountPrice || product.price,
          mrp: product.mrp,
          discountPrice: product.discountPrice
        },
        quantity: 1,
        fromBuyNow: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          {query && (
            <p className="text-gray-600 mt-2">
              {searchPerformed ? (
                loading ? 
                  'Searching...' : 
                  `${products.length} result${products.length !== 1 ? 's' : ''} found for "${query}"`
              ) : (
                `Search for "${query}"`
              )}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* No Query State */}
        {!query && !loading && (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-2">Enter a search term</div>
            <div className="text-gray-400 text-sm">
              Search for products, brands, or categories
            </div>
          </div>
        )}

        {/* No Results State */}
        {query && !loading && products.length === 0 && searchPerformed && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-gray-700 text-xl mb-2 font-semibold">
              Product Not Found
            </div>
            <div className="text-gray-500 mb-4">
              We couldn't find any products matching "{query}"
            </div>
            <div className="text-gray-400 text-sm mb-6">
              Try searching with different keywords or browse our categories
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Browse All Products
            </button>
          </div>
        )}

        {/* Results Grid */}
        {products.length > 0 && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
                <div className="aspect-square mb-4 overflow-hidden rounded-md">
                  <img
                    src={product.image || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-full object-contain bg-gray-50"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.png';
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.discountPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{product.price}
                    </div>
                  )}
                  
                  <div className="text-lg font-bold text-emerald-600">
                    ₹{product.discountPrice || product.price}
                  </div>

                  {product.category && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                      {product.category}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => buyNow(product)}
                      className="flex-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
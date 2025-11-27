import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/martlogo.png";
import { FiShoppingCart, FiUser, FiSearch } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // read cart count from localStorage key: krushee_cart (if present)
  useEffect(() => {
    function updateCount() {
      try {
        const raw = localStorage.getItem("krushee_cart");
        const arr = raw ? JSON.parse(raw) : [];
        const c = arr.reduce((s, it) => s + (it.qty || 0), 0);
        setCartCount(c);
      } catch {
        setCartCount(0);
      }
    }
    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-6">
        <Link to="/" aria-label="home" className="flex items-center gap-3">
          <img
            src={logo}
            alt="KrusheeMart"
            className="w-28 h-10 object-contain"
          />
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-gray-800">
              KrusheeMart
            </div>
            <div className="text-xs text-gray-500">Agri inputs & support</div>
          </div>
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiSearch className="w-5 h-5" />
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
                placeholder="Search products, brands or tips..."
                className="w-full rounded-full pl-11 pr-4 py-2 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </form>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/cart")}
            aria-label="Cart"
            className="relative p-2 rounded-md hover:bg-gray-100 transition"
          >
            <FiShoppingCart className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          <div className="relative" ref={ref}>
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow"
              aria-haspopup="true"
            >
              <FiUser className="w-5 h-5 text-gray-700" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-12 w-44 bg-white rounded-md shadow-lg py-2 z-40">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Link>
                {user ? (
                  <button
                    onClick={async () => {
                      await logout();
                      setProfileOpen(false);
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

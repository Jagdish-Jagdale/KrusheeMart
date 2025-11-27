import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [popupExiting, setPopupExiting] = useState(false);
  const autoDismissTimer = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear form fields when component mounts to ensure clean forms
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
    setFieldErrors({});
  }, []);

  useEffect(() => {
    if (showPopup) {
      autoDismissTimer.current = setTimeout(() => {
        setPopupExiting(true);
        autoDismissTimer.current = setTimeout(() => {
          setShowPopup(false);
          setPopupExiting(false);
          setError("");
        }, 350); // match exit animation duration
      }, 3000);
      return () => {
        if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
      };
    }
  }, [showPopup]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors).join(" | "));
      setShowPopup(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    const result = await login(email, password);
    if (result && result.success) {
      if (result.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); // regular user
      }
    } else {
      setError("Invalid email or password");
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    setPopupExiting(true);
    setTimeout(() => {
      setShowPopup(false);
      setPopupExiting(false);
      setError("");
    }, 350);
  };

  return (
    // soft smooth green page background
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] relative">
      {showPopup && (
        <div
          className={`fixed top-6 right-6 z-50 ${
            popupExiting ? "animate-slide-out-right" : "animate-slide-in-right"
          }`}
        >
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center backdrop-blur-md">
            <span className="mr-4">{error}</span>
            <button
              type="button"
              onClick={handleClosePopup}
              className="ml-2 text-white font-bold text-xl focus:outline-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl px-8 py-10 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-2 flex items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl font-bold text-green-600">🌾</span>
          </div>
          <h1 className="text-3xl font-extrabold text-green-600 mb-1 tracking-tight">
            KrusheeMart
          </h1>
          <h2 className="text-lg font-medium text-gray-700">
            Sign in to your account
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all`}
              placeholder="Enter your email"
              autoComplete="new-email"
              autoFocus={false}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all`}
              placeholder="Enter your password"
              autoComplete="new-password"
              autoFocus={false}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow transition-all"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-600 hover:underline font-semibold"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

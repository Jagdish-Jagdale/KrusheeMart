import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../Sidebar";
import { AiOutlineHome } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import {
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiBell,
  FiLogOut,
} from "react-icons/fi";

export default function AdminLayout() {
  const { user, authReady, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  if (!authReady)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  if (!user || user.role !== "admin") return null;

  const nav = [
    { to: "/admin", label: "Dashboard", end: true, icon: <AiOutlineHome /> },
    { to: "/admin/add-product", label: "Add Product", icon: <BsBoxSeam /> },
    {
      to: "/admin/manage-customers",
      label: "Manage Customers",
      icon: <FiUsers />,
    },
    { to: "/admin/reports", label: "Reports", icon: <FiBarChart2 /> },
    { to: "/admin/revenue", label: "Revenue", icon: <span className="font-bold text-lg">₹</span> },
    { to: "/admin/settings", label: "Settings", icon: <FiSettings /> },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar
        items={nav}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={(v) => setSidebarCollapsed(v)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0">
        <header className="h-16 md:h-17 bg-white border-b border-gray-100 flex items-center px-4 md:px-6 justify-between shadow-sm relative">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg
                className="w-5 h-5 text-slate-700"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4 text-sm text-slate-600 relative">
            {/* Profile circle button */}
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
              aria-label="Profile menu"
            >
              <FiUser className="w-4 h-4 text-blue-600" />
            </button>
            <div className="hidden md:block">{user?.email}</div>

            {/* Profile submenu */}
            {profileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      // Placeholder for notifications
                      alert("Notifications clicked");
                      setProfileMenuOpen(false);
                    }}
                  >
                    <FiBell className="w-4 h-4" />
                    Notifications
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      logout();
                      navigate("/login");
                      setProfileMenuOpen(false);
                    }}
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-4 md:p-6 bg-slate-50 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-68px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

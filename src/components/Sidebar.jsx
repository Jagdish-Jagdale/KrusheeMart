import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiImage, FiTag } from "react-icons/fi";
import adminlogo from "../assets/adminlogo.png";
export default function Sidebar({
  items = [],
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      {/* desktop sidebar: soft white gradient */}
      <aside
        className={`hidden md:flex flex-shrink-0 flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-56"
        } h-screen sticky top-0 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 border-r border-gray-100 shadow-sm relative`}
      >
        <div className="h-20 md:h-25 flex items-center px-3 md:px-4 py-3 md:py-4">
          {/* logo - always visible (even when collapsed) */}
          <img
            src={adminlogo}
            alt="Krushee logo"
            className={` my-3 md:my-5 rounded-md object-cover transition-all ${
              collapsed
                ? "w-16 h-16 md:w-24 md:h-24 mx-auto"
                : "w-50 h-30 md:w-70 md:h-45"
            }`}
          />
          <div
            className={`ml-2 md:ml-3 ${
              collapsed ? "opacity-0" : "opacity-100"
            } transition-opacity`}
          ></div>
        </div>

        {/* increased top margin to add gap between logo/header and first nav item */}
        <nav className="mt-6 md:mt-8 px-2 space-y-1">
          {items.map((it) =>
            it.label !== "Settings" ? (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                      : "text-slate-700 hover:text-blue-500 hover:bg-blue-100 font-medium"
                  }`
                }
              >
                <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md bg-white/40 text-slate-700">
                  {it.icon || "🔹"}
                </div>
                <span
                  className={`${
                    collapsed ? "hidden" : "block"
                  } text-sm md:text-base`}
                >
                  {it.label}
                </span>
              </NavLink>
            ) : (
              // Settings with submenu
              <div key={it.to} className="relative">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((v) => !v)}
                  className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg transition-colors duration-200 ${
                    window.location.pathname.startsWith(it.to) ||
                    window.location.pathname === "/admin/add-category" ||
                    window.location.pathname === "/admin/add-banner" ||
                    window.location.pathname === "/admin/add-brand"
                      ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                      : "text-slate-700 hover:text-blue-500 hover:bg-blue-100 font-medium"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={settingsOpen}
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md bg-white/40 text-slate-700">
                    {it.icon || "🔹"}
                  </div>
                  <span
                    className={`${
                      collapsed ? "hidden" : "block"
                    } text-sm md:text-base`}
                  >
                    {it.label}
                  </span>
                  <svg
                    className={`w-3 h-3 md:w-4 md:h-4 ml-auto transition-transform ${
                      settingsOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M6 8l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {/* Submenu items as indented list */}
                {settingsOpen && (
                  <div className="ml-4 md:ml-6 mt-1 space-y-1">
                    <button
                      className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg transition-colors duration-200 ${
                        window.location.pathname === "/admin/add-category"
                          ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                          : "text-slate-700 hover:text-blue-500 hover:bg-blue-100 font-medium"
                      }`}
                      onClick={() => {
                        setSettingsOpen(false);
                        navigate("/admin/add-category");
                      }}
                    >
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md bg-white/40 text-slate-700">
                        +
                      </div>
                      <span
                        className={`${
                          collapsed ? "hidden" : "block"
                        } text-sm md:text-base`}
                      >
                        Add Category
                      </span>
                    </button>
                    <button
                      className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg transition-colors duration-200 ${
                        window.location.pathname === "/admin/add-banner"
                          ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                          : "text-slate-700 hover:text-blue-500 hover:bg-blue-100 font-medium"
                      }`}
                      onClick={() => {
                        setSettingsOpen(false);
                        navigate("/admin/add-banner");
                      }}
                    >
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md bg-white/40 text-slate-700">
                        <FiImage />
                      </div>
                      <span
                        className={`${
                          collapsed ? "hidden" : "block"
                        } text-sm md:text-base`}
                      >
                        Add Banner
                      </span>
                    </button>
                    <button
                      className={`w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg transition-colors duration-200 ${
                        window.location.pathname === "/admin/add-brand"
                          ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                          : "text-slate-700 hover:text-blue-500 hover:bg-blue-100 font-medium"
                      }`}
                      onClick={() => {
                        setSettingsOpen(false);
                        navigate("/admin/add-brand");
                      }}
                    >
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-md bg-white/40 text-slate-700">
                        <FiTag />
                      </div>
                      <span
                        className={`${
                          collapsed ? "hidden" : "block"
                        } text-sm md:text-base`}
                      >
                        Add Brand
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </nav>

        {/* desktop-only toggle: always fixed at top right outside sidebar */}
        <div
          className="hidden md:flex items-center justify-center"
          style={{
            position: "absolute",
            top: "1rem", // top-16
            right: "-18px", // -right-5
            zIndex: 50,
          }}
        >
          <button
            onClick={() => onToggle && onToggle(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 hover:bg-slate-50 text-slate-700"
          >
            {collapsed ? (
              <FiChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <FiChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
        </div>

        <div className="mt-auto px-2 md:px-3 py-3 md:py-4 text-xs text-slate-400">
          <div className={`${collapsed ? "hidden" : ""}`}>
            © {new Date().getFullYear()} Krushee
          </div>
        </div>
      </aside>

      {/* mobile overlay sidebar */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => onCloseMobile && onCloseMobile()}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white text-slate-800 shadow-sm transform transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-25 flex items-center px-4 border-b border-gray-100">
            {/* mobile header with logo */}
            <img
              src={adminlogo}
              alt="Krushee logo"
              className="w-95 h-35 rounded-md object-cover"
            />
            <button
              onClick={() => onCloseMobile && onCloseMobile()}
              className="ml-auto p-1 rounded bg-slate-100 hover:bg-slate-200"
            >
              ✕
            </button>
          </div>

          {/* slightly larger top margin for mobile nav too */}
          <nav className="p-3 mt-5 space-y-1 overflow-y-auto h-full">
            {items.map((it) =>
              it.label !== "Settings" ? (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  onClick={() => onCloseMobile && onCloseMobile()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-md transition ${
                      isActive
                        ? "bg-slate-50 text-blue-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`
                  }
                >
                  <span className="w-7 h-7 flex items-center justify-center text-lg">
                    {it.icon || "🔹"}
                  </span>
                  <span className="truncate text-base">{it.label}</span>
                </NavLink>
              ) : (
                // Settings with submenu for mobile
                <div key={it.to} className="relative">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen((v) => !v)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition ${
                      window.location.pathname.startsWith(it.to) ||
                      window.location.pathname === "/admin/add-category" ||
                      window.location.pathname === "/admin/add-banner" ||
                      window.location.pathname === "/admin/add-brand"
                        ? "bg-slate-50 text-blue-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="w-7 h-7 flex items-center justify-center text-lg">
                      {it.icon || "🔹"}
                    </span>
                    <span className="truncate">{it.label}</span>
                    <svg
                      className={`w-4 h-4 ml-auto transition-transform ${
                        settingsOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M6 8l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {/* Submenu items for mobile */}
                  {settingsOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition ${
                          window.location.pathname === "/admin/add-category"
                            ? "bg-slate-50 text-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          setSettingsOpen(false);
                          onCloseMobile && onCloseMobile();
                          navigate("/admin/add-category");
                        }}
                      >
                        <span className="w-5 h-5 flex items-center justify-center text-lg">
                          +
                        </span>
                        <span className="truncate text-base">Add Category</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition ${
                          window.location.pathname === "/admin/add-banner"
                            ? "bg-slate-50 text-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          setSettingsOpen(false);
                          onCloseMobile && onCloseMobile();
                          navigate("/admin/add-banner");
                        }}
                      >
                        <span className="w-5 h-5 flex items-center justify-center text-lg">
                          <FiImage />
                        </span>
                        <span className="truncate text-base">Add Banner</span>
                      </button>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition ${
                          window.location.pathname === "/admin/add-brand"
                            ? "bg-slate-50 text-blue-600"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          setSettingsOpen(false);
                          onCloseMobile && onCloseMobile();
                          navigate("/admin/add-brand");
                        }}
                      >
                        <span className="w-5 h-5 flex items-center justify-center text-lg">
                          <FiTag />
                        </span>
                        <span className="truncate text-base">Add Brand</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

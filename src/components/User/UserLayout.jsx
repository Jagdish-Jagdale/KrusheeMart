import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserNavbar from "./UserNavbar";

const UserLayout = () => {
  const { user } = useAuth();

  if (!user || user.role !== "user") {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <UserNavbar />
      <div className="container mx-auto px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;

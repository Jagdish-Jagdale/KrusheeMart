import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function UserDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back
      </button>
      <h1 className="text-2xl font-bold">User Details</h1>
      <div className="bg-white p-4 rounded shadow">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Password:</strong> {user.password || "N/A"}
        </p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Purchase History</h2>
        {user.purchases?.length > 0 ? (
          <ul className="list-disc pl-5">
            {user.purchases.map((purchase, index) => (
              <li key={index}>
                {purchase.productName} - Quantity: {purchase.quantity} - Date:{" "}
                {new Date(purchase.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No purchases found.</p>
        )}
      </div>
    </div>
  );
}

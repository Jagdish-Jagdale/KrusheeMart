import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AddPesticide = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [success, setSuccess] = useState(false);
  const { addProduct } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    addProduct({
      name,
      type: "pesticide",
      price: parseFloat(price),
      description,
      stock: parseInt(stock),
    });

    setSuccess(true);
    setName("");
    setPrice("");
    setDescription("");
    setStock("");

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Add New Pesticide 🧪
      </h1>

      <div className="card max-w-2xl">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 animate-bounce-slow">
            Pesticide added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Pesticide Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              rows={4}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Add Pesticide
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPesticide;

import React, { useEffect, useState } from "react";

export default function Settings() {
  const [siteName, setSiteName] = useState("KrusheeMart");
  const [maintenance, setMaintenance] = useState(false);

  // categories state (persisted)
  const [categories, setCategories] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // <-- Remove the '+' at the start

  useEffect(() => {
    try {
      const cur = JSON.parse(
        localStorage.getItem("krushee_categories") || "[]"
      );
      setCategories(cur);
    } catch {
      setCategories([]);
    }
  }, []);

  const persistCategories = (next) => {
    localStorage.setItem("krushee_categories", JSON.stringify(next));
    setCategories(next);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const next = [...categories, { id: Date.now(), name: newCategory.trim() }];
    persistCategories(next);
    setNewCategory("");
    setShowAdd(false);
  };

  const handleRemove = (id) => {
    const next = categories.filter((c) => c.id !== id);
    persistCategories(next);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="text-sm text-slate-500">
            Configure site and manage categories.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded">Reset</button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded">
            Save
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Site name</label>
            <input
              className="p-3 border rounded w-full mt-2"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">
              Maintenance mode
            </label>
            <div className="mt-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={(e) => setMaintenance(e.target.checked)}
                />
                <span className="text-sm">Enable maintenance mode</span>
              </label>
            </div>
          </div>
        </div>

        {/* Category management */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Categories</h3>
            <div className="flex gap-2 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded text-sm"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded"
              >
                Add category
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-md border">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-6 text-center text-sm text-gray-500"
                    >
                      No categories added
                    </td>
                  </tr>
                )}
                {categories.map((c, i) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-3 px-3 text-sm">{i + 1}</td>
                    <td className="py-3 px-3 text-sm">{c.name}</td>
                    <td className="py-3 px-3 text-sm">
                      <button
                        onClick={() => handleRemove(c.id)}
                        className="px-3 py-1 border rounded text-sm text-rose-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add category modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAdd(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add category</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-sm text-gray-600">Category name</label>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2 border rounded mt-2"
                placeholder="e.g. Fertilizers"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

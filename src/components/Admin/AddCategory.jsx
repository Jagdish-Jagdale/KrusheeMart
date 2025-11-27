import React, { useEffect, useState, useMemo, useCallback } from "react";
import ReactDOM from "react-dom"; // added for portal
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  FiEdit,
  FiTrash,
  FiPlus,
  FiUpload,
  FiLink,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
  FiFilter, // added
} from "react-icons/fi";

export default function AddCategory() {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({
    no: "",
    name: "",
    image: "",
    imageType: "url",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // "name" or "no"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [categoryNo, setCategoryNo] = useState(""); // for add modal
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const categoryList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCategoryNo = () => {
    const nextId = categories.length + 1;
    return `CAT-${String(nextId).padStart(3, "0")}`;
  };

  const resetForm = () => {
    setFormData({
      no: "",
      name: "",
      image: "",
      imageType: "url",
    });
    setCategoryNo("");
    setSelectedFileName("");
    setEditCategory(null);
  };

  const handleAddCategory = () => {
    setCategoryNo(generateCategoryNo());
    setShowAddModal(true);
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setFormData({
      no: category.no,
      name: category.name,
      image: category.image || "",
      imageType: category.image?.startsWith("data:") ? "upload" : "url",
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Category Name is required.");
      return;
    }
    if (formData.imageType === "url" && !formData.image.trim()) {
      alert("Please enter an image URL.");
      return;
    }
    if (formData.imageType === "upload" && !formData.image) {
      alert("Please select an image file.");
      return;
    }

    setSubmitting(true);
    try {
      const categoryData = {
        no: editCategory ? formData.no : categoryNo,
        name: formData.name.trim(),
        image: formData.image,
        createdAt: new Date(),
      };

      if (editCategory) {
        await updateDoc(doc(db, "categories", editCategory.id), categoryData);
      } else {
        await addDoc(collection(db, "categories"), categoryData);
      }

      setShowAddModal(false);
      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteDoc(doc(db, "categories", id));
        setCategories(categories.filter((c) => c.id !== id));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Error deleting category. Please try again.");
      }
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log("File selected:", file); // Debug log
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        console.log("File loaded, setting image data"); // Debug log
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
          imageType: "upload",
        }));
      };
      reader.onerror = () => {
        console.error("Error reading file"); // Debug log
        alert("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFileName("");
      setFormData((prev) => ({
        ...prev,
        image: "",
      }));
    }
  }, []);

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  // Filtered and sorted categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.no.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered.sort((a, b) => {
      const aVal = sortBy === "name" ? a.name : a.no;
      const bVal = sortBy === "name" ? b.name : b.no;
      if (sortOrder === "asc") {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
    return filtered;
  }, [categories, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedCategories.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredAndSortedCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Modal helper: portals overlay to document.body so backdrop covers full viewport
  const Modal = ({ children, onClose }) => {
    if (typeof document === "undefined") return null;
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />
        <div
          className="relative z-10 w-full max-w-sm md:max-w-md lg:max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  };

  // cycle sort: Name asc -> Name desc -> No asc -> No desc -> Name asc ...
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === "name-asc") {
      setSortBy("name");
      setSortOrder("asc");
    } else if (value === "name-desc") {
      setSortBy("name");
      setSortOrder("desc");
    } else if (value === "no-asc") {
      setSortBy("no");
      setSortOrder("asc");
    } else if (value === "no-desc") {
      setSortBy("no");
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-slate-200">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-slate-800">Loading Categories...</div>
          <div className="text-sm text-slate-500">Fetching category data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            Add Category
          </h2>
          <p className="text-sm text-slate-500">Manage product categories.</p>
        </div>
      </div>

      {success && (
        <div className="bg-slate-100 border border-slate-200 text-slate-800 px-4 py-3 rounded mb-4">
          Category {editCategory ? "updated" : "added"} successfully!
        </div>
      )}

      {/* Filters and Search outside table */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
        <div className="flex items-center gap-4 w-full">
          {/* search grows to fill available space */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-300 w-full"
            />
          </div>
          {/* sort dropdown */}
          <select
            onChange={handleSortChange}
            className="p-2 border border-slate-200 rounded bg-white text-slate-700 hover:bg-slate-50"
            title="Sort options"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="no-asc">Category A-Z</option>
            <option value="no-desc">Category Z-A</option>
          </select>
        </div>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 w-full md:w-auto lg:w-56 justify-center"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-50 rounded-xl shadow-sm p-4 md:p-6 border border-slate-100">
        <div className="overflow-x-auto">
          {/* rounded header: wrapper with overflow-hidden so the thead bg shows rounded top corners */}
          <div className="rounded-t-xl overflow-hidden">
            <table className="w-full text-left table-auto border-collapse">
              <thead className="bg-slate-300 text-slate-700">
                <tr className="text-sm">
                  <th className="px-4 md:px-6 py-4 text-center align-middle">
                    Sr No
                  </th>
                  <th className="px-4 md:px-6 py-4 text-center align-middle">
                    Category No
                  </th>
                  <th className="px-4 md:px-6 py-4 text-center align-middle">
                    Name
                  </th>
                  <th className="px-4 md:px-6 py-4 text-center align-middle">
                    Image
                  </th>
                  <th className="px-4 md:px-6 py-4 text-center align-middle">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category, i) => (
                  <tr
                    key={category.id}
                    className="border-b border-gray-200 hover:bg-slate-50"
                  >
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      {startIndex + i + 1}
                    </td>
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      <span className="inline-block bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                        {category.no}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      {category.name}
                    </td>
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      <img
                        src={category.image || "/assets/default.png"}
                        alt={category.name}
                        className="w-10 h-10 md:w-12 md:h-12 object-cover rounded mx-auto"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleRemove(category.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 md:py-12 text-center text-sm text-slate-400"
                    >
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded disabled:bg-gray-100 flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <FiChevronLeft /> Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded disabled:bg-gray-100 flex items-center gap-2 w-full md:w-auto justify-center"
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <Modal onClose={closeModal}>
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 lg:p-8 w-full max-w-sm md:max-w-md lg:max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-blue-700">
                {editCategory ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Category No
                </label>
                <input
                  name="no"
                  value={editCategory ? formData.no : categoryNo}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-blue-50 text-slate-800 text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Category Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Image *
                </label>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageType"
                      value="url"
                      checked={formData.imageType === "url"}
                      onChange={handleInputChange}
                    />
                    <FiLink /> URL
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageType"
                      value="upload"
                      checked={formData.imageType === "upload"}
                      onChange={handleInputChange}
                    />
                    <FiUpload /> Upload
                  </label>
                </div>
                {formData.imageType === "url" ? (
                  <input
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                    placeholder="https://..."
                    required
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm md:text-base"
                    />
                    {selectedFileName && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ Selected: {selectedFileName}
                      </div>
                    )}
                    {formData.imageType === "upload" && !formData.image && (
                      <div className="mt-1 text-xs text-red-500">
                        Please select an image file
                      </div>
                    )}
                  </div>
                )}
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-2 w-16 h-16 md:w-20 md:h-20 object-cover rounded mx-auto"
                  />
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm md:text-base w-full md:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg text-sm md:text-base w-full md:w-auto flex items-center justify-center gap-2 ${
                    submitting 
                      ? "bg-gray-400 cursor-not-allowed text-white" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {submitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

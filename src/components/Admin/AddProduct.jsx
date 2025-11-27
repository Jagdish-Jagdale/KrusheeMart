import React, { useState, useEffect, useRef } from "react";
import {
  FiEye,
  FiEdit,
  FiTrash,
  FiPlus,
  FiUpload,
  FiLink,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

const Snackbar = ({ message, type = "success", onClose }) => (
  <div
    className={`fixed top-6 right-6 z-[9999] px-6 py-3 rounded-lg shadow-lg text-base font-medium flex items-center gap-2
      ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
  >
    {type === "success" ? "✅" : "❌"} {message}
    <button className="ml-2" onClick={onClose}>
      <FiX />
    </button>
  </div>
);

const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="absolute inset-0" onClick={onCancel} />
    <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
      <div className="text-4xl mb-4 text-red-500">⚠️</div>
      <div className="text-lg font-semibold mb-4 text-center">
        Are you sure you want to delete this product?
      </div>
      <div className="flex gap-4 mt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const Modal = ({ children, onClose }) => {
  if (typeof document === "undefined") return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none"
        style={{ scrollbarWidth: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hide scrollbar for Webkit browsers */}
        <style>
          {`
            .scrollbar-none::-webkit-scrollbar {
              display: none !important;
            }
          `}
        </style>
        {children}
      </div>
    </div>
  );
};

export default function AddProduct() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    mrp: "",
    discount: "",
    stock: "",
    overview: "",
    benefits: "",
    image: "",
    imageType: "url",
  });
  const [categories, setCategories] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [deleteId, setDeleteId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10; // Show 10 rows per page

  // Calculate sale price based on MRP and discount
  const calculateSalePrice = () => {
    const mrp = parseFloat(formData.mrp) || 0;
    const discount = parseFloat(formData.discount) || 0;
    return mrp - discount;
  };

  const getSalePrice = () => {
    const salePrice = calculateSalePrice();
    return salePrice > 0 ? salePrice : 0;
  };

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsSnap = await getDocs(collection(db, "products"));
        setProducts(productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        
        // Fetch categories from Firestore
        const categoriesSnap = await getDocs(collection(db, "categories"));
        const categoryList = categoriesSnap.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        console.log("Fetched categories:", categoryList); // Debug log
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Card stats
  const totalProducts = products.length;
  const inStock = products.filter((p) => p.stock > 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  // Filtering logic for table based on card click
  const filteredProducts = products.filter((p) => {
    if (filterType === "all") return true;
    if (filterType === "inStock") return p.stock > 0;
    if (filterType === "lowStock") return p.stock > 0 && p.stock <= 5;
    if (filterType === "outOfStock") return p.stock === 0;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, products]);

  // Helpers
  const getStockStatus = (p) => {
    if (p.stock === 0)
      return { label: "Out of Stock", classes: "bg-red-100 text-red-600" };
    if (p.stock > 0 && p.stock <= 5)
      return { label: "Low Stock", classes: "bg-amber-100 text-amber-600" };
    return { label: "In Stock", classes: "bg-green-100 text-green-600" };
  };

  // Helper to truncate long text with ellipsis after 15 chars
  const truncate = (str) =>
    typeof str === "string" && str.length > 15 ? str.slice(0, 15) + "..." : str;

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      mrp: "",
      discount: "",
      stock: "",
      overview: "",
      benefits: "",
      image: "",
      imageType: "url",
    });
    setIsDirty(false);
    setEditProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
          imageType: "upload",
        }));
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isDirty) return; // Prevent double submit

    // Validation
    const mrp = parseFloat(formData.mrp);
    const discount = formData.discount ? parseFloat(formData.discount) : 0;
    const stock = parseInt(formData.stock);
    const salePrice = mrp - discount;

    if (isNaN(mrp) || isNaN(stock)) {
      setSnackbarMsg("Please enter valid numbers for MRP and Stock.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }

    if (discount && isNaN(discount)) {
      setSnackbarMsg("Please enter a valid discount amount or leave it empty.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }

    if (mrp < 0 || stock < 0 || (discount && discount < 0)) {
      setSnackbarMsg("MRP, Discount, and Stock Quantity cannot be negative.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }

    if (discount && discount >= mrp) {
      setSnackbarMsg("Discount amount cannot be greater than or equal to MRP.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }

    if (salePrice <= 0) {
      setSnackbarMsg("Sale price must be greater than 0.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }

    setIsSubmitting(true);
    let product;
    try {
      if (editProduct) {
    
        product = {
          name: formData.name,
          category: formData.category,
          price: salePrice, // Calculated sale price
          mrp: mrp,
          originalPrice: mrp, // Keep original price
          discount: discount || null,
          discountPrice: discount ? salePrice : null, // Sale price when there's a discount (for backward compatibility)
          stock,
          benefits: formData.benefits,
          image: formData.image,
        };
        await updateDoc(doc(db, "products", editProduct.id), product);
        setSnackbarMsg("Product updated successfully!");
      } else {
        product = {
          name: formData.name,
          category: formData.category,
          price: salePrice, // Calculated sale price
          mrp: mrp,
          originalPrice: mrp, // Keep original price
          discount: discount || null,
          discountPrice: discount ? salePrice : null, // Sale price when there's a discount (for backward compatibility)
          stock,
          benefits: formData.benefits,
          image: formData.image,
        };
        const newDoc = await addDoc(collection(db, "products"), product);
        product = { ...product, id: newDoc.id };
        setSnackbarMsg("Product added successfully!");
      }
      setSnackbarType("success");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      // Refresh products list
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setSnackbarMsg("Error saving product. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name || "",
      category: product.category || "",
      mrp: product.mrp || "",
      discount: product.discount || "",
      stock: product.stock || "",
      overview: product.description || "",
      benefits: product.benefits || "",
      image: product.image || "",
      imageType: product.image?.startsWith("data:") ? "upload" : "url",
    });
    setIsDirty(false);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", deleteId));
      setProducts(products.filter((p) => p.id !== deleteId));
      setSnackbarMsg("Product deleted successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch {
      setSnackbarMsg("Error deleting product. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    }
    setDeleteId(null);
  };

  // UI
  return (
    <div className="space-y-6 text-black">
      {showSnackbar && (
        <Snackbar
          message={snackbarMsg}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
        Add Product
      </h1>
      <p className="text-sm text-slate-500">Manage your product inventory.</p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          className={`bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 cursor-pointer transition ${
            filterType === "all" ? "ring-2 ring-blue-400" : ""
          }`}
          onClick={() => setFilterType("all")}
        >
          <div className="text-sm text-slate-500">Total Products</div>
          <div className="text-2xl font-bold mt-2">{totalProducts}</div>
        </div>
        <div
          className={`bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 cursor-pointer transition ${
            filterType === "inStock" ? "ring-2 ring-green-400" : ""
          }`}
          onClick={() => setFilterType("inStock")}
        >
          <div className="text-sm text-slate-500">In Stock</div>
          <div className="text-2xl font-bold mt-2">{inStock}</div>
        </div>
        <div
          className={`bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 cursor-pointer transition ${
            filterType === "lowStock" ? "ring-2 ring-yellow-400" : ""
          }`}
          onClick={() => setFilterType("lowStock")}
        >
          <div className="text-sm text-slate-500">Low Stock</div>
          <div className="text-2xl font-bold mt-2">{lowStock}</div>
        </div>
        <div
          className={`bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500 cursor-pointer transition ${
            filterType === "outOfStock" ? "ring-2 ring-red-400" : ""
          }`}
          onClick={() => setFilterType("outOfStock")}
        >
          <div className="text-sm text-slate-500">Out of Stock</div>
          <div className="text-2xl font-bold mt-2">{outOfStock}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-slate-100 mt-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-slate-800">
            {filterType === "all"
              ? "All Products"
              : filterType === "inStock"
              ? "In Stock Products"
              : filterType === "lowStock"
              ? "Low Stock Products"
              : "Out of Stock Products"}
          </h2>
          <button
            onClick={() => {
              setShowAddModal(true);
              resetForm();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 w-full md:w-auto lg:w-56 justify-center"
          >
            <FiPlus /> Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse">
            <thead className="bg-gray-200 text-slate-700 border-b">
              <tr className="text-sm">
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Sr No
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Product
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Category
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Price
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Stock
                </th>
                <th className="px-4 md:px-6 py-2 text-center align-middle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product, i) => {
                const status = getStockStatus(product);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 hover:bg-slate-50"
                  >
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      {(currentPage - 1) * rowsPerPage + i + 1}
                    </td>
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image || "/assets/default.png"}
                          alt={product.name}
                          className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full"
                        />
                        <div>
                          <div
                            className="text-sm font-semibold text-slate-800"
                            title={product.name}
                          >
                            {truncate(product.name)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-4 md:px-6 py-1 text-center align-middle"
                      title={product.category}
                    >
                      {truncate(product.category)}
                    </td>
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      <div className="font-semibold">₹{product.price}</div>
                      <div className="text-xs text-gray-400 line-through">
                        ₹{product.mrp || product.price}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.classes}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-1 text-center align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination controls with blue icons and no grey bg, only show if more than 10 records */}
          {filteredProducts.length > rowsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`p-2 rounded-full border border-blue-100 hover:bg-blue-50 text-blue-600 transition ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Previous Page"
              >
                <FiChevronLeft size={24} />
              </button>
              <span className="text-sm text-slate-700">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-full border border-blue-100 hover:bg-blue-50 text-blue-600 transition ${
                  currentPage === totalPages || totalPages === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                aria-label="Next Page"
              >
                <FiChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <Modal
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-blue-700">
                {editProduct ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Product Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                    required
                  >
                    <option value="">Select Category</option>
                    {loading ? (
                      <option disabled>Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option disabled>No categories found</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mt-1">
                    Categories loaded: {categories.length} | Loading: {loading ? "Yes" : "No"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    MRP (₹)
                  </label>
                  <input
                    name="mrp"
                    type="number"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Discount Amount (₹) - Optional
                  </label>
                  <input
                    name="discount"
                    type="number"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="Enter discount amount"
                    min="0"
                    max={formData.mrp ? parseFloat(formData.mrp) : undefined}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount to subtract from MRP. Leave empty for no discount.
                  </p>
                  {formData.mrp && formData.discount && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">
                        Sale Price: ₹{getSalePrice()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Stock Quantity
                </label>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Image
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
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm md:text-base"
                  />
                )}
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-2 w-16 h-16 md:w-20 md:h-20 object-cover rounded"
                  />
                )}
              </div>
              {/* Add overview input field here */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Product Overview
                </label>
                <textarea
                  name="overview"
                  value={formData.overview}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Key Benefits
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                  rows={4}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm md:text-base"
                  disabled={isDirty}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base ${
                    !isDirty || isSubmitting
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!isDirty || isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editProduct
                    ? "Update Product"
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
      {deleteId && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

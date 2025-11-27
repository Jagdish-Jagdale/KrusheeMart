import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash, FiUpload, FiLink, FiX } from "react-icons/fi";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
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
        Are you sure you want to delete this brand?
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

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="absolute inset-0" onClick={onClose} />
    <div
      className="relative bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-lg mx-auto max-h-[calc(100vh-2rem)] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

export default function AddBrand() {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    imageType: "url",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [deleteId, setDeleteId] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const snapshot = await getDocs(collection(db, "brands"));
      const brandList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBrands(brandList);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      image: "",
      imageType: "url",
    });
    setSelectedFileName("");
    setEditBrand(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
          imageType: "upload",
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFileName("");
      setFormData((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image || formData.image.trim() === "") {
      setSnackbarMsg("Please provide a brand image.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const brandData = {
        image: formData.image,
        createdAt: new Date(),
      };
      
      // Only add name if it's provided
      if (formData.name.trim()) {
        brandData.name = formData.name.trim();
      }

      if (editBrand) {
        await updateDoc(doc(db, "brands", editBrand.id), brandData);
        setSnackbarMsg("Brand updated successfully!");
      } else {
        await addDoc(collection(db, "brands"), brandData);
        setSnackbarMsg("Brand added successfully!");
      }

      setSnackbarType("success");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      
      setShowModal(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
      setSnackbarMsg("Error saving brand. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (brand) => {
    setEditBrand(brand);
    setFormData({
      name: brand.name || "",
      image: brand.image || "",
      imageType: brand.image?.startsWith("data:") ? "upload" : "url",
    });
    setSelectedFileName(brand.image?.startsWith("data:") ? "Uploaded Image" : "");
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "brands", deleteId));
      setBrands(brands.filter((b) => b.id !== deleteId));
      setSnackbarMsg("Brand deleted successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error("Error deleting brand:", error);
      setSnackbarMsg("Error deleting brand. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-slate-200">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-slate-800">Loading Brands...</div>
          <div className="text-sm text-slate-500">Fetching brand data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 text-black">
      {showSnackbar && (
        <Snackbar
          message={snackbarMsg}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            Brand Management
          </h2>
          <p className="text-sm text-slate-500">Manage product brands and logos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base flex items-center gap-2"
        >
          <FiPlus /> Add Brand
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse">
            <thead className="bg-slate-100 text-slate-700">
              <tr className="text-sm">
                <th className="px-4 md:px-6 py-4 text-center align-middle">Sr No</th>
                <th className="px-4 md:px-6 py-4 text-center align-middle">Brand Name</th>
                <th className="px-4 md:px-6 py-4 text-center align-middle">Logo</th>
                <th className="px-4 md:px-6 py-4 text-center align-middle">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand, index) => (
                <tr
                  key={brand.id}
                  className="border-b border-gray-200 hover:bg-slate-50"
                >
                  <td className="px-4 md:px-6 py-4 text-center align-middle">
                    {index + 1}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center align-middle font-medium">
                    {brand.name || <span className="text-gray-400 italic">No name</span>}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center align-middle">
                    <img
                      src={brand.image || "/assets/default.png"}
                      alt={brand.name}
                      className="w-12 h-12 md:w-16 md:h-16 object-contain rounded mx-auto bg-gray-50 p-1"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-4 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit Brand"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete Brand"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 md:py-12 text-center text-sm text-slate-400"
                  >
                    No brands found. Add your first brand to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-blue-700">
              {editBrand ? "Edit Brand" : "Add Brand"}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Brand Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm md:text-base"
                placeholder="Enter brand name (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Brand Logo
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
                  placeholder="https://example.com/logo.png"
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
                </div>
              )}
              
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-2 w-20 h-20 object-contain rounded mx-auto bg-gray-50 p-2"
                />
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded-lg text-sm md:text-base flex items-center justify-center gap-2 ${
                  submitting 
                    ? "bg-gray-400 cursor-not-allowed text-white" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {submitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {submitting 
                  ? "Saving..." 
                  : editBrand 
                    ? "Update Brand" 
                    : "Save Brand"
                }
              </button>
            </div>
          </form>
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

import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiUpload, FiLink, FiX, FiTrash, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="absolute inset-0" onClick={onClose} />
    <div
      className="relative bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="absolute inset-0" onClick={onCancel} />
    <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
      <div className="text-4xl mb-4 text-red-500">⚠️</div>
      <div className="text-lg font-semibold mb-4 text-center">
        Are you sure you want to delete this banner?
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

export default function AddBanner() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [formData, setFormData] = useState({
    image: "",
    imageType: "url",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");
  const [deleteId, setDeleteId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  // Reset current slide when banners change
  useEffect(() => {
    if (currentSlide >= banners.length) {
      setCurrentSlide(0);
    }
  }, [banners.length, currentSlide]);

  const fetchBanners = async () => {
    try {
      const snapshot = await getDocs(collection(db, "banners"));
      const bannerList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBanners(bannerList);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      image: "",
      imageType: "url",
      isActive: true,
    });
    setSelectedFileName("");
    setEditBanner(null);
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
    
    // Validate image is provided
    if (!formData.image || formData.image.trim() === "") {
      setSnackbarMsg("Please provide a banner image.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const bannerData = {
        image: formData.image,
        isActive: formData.isActive,
        createdAt: new Date(),
      };

      if (editBanner) {
        await updateDoc(doc(db, "banners", editBanner.id), bannerData);
        setSnackbarMsg("Banner updated successfully!");
      } else {
        await addDoc(collection(db, "banners"), bannerData);
        setSnackbarMsg("Banner added successfully!");
      }

      setSnackbarType("success");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      setSnackbarMsg("Error saving banner. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setEditBanner(banner);
    setFormData({
      image: banner.image || "",
      imageType: banner.image?.startsWith("data:") ? "upload" : "url",
      isActive: banner.isActive !== false,
    });
    setSelectedFileName(banner.image?.startsWith("data:") ? "Uploaded Image" : "");
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "banners", deleteId));
      setBanners(banners.filter((b) => b.id !== deleteId));
      setSnackbarMsg("Banner deleted successfully!");
      setSnackbarType("success");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      setSnackbarMsg("Error deleting banner. Please try again.");
      setSnackbarType("error");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    }
    setDeleteId(null);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="animate-fade-in space-y-6 text-black">
      {showSnackbar && (
        <Snackbar
          message={snackbarMsg}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-slate-200">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-slate-800">Loading Banners...</div>
            <div className="text-sm text-slate-500">Fetching banner data</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manage Banners</h1>
          <p className="text-sm text-slate-500">Create and manage hero banners for your store</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base flex items-center gap-2"
        >
          <FiPlus /> Add Banner
        </button>
      </div>

      {banners.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="relative">
            {/* Carousel Container */}
            <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {banners.map((banner, index) => (
                  <div key={banner.id} className="w-full flex-shrink-0 relative group">
                    <img
                      src={banner.image || "/assets/hero1.webp"}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Edit and Delete buttons */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-blue-600 hover:text-blue-700"
                        title="Edit Banner"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-red-600 hover:text-red-700"
                        title="Delete Banner"
                      >
                        <FiTrash size={16} />
                      </button>
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-white text-xs rounded-full ${
                        banner.isActive 
                          ? "bg-green-500" 
                          : "bg-red-500"
                      }`}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-700 hover:text-gray-900 transition-all"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-700 hover:text-gray-900 transition-all"
                >
                  <FiChevronRight size={20} />
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-white shadow-md"
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Banner Counter */}
            <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 text-white text-xs rounded">
              {currentSlide + 1} / {banners.length}
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-slate-100">
            <div className="text-4xl mb-4">🖼️</div>
            <div className="text-lg font-medium mb-2">No banners yet</div>
            <div className="text-sm">Create your first banner to get started</div>
          </div>
        )
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-blue-700">
              {editBanner ? "Edit Banner" : "Add Banner"}
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
                Banner Image
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
                  placeholder="https://example.com/image.jpg"
                />
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-center">
                        <FiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <div className="text-sm text-gray-600">
                          {selectedFileName ? (
                            <span className="font-medium text-blue-600">
                              File selected: {selectedFileName}
                            </span>
                          ) : (
                            <>
                              <span className="font-medium">Click to upload</span> or drag and drop
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </div>
                      </div>
                    </label>
                  </div>
                  {selectedFileName && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">
                          {selectedFileName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFileName("");
                          setFormData(prev => ({ ...prev, image: "" }));
                          document.getElementById('file-upload').value = '';
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="mt-2 w-full h-32 object-cover rounded"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">
                Active (show on website)
              </label>
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
                className={`px-4 py-2 rounded-lg text-sm md:text-base flex items-center gap-2 ${
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
                  : editBanner 
                    ? "Update Banner" 
                    : "Save Banner"
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

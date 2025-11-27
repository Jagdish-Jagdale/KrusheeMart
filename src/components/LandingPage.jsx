import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import nutrientsImg from "../assets/nutrients.png";

import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// Categories will be fetched dynamically from Firestore
const fallbackCategories = [];

// Trending products will be fetched dynamically from Firestore

// Hero images will be fetched dynamically from Firestore
const fallbackHeroImages = [];

// Brands will be fetched dynamically from Firestore

// Most purchased products will be fetched dynamically from Firestore

// Testimonials will be fetched dynamically from Firestore

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, purchaseProduct } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [heroImages, setHeroImages] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [mostPurchased, setMostPurchased] = useState([]);
  const [loadingMostPurchased, setLoadingMostPurchased] = useState(true);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    city: "",
    description: "",
    stars: 5,
    img: "",
    imageType: "url", // Add imageType
  });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [catStart, setCatStart] = useState(0);
  const visibleCount = 7; // target visible count (approx)
  // tile + gap sizes used for JS transform (px)
  const TILE_WIDTH = 128; // base tile width used for transform math
  const GAP_PX = 16; // gap used in transform math
  const TILE_PAD = Math.floor(TILE_WIDTH / 2); // half-tile visible at viewport edges
  // refs + state to compute/limit translation so last items are visible
  const viewportRef = useRef(null);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const brandRef = useRef(null);

  // profile dropdown state + outside click
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState(null);

  // Subscribe to categories from Firestore (real-time)
  useEffect(() => {
    setLoadingCategories(true);
    const categoriesRef = collection(db, "categories");

    const unsubscribe = onSnapshot(
      categoriesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedCategories = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || doc.data().categoryName,
            image: doc.data().image || doc.data().imageUrl || nutrientsImg,
            ...doc.data(),
          }));
          setCategories(fetchedCategories);
        } else {
          setCategories([]);
        }
        setLoadingCategories(false);
      },
      (error) => {
        console.error("Error fetching categories:", error);
        setCategories([]);
        setLoadingCategories(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Subscribe to trending products from Firestore (real-time)
  useEffect(() => {
    setLoadingProducts(true);
    const productsRef = collection(db, "products");

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const allProducts = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || doc.data().productName,
            image: doc.data().image || doc.data().imageUrl,
            mrp: doc.data().mrp || doc.data().originalPrice,
            price: doc.data().price || doc.data().sellingPrice,
            ...doc.data(),
          }));

          // Shuffle and select random 5 products for trending
          const shuffled = allProducts.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 5);
          setTrendingProducts(selected);
        } else {
          setTrendingProducts([]);
        }
        setLoadingProducts(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        setTrendingProducts([]);
        setLoadingProducts(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Subscribe to banners from Firestore (real-time)
  useEffect(() => {
    setLoadingBanners(true);
    const bannersRef = collection(db, "banners");

    const unsubscribe = onSnapshot(
      bannersRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedBanners = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              image: doc.data().image || doc.data().imageUrl || doc.data().url,
              order: doc.data().order || 0,
              active: doc.data().active !== false, // default to true if not specified
              ...doc.data(),
            }))
            .filter((banner) => banner.active) // Only show active banners
            .sort((a, b) => a.order - b.order); // Sort by order field

          if (fetchedBanners.length > 0) {
            const bannerImages = fetchedBanners.map((banner) => banner.image);
            setHeroImages(bannerImages);
          } else {
            setHeroImages([]);
          }
        } else {
          setHeroImages([]);
        }
        setLoadingBanners(false);
      },
      (error) => {
        console.error("Error fetching banners:", error);
        setHeroImages([]);
        setLoadingBanners(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Subscribe to most purchased products from Firestore (real-time, random 5)
  useEffect(() => {
    setLoadingMostPurchased(true);
    const productsRef = collection(db, "products");

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const allProducts = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || doc.data().productName,
            img: doc.data().image || doc.data().imageUrl,
            mrp: doc.data().mrp || doc.data().originalPrice,
            price: doc.data().price || doc.data().sellingPrice,
            ...doc.data(),
          }));

          // Shuffle and select random 5 products for most purchased
          const shuffled = allProducts.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 5);
          setMostPurchased(selected);
        } else {
          setMostPurchased([]);
        }
        setLoadingMostPurchased(false);
      },
      (error) => {
        console.error("Error fetching most purchased products:", error);
        setMostPurchased([]);
        setLoadingMostPurchased(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Subscribe to testimonials from Firestore (real-time, recent 4)
  useEffect(() => {
    setLoadingTestimonials(true);
    const testimonialsRef = collection(db, "testimonials");
    const q = query(testimonialsRef, orderBy("createdAt", "desc"), limit(4));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedTestimonials = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            city: doc.data().city,
            text: doc.data().description || doc.data().text,
            stars: doc.data().stars || 5,
            img: doc.data().img || doc.data().image || "/assets/user1.png",
            ...doc.data(),
          }));
          setTestimonials(fetchedTestimonials);
        } else {
          setTestimonials([]);
        }
        setLoadingTestimonials(false);
      },
      (error) => {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
        setLoadingTestimonials(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Subscribe to brands from Firestore (real-time)
  useEffect(() => {
    setLoadingBrands(true);
    const brandsRef = collection(db, "brands");

    const unsubscribe = onSnapshot(
      brandsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedBrands = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name || doc.data().brandName,
            image: doc.data().image || doc.data().imageUrl || doc.data().logo,
            ...doc.data(),
          }));
          setBrands(fetchedBrands);
        } else {
          setBrands([]);
        }
        setLoadingBrands(false);
      },
      (error) => {
        console.error("Error fetching brands:", error);
        setBrands([]);
        setLoadingBrands(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (!heroPaused) setHeroIdx((i) => (i + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(t);
  }, [heroPaused, heroImages.length]);

  useEffect(() => {
    function onDocClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    function update() {
      const vw = viewportRef.current?.offsetWidth || 0;
      // total track width = num * (tile + gap) - last gap
      const trackWidth = Math.max(
        0,
        categories.length * (TILE_WIDTH + GAP_PX) - GAP_PX
      );
      const maxT = Math.max(0, trackWidth - vw);
      setMaxTranslate(maxT);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [categories.length, TILE_WIDTH, GAP_PX]);

  const prevCats = () => setCatStart((s) => Math.max(0, s - 1));
  const nextCats = () =>
    setCatStart((s) => Math.min(s + 1, categories.length - 1));
  const prevHero = () =>
    setHeroIdx((i) => (i - 1 + heroImages.length) % heroImages.length);
  const nextHero = () => setHeroIdx((i) => (i + 1) % heroImages.length);

  // helper to make URL-friendly slugs from category names
  const toSlug = (name) =>
    name
      .toString()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  // Handle testimonial form submission
  const handleAddTestimonial = async (e) => {
    e.preventDefault();

    if (
      !testimonialForm.name ||
      !testimonialForm.city ||
      !testimonialForm.description
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setSubmittingTestimonial(true);
      const testimonialsRef = collection(db, "testimonials");

      await addDoc(testimonialsRef, {
        name: testimonialForm.name,
        city: testimonialForm.city,
        description: testimonialForm.description,
        stars: testimonialForm.stars,
        img: testimonialForm.img || "/assets/user1.png", // Use provided img or default
        createdAt: serverTimestamp(),
      });

      // Reset form and close modal
      setTestimonialForm({
        name: "",
        city: "",
        description: "",
        stars: 5,
        img: "",
      });
      setShowTestimonialModal(false);
      alert("Testimonial added successfully!");
    } catch (error) {
      console.error("Error adding testimonial:", error);
      alert("Failed to add testimonial. Please try again.");
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  // Add file change handler
  const handleTestimonialFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTestimonialForm((prev) => ({
          ...prev,
          img: reader.result,
          imageType: "upload",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // local cart helper: store items under key 'krushee_cart'
  const addToCartLocal = (item, qty = 1) => {
    try {
      const raw = localStorage.getItem("krushee_cart") || "[]";
      const cur = JSON.parse(raw);
      // Use the original item ID without prefix
      const keyId = item.id;
      const idx = cur.findIndex((c) => c.id === keyId);
      if (idx >= 0) {
        cur[idx].qty = (cur[idx].qty || 0) + qty;
      } else {
        cur.push({
          id: keyId,
          name: item.name,
          image: item.image || item.img || "",
          price: item.discountPrice || item.price,
          mrp: item.price,
          discountPrice: item.discountPrice,
          qty,
        });
      }
      localStorage.setItem("krushee_cart", JSON.stringify(cur));
      // notify other windows/components listening to storage
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("addToCartLocal failed", e);
    }
  };

  const buyNow = (product) => {
    // Navigate to payment page with product data
    navigate("/payment", {
      state: {
        product: {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.discountPrice || product.price,
          mrp: product.mrp || product.price,
          discountPrice: product.discountPrice,
        },
        quantity: 1,
        fromBuyNow: true,
      },
    });
  };

  return (
    // root: no special background (let page body use app default)
    <div className="bg-transparent text-gray-800 min-h-screen transition-colors">
      <Header />

      {/* Hero carousel (full-screen professional) */}
      <section className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh]">
        <div
          className="relative overflow-hidden h-full transition-all duration-700 bg-gray-100"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          {loadingBanners ? (
            // Loading skeleton for hero
            <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-lg">Loading...</div>
            </div>
          ) : heroImages.length > 0 ? (
            // responsive image that fills container with better quality
            <img
              src={heroImages[heroIdx]}
              alt={`hero-${heroIdx}`}
              className="absolute inset-0 w-full h-full  transition-opacity duration-700"
              style={{
                transform: "translateZ(0)",
                imageRendering: "high-quality",
              }}
              loading="eager"
            />
          ) : (
            // No banners found
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="text-gray-600 text-2xl font-semibold mb-2">
                  No Banners Found
                </div>
                <div className="text-gray-500 text-sm">
                  Please add banners to display here
                </div>
              </div>
            </div>
          )}

          {/* controls - keep on top */}
          <button
            onClick={prevHero}
            className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg z-10 transition-all"
            aria-label="Previous hero"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15 19l-7-7 7-7"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <button
            onClick={nextHero}
            className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg z-10 transition-all"
            aria-label="Next hero"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M9 5l7 7-7 7"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                  i === heroIdx
                    ? "bg-white scale-110"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Show hero ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories (full-width horizontal scroll) */}
      <section className="w-full bg-white shadow-sm py-8">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
            Shop by Category
          </h2>
          <div className="flex items-center justify-center gap-2 px-2 sm:px-4">
            {categories.length > 9 && (
              <button
                onClick={() => setCatStart((s) => Math.max(0, s - 1))}
                disabled={catStart === 0}
                aria-label="Prev categories"
                className="flex-shrink-0 p-2 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 19l-7-7 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}

            {/* viewport */}
            <div
              ref={viewportRef}
              className="overflow-hidden w-full max-w-6xl"
              style={{
                paddingLeft: `${TILE_PAD}px`,
                paddingRight: `${TILE_PAD}px`,
              }}
            >
              {/* track */}
              <div
                className="flex items-center justify-center transition-transform duration-500"
                style={{
                  transform: `translateX(-${Math.min(
                    Math.max(0, catStart * (TILE_WIDTH + GAP_PX) - TILE_PAD),
                    maxTranslate
                  )}px)`,
                  gap: `${GAP_PX}px`,
                }}
              >
                {loadingCategories ? (
                  // Loading skeleton
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-32 text-center">
                      <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse mx-auto"></div>
                      <div className="mt-4 h-4 bg-gray-200 animate-pulse rounded w-20 mx-auto"></div>
                    </div>
                  ))
                ) : categories.length > 0 ? (
                  categories.map((cat) => {
                    const slug = toSlug(cat.name);
                    return (
                      <Link
                        key={cat.id || cat.name}
                        to={`/category/${slug}`}
                        className="group flex-shrink-0 w-32 text-center"
                        aria-label={`Open ${cat.name} category`}
                      >
                        {/* green category gradient + hover pop effect */}
                        <div className="w-32 h-32 rounded-full shadow-md relative overflow-hidden bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 flex items-center justify-center mx-auto transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:from-emerald-100 group-hover:via-emerald-200 group-hover:to-emerald-300">
                          {/* category image centered inside circle */}
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="relative z-10 w-20 h-auto object-contain transform transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="mt-4 text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                          {cat.name}
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  // No categories found
                  <div className="w-full text-center py-12">
                    <div className="text-gray-500 text-lg font-medium">
                      No Categories Found
                    </div>
                    <div className="text-gray-400 text-sm mt-2">
                      Please add categories to display here
                    </div>
                  </div>
                )}
              </div>
            </div>

            {categories.length > 9 && (
              <button
                onClick={() =>
                  setCatStart((s) => Math.min(s + 1, categories.length - 1))
                }
                disabled={
                  Math.min(
                    Math.max(0, catStart * (TILE_WIDTH + GAP_PX) - TILE_PAD),
                    maxTranslate
                  ) >= Math.max(0, maxTranslate - 1)
                }
                aria-label="Next categories"
                className="flex-shrink-0 p-2 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* This week's trending */}
      <section className="w-full py-12">
        <div className="flex items-center justify-between mb-6 px-4 sm:px-6">
          <h3 className="text-lg font-semibold">
            This week's trending products
          </h3>
          <Link to="/user" className="text-sm text-emerald-600 font-medium">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-4 sm:px-6">
          {loadingProducts ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-3">
                <div className="w-24 h-24 bg-gray-200 animate-pulse rounded mx-auto"></div>
                <div className="mt-2 h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="mt-2 h-3 bg-gray-200 animate-pulse rounded w-16 mx-auto"></div>
                <div className="mt-2 h-4 bg-gray-200 animate-pulse rounded w-20 mx-auto"></div>
                <div className="mt-3 h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))
          ) : trendingProducts.length > 0 ? (
            trendingProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow p-3 flex flex-col items-center hover:shadow-lg transition"
              >
                <div className="relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-24 h-24 object-contain rounded"
                  />
                  <span className="absolute left-1 top-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    HOT
                  </span>
                </div>
                <div className="mt-2 text-center">
                  <div className="font-semibold text-sm">{p.name}</div>
                  {p.discountPrice && (
                    <div className="text-xs text-gray-400 line-through mt-1">
                      ₹{p.mrp}
                    </div>
                  )}
                  <div className="text-base font-bold text-emerald-600 mt-1">
                    ₹{p.discountPrice || p.price}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      addToCartLocal(p, 1);
                      navigate("/cart");
                    }}
                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => buyNow(p)}
                    className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg font-medium">
                No Products Found
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Please add products to display here
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Shop by Brands (horizontal with arrows) */}
      <section className="w-full py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex items-center justify-between mb-8 px-4 sm:px-6">
          <div>
            <h4 className="text-2xl md:text-3xl font-bold text-gray-900">
              Shop by Brands
            </h4>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Trusted partners
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {brands.length > 5 && (
            <button
              onClick={() =>
                brandRef.current?.scrollBy({ left: -300, behavior: "smooth" })
              }
              className="flex-shrink-0 p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 ml-4"
              aria-label="Scroll brands left"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          <div
            ref={brandRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide py-4 flex-1"
          >
            {loadingBrands ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-56 text-center">
                  <div className="mx-auto w-52 h-32 bg-gray-200 animate-pulse rounded-xl"></div>
                </div>
              ))
            ) : brands.length > 0 ? (
              brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex-shrink-0 w-56 text-center group"
                >
                  <div className="mx-auto w-52 h-32 bg-white rounded-xl shadow-md flex items-center justify-center p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
                    <img
                      src={brand.image}
                      alt={brand.name || `Brand ${brand.id}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12">
                <div className="text-gray-500 text-xl font-medium">
                  No Brands Found
                </div>
                <div className="text-gray-400 text-base mt-2">
                  Please add brands to display here
                </div>
              </div>
            )}
          </div>

          {brands.length > 5 && (
            <button
              onClick={() =>
                brandRef.current?.scrollBy({ left: 300, behavior: "smooth" })
              }
              className="flex-shrink-0 p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 mr-4"
              aria-label="Scroll brands right"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* Testimonials: single auto-sliding card with user image */}
      <section className="w-full py-12">
        <div className="flex items-center justify-between mb-6 px-4 sm:px-6">
          <h4 className="text-lg font-semibold">Testimonials</h4>
          <button
            onClick={() => setShowTestimonialModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Testimonial
          </button>
        </div>
        <div className="px-4 sm:px-6">
          {loadingTestimonials ? (
            <div className="bg-white rounded-xl shadow p-6 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : testimonials.length > 0 ? (
            <TestimonialCarousel items={testimonials} />
          ) : (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-gray-500 text-lg font-medium">
                No Testimonials Yet
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Be the first to add a testimonial!
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Add Testimonial
              </h3>
              <button
                onClick={() => setShowTestimonialModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={testimonialForm.name}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={testimonialForm.city}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      city: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your city"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageType"
                      value="url"
                      checked={testimonialForm.imageType === "url"}
                      onChange={(e) =>
                        setTestimonialForm({
                          ...testimonialForm,
                          imageType: e.target.value,
                        })
                      }
                    />
                    URL
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageType"
                      value="upload"
                      checked={testimonialForm.imageType === "upload"}
                      onChange={(e) =>
                        setTestimonialForm({
                          ...testimonialForm,
                          imageType: e.target.value,
                        })
                      }
                    />
                    Upload
                  </label>
                </div>
                {testimonialForm.imageType === "url" ? (
                  <input
                    type="url"
                    value={testimonialForm.img}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        img: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter image URL (optional)"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTestimonialFileChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm md:text-base"
                  />
                )}
                {testimonialForm.img && (
                  <img
                    src={testimonialForm.img}
                    alt="Preview"
                    className="mt-2 w-16 h-16 md:w-20 md:h-20 object-cover rounded"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={testimonialForm.description}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setTestimonialForm({ ...testimonialForm, stars: star })
                      }
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= testimonialForm.stars
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTestimonialModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTestimonial}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingTestimonial ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Most Purchased Products */}
      <section className="w-full py-12">
        <div className="flex items-center justify-between mb-6 px-4 sm:px-6">
          <h4 className="text-lg font-semibold">Most Purchased Products</h4>
          <Link to="/user" className="text-sm text-emerald-600 font-medium">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-4 sm:px-6">
          {loadingMostPurchased ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-3">
                <div className="w-24 h-24 bg-gray-200 animate-pulse rounded mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-3 bg-gray-200 animate-pulse rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-20 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))
          ) : mostPurchased.length > 0 ? (
            mostPurchased.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-lg shadow p-3 flex flex-col items-center text-center"
              >
                <img
                  src={f.img}
                  alt={f.name}
                  className="w-24 h-24 object-contain mb-2"
                />
                <div className="font-semibold text-sm">{f.name}</div>
                {f.discountPrice && (
                  <div className="text-xs text-gray-400 line-through">
                    ₹{f.price}
                  </div>
                )}
                <div className="text-base font-bold text-emerald-600">
                  ₹{f.discountPrice || f.price}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      addToCartLocal(f, 1);
                      navigate("/cart");
                    }}
                    className="px-2 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() =>
                      buyNow({
                        id: f.id,
                        name: f.name,
                        image: f.img,
                        price: f.price,
                        discountPrice: f.discountPrice,
                        mrp: f.price,
                      })
                    }
                    className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            // No products found
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg font-medium">
                No Products Found
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Please add products to display here
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold mb-3">Company</h5>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/about" className="hover:underline">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/network" className="hover:underline">
                  Our network
                </Link>
              </li>
              <li>
                <Link to="/refund-return" className="hover:underline">
                  Refund & Return
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3">Categories</h5>
            <ul className="space-y-2 text-sm text-slate-300">
              {categories.slice(0, 6).map((c) => (
                <li key={c.name}>{c.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-3">Follow us</h5>
            <div className="flex gap-3 mb-4">
              <a className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                f
              </a>
              <a className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                in
              </a>
              <a className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                ig
              </a>
              <a className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                x
              </a>
            </div>
            <h5 className="font-bold mb-2">Download app</h5>
            <div className="flex gap-3">
              <img
                src="/assets/google-play.png"
                alt="Google Play"
                className="h-10"
              />
              <img
                src="/assets/app-store.png"
                alt="App Store"
                className="h-10"
              />
            </div>
          </div>
          <div>
            <h5 className="font-bold mb-3">Legal & Resources</h5>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link to="/terms" className="hover:underline">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/agri-tips" className="hover:underline">
                  Agri Tips
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} KrusheeMart — All rights reserved.
        </div>
      </footer>

      {/* Purchase Success Modal */}
      {showPurchaseModal && purchasedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="text-6xl mb-4 text-green-500">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Purchase Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              You have successfully purchased{" "}
              <strong>{purchasedProduct.name}</strong> for ₹
              {purchasedProduct.price}.
            </p>
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// TestimonialCarousel component with star ratings
function TestimonialCarousel({ items }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused) setIdx((i) => (i + 1) % items.length);
    }, 4500);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative"
    >
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-600"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {items.map((it) => (
            <div
              key={it.id}
              className="min-w-full p-6 bg-white shadow rounded-xl flex gap-4 items-center"
            >
              <img
                src={it.img}
                alt={it.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="mt-2 font-semibold">{it.name}</div>
                <p className="text-gray-700 italic">"{it.text}"</p>
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < (it.stars || 5)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                {it.city && (
                  <div className="text-sm text-gray-500">- {it.city}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full ${
              i === idx ? "bg-emerald-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default LandingPage;

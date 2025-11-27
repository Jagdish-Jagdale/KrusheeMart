import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AddPesticide from "./components/Admin/AddPesticide";
import AddEquipment from "./components/Admin/AddEquipment";
import AddCategory from "./components/Admin/AddCategory";
import AddProduct from "./components/Admin/AddProduct";
import Reports from "./components/Admin/Reports";
import Revenue from "./components/Admin/Revenue";
import AddBanner from "./components/Admin/AddBanner";
import AddBrand from "./components/Admin/AddBrand";
import UserLayout from "./components/User/UserLayout";
import ProductList from "./components/User/ProductList";
import LandingPage from "./components/LandingPage";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import Profile from "./components/Profile";
import ManageCustomers from "./components/Admin/ManageCustomers";
import CustomerDetails from "./components/Admin/CustomerDetails";
import SearchResults from "./components/SearchResults";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import RefundReturn from "./components/RefundReturn";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/refund-return" element={<RefundReturn />} />
        <Route path="/category/:categorySlug" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="manage-customers" element={<ManageCustomers />} />
          <Route path="manage-customers/:id" element={<CustomerDetails />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="reports" element={<Reports />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="add-banner" element={<AddBanner />} />
          <Route path="add-brand" element={<AddBrand />} />
        </Route>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<ProductList />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;


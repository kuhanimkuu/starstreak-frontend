import React from "react";
import { Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Products from "./pages/Products/Products";
import Contact from "./pages/Contact/Contact";
import Privacy from "./pages/Legal/Privacy";
import Terms from "./pages/Legal/Terms";
import Cookie from "./pages/Legal/Cookie";
import BlogList from "./pages/Blog/BlogList";
import BlogDetail from "./pages/Blog/BlogDetail";
import Careers from "./pages/Careers/Careers";
import Team from "./pages/Team/Team";

// Admin Pages
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/Dashboard";
import DashboardHome from "./pages/Admin/DashboardHome";
import BlogListAdmin from "./pages/Admin/Blogs/BlogList";
import BlogEditor from "./pages/Admin/Blogs/BlogEditor";
import CareerList from "./pages/Admin/Careers/CareerList";
import CareerEditor from "./pages/Admin/Careers/CareerEditor";
import TeamList from "./pages/Admin/Team/TeamList";
import TeamEditor from "./pages/Admin/Team/TeamEditor";
import ProductList from "./pages/Admin/Products/ProductList";
import ProductEditor from "./pages/Admin/Products/ProductEditor";
import ContactSubmissions from "./pages/Admin/ContactSubmissions";
import Newsletter from "./pages/Admin/Newsletter";
import SiteSettings from "./pages/Admin/SiteSettings";
import LegalPages from "./pages/Admin/LegalPages";

// Protected Route Component
import ProtectedRoute from "./components/admin/ProtectedRoute";

export default function RouterView() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/products" element={<Products />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/team" element={<Team />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookie-policy" element={<Cookie />} />

      {/* Admin Login (Public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Blog Routes */}
        <Route path="blogs" element={<BlogListAdmin />} />
        <Route path="blogs/new" element={<BlogEditor />} />
        <Route path="blogs/edit/:id" element={<BlogEditor />} />

        {/* Career Routes */}
        <Route path="careers" element={<CareerList />} />
        <Route path="careers/new" element={<CareerEditor />} />
        <Route path="careers/edit/:id" element={<CareerEditor />} />

        {/* Team Routes (Admin Only) */}
        <Route path="team" element={<ProtectedRoute requireAdmin><TeamList /></ProtectedRoute>} />
        <Route path="team/new" element={<ProtectedRoute requireAdmin><TeamEditor /></ProtectedRoute>} />
        <Route path="team/edit/:id" element={<ProtectedRoute requireAdmin><TeamEditor /></ProtectedRoute>} />

        {/* Product Routes (Admin Only) */}
        <Route path="products" element={<ProtectedRoute requireAdmin><ProductList /></ProtectedRoute>} />
        <Route path="products/new" element={<ProtectedRoute requireAdmin><ProductEditor /></ProtectedRoute>} />
        <Route path="products/edit/:id" element={<ProtectedRoute requireAdmin><ProductEditor /></ProtectedRoute>} />

        {/* Contact Inbox */}
        <Route path="contact" element={<ContactSubmissions />} />

        {/* Newsletter */}
        <Route path="newsletter" element={<Newsletter />} />

        {/* Legal Pages (Admin Only) */}
        <Route path="legal" element={<ProtectedRoute requireAdmin><LegalPages /></ProtectedRoute>} />

        {/* Site Settings (Admin Only) */}
        <Route path="settings" element={<ProtectedRoute requireAdmin><SiteSettings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

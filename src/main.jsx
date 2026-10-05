import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import { AuthProvider } from "./context/AuthContext";

// Public pages
import Home from "./pages/Home";
import Features from "./pages/Features";
import About from "./pages/About";
import Support from "./pages/Support";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Safety from "./pages/Safety";
import Guidelines from "./pages/Guidelines";
import Accessibility from "./pages/Accessibility";
import PressKit from "./pages/PressKit";
import Status from "./pages/Status";
import Roadmap from "./pages/Roadmap";
import Careers from "./pages/Careers";
import DataRequest from "./pages/DataRequest";
import Download from "./pages/Download";

// Deep Link pages
import PostLink from "./pages/deeplinks/PostLink";
import CommunityLink from "./pages/deeplinks/CommunityLink";
import ProfileLink from "./pages/deeplinks/ProfileLink";
import InviteLink from "./pages/deeplinks/InviteLink";
import ChatLink from "./pages/deeplinks/ChatLink";

// Legal pages
import Privacy from "./pages/Privacy";
import CookiePolicy from "./pages/Cookies";
import Terms from "./pages/Terms";
import Licenses from "./pages/Licenses";

// Auth pages (standalone — no layout)
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// User portal pages
import Dashboard from "./pages/Dashboard";
import MyPosts from "./pages/MyPosts";
import MyCommunities from "./pages/MyCommunities";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Ops (admin) pages
import OpsLogin from "./pages/ops/OpsLogin";
import OpsResetPassword from "./pages/ops/OpsResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCommunities from "./pages/admin/AdminCommunities";
import AdminReports from "./pages/admin/AdminReports";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSafety from "./pages/admin/AdminSafety";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminContent from "./pages/admin/AdminContent";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminRoute from "./components/AdminRoute";

import "./styles/globals.css";

function OpsPage({ children }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}

function UserPage({ children }) {
  return (
    <UserLayout>{children}</UserLayout>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Ops login — standalone */}
          <Route path="/ops/login"          element={<OpsLogin />} />
          <Route path="/ops/reset-password" element={<OpsResetPassword />} />

          {/* Auth pages — standalone (no nav) */}
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* User portal — UserLayout with sidebar */}
          <Route path="/dashboard"      element={<UserPage><Dashboard /></UserPage>} />
          <Route path="/my-posts"       element={<UserPage><MyPosts /></UserPage>} />
          <Route path="/my-communities" element={<UserPage><MyCommunities /></UserPage>} />
          <Route path="/profile"        element={<UserPage><Profile /></UserPage>} />
          <Route path="/settings"       element={<UserPage><Settings /></UserPage>} />

          {/* Ops panel — AdminLayout */}
          <Route path="/ops"             element={<OpsPage><AdminDashboard /></OpsPage>} />
          <Route path="/ops/users"       element={<OpsPage><AdminUsers /></OpsPage>} />
          <Route path="/ops/communities" element={<OpsPage><AdminCommunities /></OpsPage>} />
          <Route path="/ops/reports"     element={<OpsPage><AdminReports /></OpsPage>} />
          <Route path="/ops/analytics"   element={<OpsPage><AdminAnalytics /></OpsPage>} />
          <Route path="/ops/safety"      element={<OpsPage><AdminSafety /></OpsPage>} />
          <Route path="/ops/settings"    element={<OpsPage><AdminSettings /></OpsPage>} />
          <Route path="/ops/content"     element={<OpsPage><AdminContent /></OpsPage>} />
          <Route path="/ops/messages"    element={<OpsPage><AdminMessages /></OpsPage>} />

          {/* Deep links — public MainLayout */}
          <Route path="/p/:id"            element={<MainLayout><PostLink /></MainLayout>} />
          <Route path="/c/:id"            element={<MainLayout><CommunityLink /></MainLayout>} />
          <Route path="/c/:id/sub/:subId" element={<MainLayout><CommunityLink /></MainLayout>} />
          <Route path="/u/:username"      element={<MainLayout><ProfileLink /></MainLayout>} />
          <Route path="/invite/:code"     element={<MainLayout><InviteLink /></MainLayout>} />
          <Route path="/chat/:id"         element={<MainLayout><ChatLink /></MainLayout>} />

          {/* Public pages — MainLayout */}
          <Route path="/"             element={<MainLayout><Home /></MainLayout>} />
          <Route path="/features"     element={<MainLayout><Features /></MainLayout>} />
          <Route path="/about"        element={<MainLayout><About /></MainLayout>} />
          <Route path="/support"      element={<MainLayout><Support /></MainLayout>} />
          <Route path="/contact"      element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/blog"         element={<MainLayout><Blog /></MainLayout>} />
          <Route path="/blog/:slug"   element={<MainLayout><BlogPost /></MainLayout>} />
          <Route path="/careers"      element={<MainLayout><Careers /></MainLayout>} />
          <Route path="/data-request" element={<MainLayout><DataRequest /></MainLayout>} />
          <Route path="/accessibility" element={<MainLayout><Accessibility /></MainLayout>} />
          <Route path="/press"        element={<MainLayout><PressKit /></MainLayout>} />
          <Route path="/status"       element={<MainLayout><Status /></MainLayout>} />
          <Route path="/roadmap"      element={<MainLayout><Roadmap /></MainLayout>} />
          <Route path="/safety"       element={<MainLayout><Safety /></MainLayout>} />
          <Route path="/guidelines"   element={<MainLayout><Guidelines /></MainLayout>} />
          <Route path="/download"     element={<MainLayout><Download /></MainLayout>} />

          {/* Legal */}
          <Route path="/privacy"   element={<MainLayout><Privacy /></MainLayout>} />
          <Route path="/cookies"   element={<MainLayout><CookiePolicy /></MainLayout>} />
          <Route path="/terms"     element={<MainLayout><Terms /></MainLayout>} />
          <Route path="/licenses"  element={<MainLayout><Licenses /></MainLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

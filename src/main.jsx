import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { initErrorTracking } from "./lib/errorTracking";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
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
import ShortPostLink from "./pages/deeplinks/ShortPostLink";
import ShortSpaceLink from "./pages/deeplinks/ShortSpaceLink";
import DeepLinkHandler from "./components/DeepLinkHandler";
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
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyPosts = lazy(() => import("./pages/MyPosts"));
const MyCommunities = lazy(() => import("./pages/MyCommunities"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

// Ops (admin) pages
const OpsLogin = lazy(() => import("./pages/ops/OpsLogin"));
const OpsResetPassword = lazy(() => import("./pages/ops/OpsResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCommunities = lazy(() => import("./pages/admin/AdminCommunities"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSafety = lazy(() => import("./pages/admin/AdminSafety"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminPublish = lazy(() => import("./pages/admin/AdminPublish"));
const AdminOfficialCommunity = lazy(() => import("./pages/admin/AdminOfficialCommunity"));
const AdminSponsorships = lazy(() => import("./pages/admin/AdminSponsorships"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminSystemHealth = lazy(() => import("./pages/admin/AdminSystemHealth"));
const BusinessLayout = lazy(() => import("./layouts/BusinessLayout"));
const BusinessHome = lazy(() => import("./layouts/BusinessLayout").then((m) => ({ default: m.BusinessHome })));
const BusinessRoute = lazy(() => import("./layouts/BusinessLayout").then((m) => ({ default: m.BusinessRoute })));
const BusinessOverview = lazy(() => import("./pages/business/BusinessPages").then((m) => ({ default: m.BusinessOverview })));
const BusinessPromotions = lazy(() => import("./pages/business/BusinessPages").then((m) => ({ default: m.BusinessPromotions })));
const BusinessAnalytics = lazy(() => import("./pages/business/BusinessPages").then((m) => ({ default: m.BusinessAnalytics })));
const BusinessTeam = lazy(() => import("./pages/business/BusinessPages").then((m) => ({ default: m.BusinessTeam })));
const BusinessBilling = lazy(() => import("./pages/business/BusinessPages").then((m) => ({ default: m.BusinessBilling })));
const BusinessSettings = lazy(() => import("./pages/business/BusinessPages").then((m) => ({ default: m.BusinessSettings })));
const AdminRoute = lazy(() => import("./components/AdminRoute"));

// Web app (logged-in Starstreak)
const AppRoute = lazy(() => import("./app/AppRoute"));
const HomePage = lazy(() => import("./app/pages/HomePage"));
const PostPage = lazy(() => import("./app/pages/PostPage"));
const ProfilePage = lazy(() => import("./app/pages/ProfilePage"));
const SoonPage = lazy(() => import("./app/pages/SoonPage"));
const ExplorePage = lazy(() => import("./app/pages/ExplorePage"));
const NotificationsPage = lazy(() => import("./app/pages/NotificationsPage"));
const CommunitiesPage = lazy(() => import("./app/pages/CommunitiesPage"));
const CommunityPage = lazy(() => import("./app/pages/CommunityPage"));
const FlashesPage = lazy(() => import("./app/pages/FlashesPage"));
const FlashPage = lazy(() => import("./app/pages/FlashPage"));
// The web is the lighter Starstreak: messages and creating communities / Flashes
// are app-only. Their full web versions are kept (app/pages/MessagesPage.jsx,
// CreatePages.jsx) — swap the elements below back to switch them on.
const AppOnlyPage = lazy(() => import("./app/pages/AppOnlyPage"));
const SavedPage = lazy(() => import("./app/pages/SavedPage"));

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

initErrorTracking();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        {/* The ops, business, web-app and account sections load when first
            opened, so visitors to the public site don't download them. */}
        <Suspense fallback={<div className="min-h-screen bg-night-950" aria-busy="true" />}>
        <Routes>
          {/* Ops login — standalone */}
          <Route path="/ops/login"          element={<OpsLogin />} />
          <Route path="/ops/reset-password" element={<OpsResetPassword />} />

          {/* Auth pages — standalone (no nav) */}
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Web app — logged in */}
          <Route element={<AppRoute />}>
            <Route path="/home"               element={<HomePage />} />
            <Route path="/post/:id"           element={<PostPage />} />
            <Route path="/profile/:username"  element={<ProfilePage />} />
            <Route path="/explore"            element={<ExplorePage />} />
            <Route path="/saved"              element={<SavedPage />} />
            <Route path="/notifications"      element={<NotificationsPage />} />
            <Route path="/messages"                             element={<AppOnlyPage feature="messages" />} />
            <Route path="/messages/:conversationId"             element={<AppOnlyPage feature="messages" />} />
            <Route path="/communities"                          element={<CommunitiesPage />} />
            <Route path="/communities/new"                      element={<AppOnlyPage feature="community" />} />
            <Route path="/communities/:communityId"             element={<CommunityPage />} />
            <Route path="/communities/:communityId/post/:postId" element={<PostPage kind="community" />} />
            <Route path="/flashes"                              element={<FlashesPage />} />
            <Route path="/flashes/new"                          element={<AppOnlyPage feature="flash" />} />
            <Route path="/flashes/:flashId"                     element={<FlashPage />} />
            <Route path="/flashes/:flashId/post/:postId"        element={<PostPage kind="flash" />} />
          </Route>
          <Route path="/app" element={<Navigate to="/home" replace />} />

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
          <Route path="/ops/publish"     element={<OpsPage><AdminPublish /></OpsPage>} />
          <Route path="/ops/starstreak-community" element={<OpsPage><AdminOfficialCommunity /></OpsPage>} />
          <Route path="/ops/organisations" element={<OpsPage><AdminSponsorships /></OpsPage>} />
          <Route path="/ops/activity"    element={<OpsPage><AdminActivity /></OpsPage>} />
          <Route path="/ops/health"      element={<OpsPage><AdminSystemHealth /></OpsPage>} />

          {/* Starstreak Business — a verified organisation's own dashboard */}
          <Route path="/business" element={<BusinessRoute><BusinessHome /></BusinessRoute>} />
          {[
            ["overview", BusinessOverview], ["promotions", BusinessPromotions], ["analytics", BusinessAnalytics],
            ["team", BusinessTeam], ["billing", BusinessBilling], ["settings", BusinessSettings],
          ].map(([path, Page]) => (
            <Route key={path} path={`/business/:orgId/${path}`}
                   element={<BusinessRoute><BusinessLayout><Page /></BusinessLayout></BusinessRoute>} />
          ))}
          <Route path="/ops/messages"    element={<OpsPage><AdminMessages /></OpsPage>} />

          {/* Deep links — public MainLayout */}
          <Route path="/p/:id"            element={<MainLayout><PostLink /></MainLayout>} />
          <Route path="/c/:id"            element={<MainLayout><CommunityLink /></MainLayout>} />
          <Route path="/c/:id/sub/:subId" element={<MainLayout><CommunityLink /></MainLayout>} />
          <Route path="/u/:username"      element={<MainLayout><ProfileLink /></MainLayout>} />
          <Route path="/invite/:code"     element={<MainLayout><InviteLink /></MainLayout>} />
          <Route path="/chat/:id"         element={<MainLayout><ChatLink /></MainLayout>} />
          <Route path="/join/:code"                       element={<MainLayout><DeepLinkHandler type="communityInvite" /></MainLayout>} />
          <Route path="/community/:shortId"                element={<MainLayout><ShortSpaceLink kind="community" /></MainLayout>} />
          <Route path="/flash/:shortId"                    element={<MainLayout><ShortSpaceLink kind="flash" /></MainLayout>} />
          <Route path="/:username/post/:shortId"           element={<MainLayout><ShortPostLink kind="post" /></MainLayout>} />
          <Route path="/:username/community-post/:shortId" element={<MainLayout><ShortPostLink kind="community-post" /></MainLayout>} />
          <Route path="/:username/flash-post/:shortId"     element={<MainLayout><ShortPostLink kind="flash-post" /></MainLayout>} />

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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import React from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import RouterView from "./router";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { useLocation } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* Hide Header/Footer on admin routes */}
      {!isAdminRoute && <Header />}

      <main className="flex-1">
        <RouterView />
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

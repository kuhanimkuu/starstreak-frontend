import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

/**
 * Public pages. Pages own their full-bleed hero/sections; the navbar is fixed
 * and transparent at the top, so heroes include their own top padding.
 */
export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-night-900 text-star">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

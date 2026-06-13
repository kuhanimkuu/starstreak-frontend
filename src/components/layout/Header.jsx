import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, LogIn, LayoutDashboard, Sparkles } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme, setTheme } = useContext(ThemeContext);
  const { currentUser } = useAuth();
  const location = useLocation();

  // Detect scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/products", label: "Products" },
    { to: "/blog", label: "Blog" },
    { to: "/careers", label: "Careers" },
    { to: "/team", label: "Team" },
    { to: "/contact", label: "Contact" },
  ];

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const logoSrc = "/starstreak_logo.png";

  const themeIcon =
    resolvedTheme === "dark" ? (
      <Moon size={16} className="text-gray-300" />
    ) : (
      <Sun size={16} className="text-yellow-500" />
    );

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 
        backdrop-blur-xl 
        transition-all duration-500
        ${scrolled
          ? 'border-b border-emerald-500/15 shadow-lg shadow-emerald-500/5 bg-white/90 dark:bg-slate-950/90'
          : 'border-b border-transparent bg-white/70 dark:bg-slate-950/70'
        }
      `}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between gap-4 py-3 md:py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src={logoSrc}
              alt="Starstreak Logo"
              className="h-10 md:h-12 lg:h-14 object-contain group-hover:scale-105 transition-all duration-500 filter drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    font-medium text-sm transition-all duration-300 whitespace-nowrap
                    relative group px-1 py-1
                    ${isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400'
                    }
                  `}
                >
                  {link.label}
                  <span
                    className={`
                      absolute -bottom-0.5 left-0 h-[2px] rounded-full
                      bg-linear-to-r from-emerald-400 to-teal-400
                      transition-all duration-500
                      ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-2.5">

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="
                p-2.5 rounded-xl
                bg-black/5 dark:bg-white/5
                hover:bg-black/10 dark:hover:bg-white/10
                hover:scale-105
                transition-all duration-300
                border border-transparent hover:border-emerald-500/20
              "
              aria-label="Toggle theme"
            >
              {themeIcon}
            </button>

            {/* LOGIN / DASHBOARD BUTTON */}
            {currentUser ? (
              <Link
                to="/admin/dashboard"
                className="
                  inline-flex items-center gap-2 px-4 py-2.5
                  bg-black/5 dark:bg-white/5
                  text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm
                  border border-gray-200 dark:border-gray-700
                  hover:border-emerald-500 dark:hover:border-emerald-400
                  hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10
                  transition-all duration-300
                "
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="
                  inline-flex items-center gap-2 px-4 py-2.5
                  bg-black/5 dark:bg-white/5
                  text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm
                  border border-gray-200 dark:border-gray-700
                  hover:border-emerald-500 dark:hover:border-emerald-400
                  hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10
                  transition-all duration-300
                "
              >
                <LogIn size={15} />
                Login
              </Link>
            )}

            <Link
              to="/contact"
              className="
                group relative inline-flex items-center gap-2 px-5 py-2.5
                bg-linear-to-r from-emerald-600 to-teal-600
                text-white font-semibold rounded-xl text-sm
                shadow-lg shadow-emerald-500/20
                hover:shadow-emerald-500/40
                hover:scale-105
                transition-all duration-500
                overflow-hidden
              "
            >
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <Sparkles size={14} className="relative z-10" />
              <span className="relative z-10">Get Started</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="
              lg:hidden text-gray-800 dark:text-white
              p-2 hover:text-emerald-500 dark:hover:text-emerald-400
              transition-colors
              bg-black/5 dark:bg-white/5 rounded-xl
              hover:bg-black/10 dark:hover:bg-white/10
            "
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="
              lg:hidden pb-6 border-t border-emerald-500/10
              mt-3 pt-4 space-y-2 animate-fade-in
            "
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block font-medium py-2.5 px-3 rounded-xl transition-all duration-300
                    ${isActive
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                      : 'text-gray-700 dark:text-gray-300 hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/5'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 space-y-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="
                  w-full flex justify-center items-center gap-2
                  py-3 rounded-xl
                  bg-black/5 dark:bg-white/5
                  hover:bg-black/10 dark:hover:bg-white/10
                  transition
                  border border-transparent hover:border-emerald-500/20
                "
              >
                {themeIcon}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
              </button>

              {/* Mobile LOGIN / DASHBOARD BUTTON */}
              {currentUser ? (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="
                    flex items-center justify-center gap-2 w-full px-6 py-3
                    bg-black/5 dark:bg-white/5
                    text-gray-700 dark:text-gray-300 font-semibold rounded-xl
                    border border-gray-200 dark:border-gray-700
                    hover:border-emerald-500 dark:hover:border-emerald-400
                    transition-all duration-300
                  "
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="
                    flex items-center justify-center gap-2 w-full px-6 py-3
                    bg-black/5 dark:bg-white/5
                    text-gray-700 dark:text-gray-300 font-semibold rounded-xl
                    border border-gray-200 dark:border-gray-700
                    hover:border-emerald-500 dark:hover:border-emerald-400
                    transition-all duration-300
                  "
                >
                  <LogIn size={18} />
                  Login
                </Link>
              )}

              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  group relative flex items-center justify-center gap-2 w-full px-6 py-3
                  bg-linear-to-r from-emerald-600 to-teal-600
                  text-white font-bold rounded-xl
                  shadow-lg shadow-emerald-500/20
                  transition-all duration-300
                  overflow-hidden
                "
              >
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <Sparkles size={16} className="relative z-10" />
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

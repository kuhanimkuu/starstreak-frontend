import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, LogIn, LayoutDashboard } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useContext(ThemeContext);
  const { currentUser } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/products", label: "Products" },
    { to: "/blog", label: "Blog" },
    { to: "/careers", label: "Careers" },
    { to: "/team", label: "Team" },
    { to: "/contact", label: "Contact" },
  ];

  // Toggle between ONLY light and dark
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Logo - using your Starstreak logo
  const logoSrc = "/starstreak_logo.png";

  const themeIcon =
    resolvedTheme === "dark" ? (
      <Moon size={18} className="text-gray-300" />
    ) : (
      <Sun size={18} className="text-yellow-500" />
    );

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50 
        backdrop-blur-lg 
        border-b border-emerald-500/10
        bg-white/80 dark:bg-slate-950/80
        transition-colors duration-300
      "
    >
      <div className="container-custom">
        <div className="flex items-center justify-between gap-4 py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src={logoSrc}
              alt="Starstreak Logo"
              className="h-12 md:h-14 lg:h-16 object-contain group-hover:scale-105 transition-transform filter drop-shadow-lg"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    font-medium transition-colors whitespace-nowrap
                    relative group
                    ${isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-emerald-400'
                    }
                  `}
                >
                  {link.label}
                  <span
                    className={`
                      absolute -bottom-1 left-0 h-0.5
                      bg-linear-to-r from-emerald-400 to-teal-400
                      transition-all duration-300
                      ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                    `}
                  ></span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-3">

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="
                p-2.5 rounded-lg
                bg-black/5 dark:bg-white/5
                hover:bg-black/10 dark:hover:bg-white/10
                transition
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
                  inline-flex items-center gap-2 px-5 py-2.5
                  bg-gray-100 dark:bg-gray-800
                  text-gray-900 dark:text-white font-semibold rounded-lg text-sm
                  border-2 border-gray-300 dark:border-gray-700
                  hover:border-emerald-500 dark:hover:border-emerald-400
                  transition-all duration-300
                "
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="
                  inline-flex items-center gap-2 px-5 py-2.5
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white font-semibold rounded-lg text-sm
                  border-2 border-gray-300 dark:border-gray-700
                  hover:border-emerald-500 dark:hover:border-emerald-400
                  transition-all duration-300
                "
              >
                <LogIn size={16} />
                Login
              </Link>
            )}

            <Link
              to="/contact"
              className="
                px-6 py-2.5
                bg-linear-to-r from-emerald-600 to-teal-600
                text-white font-semibold rounded-lg text-sm
                hover:shadow-lg hover:shadow-emerald-500/50
                transform hover:scale-105
                transition-all duration-300
              "
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="
              lg:hidden text-gray-800 dark:text-white
              p-2 hover:text-emerald-400 transition-colors
            "
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="
              lg:hidden pb-6 border-t border-emerald-500/10
              mt-4 pt-4 space-y-3 animate-fade-in
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
                    block font-medium py-2 transition-colors
                    ${isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-emerald-400'
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="
                w-full flex justify-center items-center gap-2
                py-3 rounded-lg
                bg-black/5 dark:bg-white/5
                hover:bg-black/10 dark:hover:bg-white/10
                transition
              "
            >
              {themeIcon}
              <span className="text-gray-700 dark:text-gray-300">
                Theme: {resolvedTheme === "dark" ? "Dark" : "Light"}
              </span>
            </button>

            {/* Mobile LOGIN / DASHBOARD BUTTON */}
            {currentUser ? (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  flex items-center justify-center gap-2 w-full px-6 py-3
                  bg-gray-100 dark:bg-gray-800
                  text-gray-900 dark:text-white font-bold rounded-lg text-center
                  border-2 border-gray-300 dark:border-gray-700
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
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white font-bold rounded-lg text-center
                  border-2 border-gray-300 dark:border-gray-700
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
                block w-full px-6 py-3
                bg-linear-to-r from-emerald-600 to-teal-600
                text-white font-bold rounded-lg text-center
                hover:shadow-lg transition-all duration-300
              "
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

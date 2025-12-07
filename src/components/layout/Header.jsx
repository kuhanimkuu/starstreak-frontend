import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useContext(ThemeContext);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  // Toggle between ONLY light and dark
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Logo switching based on theme
  const logoSrc =
    resolvedTheme === "dark"
      ? "/starstreak_logo_dark.png"
      : "/starstreak_logo_light.png";

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
        <div className="flex items-center justify-between py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoSrc}
              alt="Starstreak Logo"
              className="h-8 object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="
                  text-gray-700 dark:text-gray-300 
                  hover:text-emerald-400 
                  font-medium transition-colors 
                  relative group
                "
              >
                {link.label}
                <span
                  className="
                    absolute -bottom-1 left-0 w-0 h-0.5 
                    bg-linear-to-r from-emerald-400 to-teal-400 
                    group-hover:w-full 
                    transition-all duration-300
                  "
                ></span>
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="
                p-2 rounded-lg 
                bg-black/5 dark:bg-white/5 
                hover:bg-black/10 dark:hover:bg-white/10
                transition
              "
            >
              {themeIcon}
            </button>

            <Link
              to="/contact"
              className="
                px-6 py-2.5 
                bg-linear-to-r from-emerald-600 to-teal-600 
                text-white font-bold rounded-lg 
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
              md:hidden text-gray-800 dark:text-white 
              text-2xl hover:text-emerald-400 transition-colors
            "
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="
              md:hidden pb-6 border-t border-emerald-500/10 
              mt-4 pt-4 space-y-4 animate-fade-in
            "
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="
                  block 
                  text-gray-700 dark:text-gray-300 
                  hover:text-emerald-400 
                  font-medium py-2 transition-colors
                "
              >
                {link.label}
              </Link>
            ))}

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

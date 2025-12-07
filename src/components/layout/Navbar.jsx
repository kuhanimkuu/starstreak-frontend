import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center space-x-8">
      <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
      <Link to="/about" className="hover:text-emerald-400 transition">About</Link>
      <Link to="/products" className="hover:text-emerald-400 transition">Products</Link>
      <Link to="/contact" className="hover:text-emerald-400 transition">Contact</Link>
    </nav>
  );
}

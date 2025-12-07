import React from "react";
import { Check } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="p-8 rounded-xl border border-white/10 bg-[#0f1522] hover:-translate-y-2 transition-transform">

      {/* Gradient Header Icon */}
      <div
        className={`w-16 h-16 rounded-xl bg-linear-to-br ${product.color} flex items-center justify-center text-white font-extrabold text-2xl mb-6`}
      >
        {product.name[0]}
      </div>

      {/* Title + Tagline */}
      <h2 className="text-3xl font-bold mb-2">
        {product.name}
      </h2>

      <p className="text-emerald-400 text-sm font-semibold mb-4">
        {product.tagline}
      </p>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed mb-6">
        {product.description}
      </p>

      {/* Features */}
      <ul className="space-y-3">
        {product.features.map((feature, index) => (
          <li
            key={index}
            className="flex items-center space-x-3 text-gray-300"
          >
            <Check size={18} className="text-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

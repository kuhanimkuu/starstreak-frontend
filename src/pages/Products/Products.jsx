import React from "react";
import { Smartphone, Shield, Sparkles, ExternalLink } from 'lucide-react';

export default function Products() {
  const products = [
    {
      name: "Nexora",
      tagline: "Connect. Create. Thrive Together.",
      description:
        "Nexora is a modern social ecosystem that brings people, creators, and communities together. With real-time messaging, community spaces, dynamic feeds, and creator-first tools, Nexora helps users discover content, build audiences, and form meaningful connections across interests and geographies.",
      features: [
        "Community spaces & topic-based groups",
        "Real-time direct messaging and group chats",
        "Dynamic discovery feed with trending content",
        "Flash events & time-limited communities",
        "Creator tools and monetization pathways",
        "Privacy-forward controls and verified identities",
      ],
      color: "from-blue-500 via-indigo-500 to-purple-500",
      icon: <Smartphone className="w-12 h-12" />,
      status: "Live Now",
      statusColor: "bg-green-500",
      link: "https://nexora.starstreak.org",
    },
    {
      name: "Trustia",
      tagline: "Trust Verified. Privacy Protected.",
      description:
        "A next-generation identity verification and trust platform. Trustia helps businesses verify users, prevent fraud, and build trusted digital communities with advanced AI-powered verification, compliance tools, and privacy-first architecture.",
      features: [
        "AI-powered identity verification",
        "Real-time fraud detection",
        "Compliance automation (KYC/AML)",
        "Privacy-preserving technology",
        "Blockchain-based trust scores",
        "Enterprise-grade security",
      ],
      color: "from-amber-500 via-orange-500 to-red-500",
      icon: <Shield className="w-12 h-12" />,
      status: "Coming Soon",
      statusColor: "bg-yellow-500",
      link: null,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header Section */}
      <div className="container-custom pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20 mb-8">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">Our Product Ecosystem</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
          Building the
          <span className="block mt-2 text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400">
            Future Together
          </span>
        </h1>

        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Starstreak creates innovative digital solutions that empower communities, protect privacy, and drive meaningful connections worldwide.
        </p>
      </div>

      {/* Products Grid */}
      <div className="container-custom pb-32">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {products.map((product, i) => (
            <div
              key={i}
              className="group relative bg-linear-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02]"

            >
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${product.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}
              ></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl bg-linear-to-br ${product.color} text-white shadow-lg`}>
                    {product.icon}
                  </div>
                  <span className={`${product.statusColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {product.status}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  {product.name}
                </h2>
                <p className={`text-lg font-semibold mb-4 text-transparent bg-clip-text bg-linear-to-r ${product.color}`}>
                  {product.tagline}
                </p>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full bg-linear-to-r ${product.color} mt-2 shrink-0`}></div>
                      <span className="text-gray-400 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                {product.link ? (
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r ${product.color} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
                  >
                    <span>Learn More</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-gray-500 font-bold rounded-xl border border-white/10 cursor-not-allowed"
                  >
                    <span>Coming Soon</span>
                  </button>
                )}
              </div>

              {/* Decorative Elements */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${product.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container-custom pb-32">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 text-center">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to Transform Your Digital Experience?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of users already exploring Starstreak products.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300"
              >
                Get in Touch
              </a>
              <a
                href="/about"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Learn About Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

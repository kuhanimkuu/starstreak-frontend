import { useRef } from 'react';
import Hero from "./Hero";
import Features from "./Features";
import CTA from "./CTA";

export default function Home() {
  return (
    <div
      className="
        min-h-screen relative overflow-hidden
        bg-white dark:bg-[#0f1322]
        transition-colors duration-500
      "
    >

      {/* Background Grid Overlay */}
      <div
        className="
          absolute inset-0 pointer-events-none opacity-[0.04]
          bg-[linear-gradient(to_right,#00000020_1px,transparent_1px),
              linear-gradient(to_bottom,#00000020_1px,transparent_1px)]
          dark:bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),
                   linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)]
          bg-size-[40px_40px]
          transition-all duration-300
        "
      />

      {/* Accent Glow */}
      <div
        className="
          absolute top-48 left-1/2 -translate-x-1/2 w-[700px] h-[700px]
          bg-emerald-500/10 dark:bg-emerald-500/20
          blur-[200px] rounded-full pointer-events-none
          transition-all duration-300
        "
      />

      {/* Main Content */}
      <main className="relative z-10">

        {/* Hero Section */}
        <Hero />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-500/5 to-transparent dark:via-emerald-500/3 h-32 -top-16" />
        </div>

        {/* Features Section with section heading */}
        <section className="container-custom section-padding">
          <div className="text-center mb-16 reveal">
            <div className="
              inline-flex items-center gap-2 px-4 py-1.5 mb-4
              bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full
              border border-emerald-500/20
            ">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                What We Offer
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Built for the{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                Future
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every product in the Starstreak ecosystem is engineered for performance, security, and seamless integration.
            </p>
          </div>
          <Features />
        </section>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-500/5 to-transparent dark:via-emerald-500/3 h-32 -top-16" />
        </div>

        {/* Call To Action Section */}
        <section className="container-custom section-padding">
          <CTA />
        </section>

        {/* Bottom spacer */}
        <div className="h-16" />

      </main>
    </div>
  );
}

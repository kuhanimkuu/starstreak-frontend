import { useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';

// Floating decorative particles
const FLOATING_ICONS = [
  { Icon: Star, x: '10%', y: '15%', delay: '0s', size: 16 },
  { Icon: Zap, x: '85%', y: '20%', delay: '1s', size: 20 },
  { Icon: Sparkles, x: '20%', y: '75%', delay: '2s', size: 14 },
  { Icon: Star, x: '75%', y: '80%', delay: '0.5s', size: 18 },
];

export default function CTA() {
  const sectionRef = useScrollReveal(0.1);

  return (
    <div className="relative noise-overlay">
      {/* Full-width gradient backdrop */}
      <div className="
        absolute inset-0 rounded-3xl
        bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600
        dark:from-emerald-700/60 dark:via-teal-700/40 dark:to-cyan-700/30
        overflow-hidden
      ">
        {/* Animated grid inside CTA */}
        <div
          className="absolute inset-0 opacity-10 animate-noise-shift"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gradient orbs inside CTA */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-[80px] animate-float-slow" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-[80px] animate-float-slow animation-delay-2000" />
      </div>

      {/* Floating animated icons */}
      {FLOATING_ICONS.map(({ Icon, x, y, delay, size }, i) => (
        <div
          key={i}
          className="absolute z-10 hidden md:block"
          style={{ left: x, top: y }}
        >
          <Icon
            size={size}
            className="text-white/30 dark:text-white/20 animate-float-slow"
            style={{ animationDelay: delay }}
          />
        </div>
      ))}

      {/* Content */}
      <div
        ref={sectionRef}
        className="
          relative z-10 text-center p-12 md:p-20
          reveal
        "
      >
        {/* Badge */}
        <div className="
          inline-flex items-center gap-2 px-4 py-1.5 mb-8
          bg-white/15 backdrop-blur-sm rounded-full
          border border-white/20
        ">
          <Sparkles size={14} className="text-white/80" />
          <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
            Next-Gen Ecosystem
          </span>
        </div>

        <h2 className="
          text-4xl md:text-5xl font-extrabold mb-6
          text-white
          leading-tight
        ">
          Explore the{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-200 via-teal-200 to-cyan-200">
            Starstreak
          </span>
          {' '}Ecosystem
        </h2>

        <p className="
          max-w-2xl mx-auto mb-10 leading-relaxed text-lg
          text-white/80
        ">
          From Nexora to upcoming platforms like Trustia, Starstreak is building 
          a unified suite of next-generation digital products designed for speed, 
          security, and seamless user experiences.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-5">
          <Link
            to="/products"
            className="
              group relative inline-flex items-center gap-3
              px-9 py-4 rounded-xl font-bold
              bg-white text-emerald-700
              shadow-2xl
              hover:shadow-white/30
              hover:-translate-y-1
              transition-all duration-500
              overflow-hidden
            "
          >
            <span className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-200/30 to-transparent animate-shimmer" />
            <span className="relative z-10">View Our Products</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/about"
            className="
              inline-flex items-center gap-2
              px-9 py-4 rounded-xl font-bold
              bg-white/10 backdrop-blur-sm
              border-2 border-white/30
              text-white
              hover:bg-white/20 hover:border-white/50
              hover:-translate-y-1
              transition-all duration-500
            "
          >
            Learn About Us
          </Link>
        </div>
      </div>
    </div>
  );
}

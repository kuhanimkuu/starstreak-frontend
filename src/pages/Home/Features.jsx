import { useRef, useEffect, useState } from 'react';
import { Rocket, Shield, Cpu, Zap, ArrowUpRight } from "lucide-react";
import useScrollReveal from '../../hooks/useScrollReveal';

const FEATURES = [
  {
    icon: Rocket,
    title: "Unified Digital Ecosystem",
    desc: "Starstreak brings together platforms like Nexora and Trustia into one connected ecosystem built for long-term expansion.",
    gradient: "from-emerald-500 via-emerald-400 to-teal-400",
    bgGlow: "from-emerald-500/20 via-emerald-400/10 to-transparent",
  },
  {
    icon: Shield,
    title: "Privacy & Security First",
    desc: "Our products follow strict encryption standards and modern protection layers to keep users safe across the ecosystem.",
    gradient: "from-teal-500 via-teal-400 to-cyan-400",
    bgGlow: "from-teal-500/20 via-teal-400/10 to-transparent",
  },
  {
    icon: Cpu,
    title: "Smart, Adaptive Technology",
    desc: "Intelligent infrastructure automatically optimizes performance, reliability, and resource efficiency across all Starstreak platforms.",
    gradient: "from-cyan-500 via-cyan-400 to-sky-400",
    bgGlow: "from-cyan-500/20 via-cyan-400/10 to-transparent",
  },
  {
    icon: Zap,
    title: "Seamless Cross-Platform Flow",
    desc: "Unified APIs allow our products to communicate effortlessly, enabling a smooth experience for users across the ecosystem.",
    gradient: "from-violet-500 via-purple-400 to-emerald-400",
    bgGlow: "from-violet-500/20 via-purple-400/10 to-transparent",
  },
];

function FeatureCard({ icon: Icon, title, desc, gradient, bgGlow, index }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const revealedRef = useScrollReveal(0.1);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <article
      ref={(node) => {
        cardRef.current = node;
        revealedRef.current = node;
      }}
      className={`
        group relative p-8 rounded-2xl text-center
        border border-gray-200 dark:border-white/10
        bg-white/80 dark:bg-white/[0.03]
        backdrop-blur-sm
        transition-all duration-700 ease-out
        hover:shadow-2xl hover:shadow-emerald-500/10
        reveal reveal-delay-${index + 1}
      `}
      style={{
        transform: `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: 'transform 0.3s ease-out, box-shadow 0.5s ease, background 0.5s ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow background on hover */}
      <div
        className={`
          absolute inset-0 rounded-2xl bg-linear-to-br ${bgGlow}
          opacity-0 group-hover:opacity-100
          transition-opacity duration-700
        `}
      />

      {/* Hover border glow */}
      <div className="absolute inset-0 rounded-2xl border border-emerald-400/0 group-hover:border-emerald-400/40 dark:group-hover:border-emerald-400/50 transition-all duration-500" />

      {/* Icon with animated gradient ring */}
      <div className="relative mb-6 flex justify-center">
        <div
          className={`
            relative w-16 h-16 rounded-2xl
            bg-linear-to-br ${gradient}
            p-[2px]
            shadow-lg
            group-hover:scale-110 group-hover:rotate-3
            transition-all duration-500
          `}
        >
          <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
            <Icon
              size={28}
              className={`
                text-transparent bg-clip-text bg-linear-to-br ${gradient}
                group-hover:scale-110 transition-transform duration-500
              `}
            />
          </div>
          {/* Ring pulse */}
          <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:animate-border-pulse" />
        </div>

        {/* Floating number badge */}
        <span className="
          absolute -top-2 -right-2 w-7 h-7 rounded-full
          bg-linear-to-br from-gray-800 to-gray-700 dark:from-white/20 dark:to-white/5
          text-white dark:text-white/80 text-xs font-bold
          flex items-center justify-center
          shadow-lg
          group-hover:scale-110 transition-transform duration-300
        ">
          {index + 1}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 transition-colors">
        {desc}
      </p>

      {/* Hover arrow indicator */}
      <div className="
        absolute bottom-4 right-4
        opacity-0 group-hover:opacity-100
        translate-y-2 group-hover:translate-y-0
        transition-all duration-500
      ">
        <ArrowUpRight size={18} className="text-emerald-500 dark:text-emerald-400" />
      </div>
    </article>
  );
}

export default function Features() {
  return (
    <section className="
      grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
    ">
      {FEATURES.map((feature, index) => (
        <FeatureCard key={index} {...feature} index={index} />
      ))}
    </section>
  );
}

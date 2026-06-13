
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Zap, Users, Shield, TrendingUp, Sparkles, Star } from 'lucide-react';

const PILL_FEATURES = [
  { icon: Users, label: "Ecosystem-Driven" },
  { icon: Shield, label: "Secure by Design" },
  { icon: TrendingUp, label: "Built to Scale" },
];

const STATS = [
  { number: "2+", label: "Flagship Products" },
  { number: "50K+", label: "Active Users" },
  { number: "9.9%", label: "Platform Uptime" },
];

// Floating particles
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  delay: Math.random() * 6,
  duration: Math.random() * 4 + 6,
}));

// Animated counter hook
function useCountUp(target, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let startTime = null;
    let frame;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const raw = parseFloat(target) * eased;
      // Handle decimal targets like 99.9
      const formatted = target.includes('.') ? raw.toFixed(1) : Math.floor(raw).toString();
      setCount(formatted);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, startCounting]);
  return count;
}

function StatItem({ number, label, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(number.replace(/[+,.]/g, ''), 2000, visible);
  const isDecimal = number.includes('.');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group text-center transform transition-all duration-500 hover:scale-110"
    >
      <div className="relative inline-block">
        <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
          {visible ? count : '0'}
          {number.includes('+') ? '+' : isDecimal ? '.9%' : ''}
        </div>
        {/* Underline glow */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full" />
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
}

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="
        relative overflow-hidden min-h-screen flex items-center
        bg-linear-to-br from-white via-gray-50 to-gray-100
        dark:from-slate-950 dark:via-emerald-950 dark:to-teal-950
        transition-colors duration-500
      "
    >
      {/* ---- 1. ANIMATED GRID (rotating perspective) ---- */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `perspective(800px) rotateX(${mousePos.y * 2}deg) rotateY(${mousePos.x * 2}deg)`,
          transition: 'transform 0.2s ease-out',
        }}
      />

      {/* ---- 2. MORPHING BLOB (cinematic background) ---- */}
      <div
        className="
          absolute -top-40 -left-40 w-[500px] h-[500px] md:w-[700px] md:h-[700px]
          bg-linear-to-br from-emerald-400/20 via-teal-400/15 to-cyan-400/20
          dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-cyan-500/20
          animate-morph-blob blur-[100px]
        "
        style={{
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />
      <div
        className="
          absolute -bottom-40 -right-40 w-[400px] h-[400px] md:w-[600px] md:h-[600px]
          bg-linear-to-br from-purple-400/10 via-pink-400/10 to-emerald-400/10
          dark:from-purple-500/10 dark:via-pink-500/10 dark:to-emerald-500/10
          animate-morph-blob blur-[120px] animation-delay-2000
        "
        style={{
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
          transition: 'transform 0.4s ease-out',
        }}
      />

      {/* ---- 3. FLOATING PARTICLES ---- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-emerald-500/40 dark:bg-emerald-400/30 animate-particle"
            style={{
              width: p.size + 'px',
              height: p.size + 'px',
              left: p.x + '%',
              top: '80%',
              animationDelay: p.delay + 's',
              animationDuration: p.duration + 's',
            }}
          />
        ))}
      </div>

      {/* ---- 4. ORBITING DECORATIVE ELEMENTS ---- */}
      <div className="absolute top-1/4 right-[5%] w-24 h-24 hidden lg:block">
        <div className="w-full h-full border border-emerald-400/20 rounded-full animate-orbit">
          <div className="w-3 h-3 bg-emerald-400/60 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
        </div>
      </div>
      <div className="absolute bottom-1/4 left-[5%] w-16 h-16 hidden lg:block">
        <div className="w-full h-full border border-teal-400/20 rounded-full animate-orbit-reverse">
          <div className="w-2 h-2 bg-teal-400/60 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* ---- 5. NOISE OVERLAY ---- */}
      <div className="absolute inset-0 noise-overlay" />

      {/* ---- 6. MAIN CONTENT ---- */}
      <div className="container-custom relative z-10 py-32">
        <div className="text-center space-y-10 max-w-5xl mx-auto">
          
          {/* Badge with shimmer */}
          <div
            className="
              inline-flex items-center gap-2 px-5 py-2 rounded-full backdrop-blur-md
              bg-white/40 dark:bg-white/5
              border border-emerald-400/40 dark:border-emerald-500/30
              hover:border-emerald-500/80 transition-all duration-500
              shadow-lg shadow-emerald-500/5
            "
          >
            <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
              Starstreak Ltd — Parent Company of Nexora
            </span>
          </div>

          {/* Main Headline with 3D Parallax via style transform */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
            style={{
              transform: `perspective(600px) rotateX(${mousePos.y * -3}deg) rotateY(${mousePos.x * 3}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <span className="text-gray-900 dark:text-white">
              The Hub of Next-Gen Digital Innovation
            </span>
            <span
              className="
                block mt-3 text-transparent bg-clip-text 
                bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500
                dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400
                animate-gradient
              "
            >
              STARSTREAK
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-400 font-light">
                        Starstreak Ltd is the parent company behind <strong className="text-gray-900 dark:text-white font-semibold">Nexora</strong> and
            <strong className="text-gray-900 dark:text-white font-semibold"> Trustia</strong> — bringing together secure,
            scalable, and human-centered digital experiences for users and communities worldwide.
          </p>

          {/* Feature Pills with glow effect */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {PILL_FEATURES.map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="
                  flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm
                  bg-white/50 dark:bg-white/5
                  border border-emerald-400/20 dark:border-emerald-500/20
                  hover:border-emerald-500/60 hover:bg-emerald-50/50 dark:hover:bg-white/10
                  hover:shadow-lg hover:shadow-emerald-500/10
                  transition-all duration-500
                  cursor-default
                "
              >
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-5 pt-8">
            <Link
              to="/products"
              className="
                group relative px-9 py-4 rounded-xl font-bold flex items-center gap-3
                bg-linear-to-r from-emerald-600 to-teal-600 text-white
                shadow-2xl hover:shadow-emerald-500/40
                hover:-translate-y-1.5 transition-all duration-500
                overflow-hidden
              "
            >
              {/* Shimmer overlay */}
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <Rocket className="w-5 h-5 relative z-10 group-hover:animate-bounce" />
              <span className="relative z-10">Explore Our Platforms</span>
            </Link>

            <Link
              to="/contact"
              className="
                group px-9 py-4 rounded-xl font-bold flex items-center gap-3
                bg-white/40 dark:bg-white/5 backdrop-blur-md
                border-2 border-emerald-400/40 dark:border-emerald-500/30
                text-gray-800 dark:text-white/90
                hover:bg-white/60 dark:hover:bg-white/10
                hover:border-emerald-500/80
                hover:-translate-y-1
                transition-all duration-500
              "
            >
              <Star className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              Contact Starstreak
            </Link>
          </div>

                    {/* Animated Stats Counters */}
          <div className="grid grid-cols-3 gap-10 pt-20 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <StatItem key={i} {...stat} index={i} />
            ))}
          </div>

        </div>
      </div>

      {/* Scroll Indicator (refined) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs uppercase tracking-widest text-emerald-500/60 dark:text-emerald-400/60 font-medium">
            Scroll
          </span>
          <div className="w-5 h-9 rounded-full border-2 border-emerald-400/50 dark:border-emerald-500/50 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-emerald-500 rounded-full animate-float" />
          </div>
        </div>
      </div>

    </section>
  );
}

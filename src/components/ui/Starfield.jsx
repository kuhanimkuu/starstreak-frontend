import { useEffect, useMemo, useState } from "react";

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Night-sky backdrop: twinkling stars of three sizes and, every few seconds,
 * a shooting star streaking across — the Starstreak motif. Purely decorative.
 */
export default function Starfield({ density = 70, shooting = true, className = "" }) {
  const stars = useMemo(() => {
    const rand = seeded(density * 7 + 3);
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: rand() < 0.12 ? 2.5 : rand() < 0.4 ? 1.6 : 1,
      gold: rand() < 0.12,
      delay: rand() * 4,
      duration: 3 + rand() * 4,
    }));
  }, [density]);

  const [streaks, setStreaks] = useState([]);

  useEffect(() => {
    if (!shooting) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    let id = 0;
    let timer;
    const spawn = () => {
      const streak = { id: id++, top: 5 + Math.random() * 40, left: 55 + Math.random() * 45 };
      setStreaks((s) => [...s.slice(-2), streak]);
      timer = setTimeout(spawn, 3500 + Math.random() * 4500);
    };
    timer = setTimeout(spawn, 1200);
    return () => clearTimeout(timer);
  }, [shooting]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute animate-twinkle rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.gold ? "#FFD166" : "#fff",
            boxShadow: s.size > 2 ? `0 0 6px ${s.gold ? "#FFD166" : "#fff"}` : undefined,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
      {streaks.map((s) => (
        <span
          key={s.id}
          className="absolute h-px w-40 animate-shooting-star md:w-56"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            background: "linear-gradient(90deg, #FFF1A8, rgba(255,171,61,0.8) 20%, transparent)",
            boxShadow: "0 0 8px rgba(255,209,102,0.8)",
          }}
          onAnimationEnd={() => setStreaks((all) => all.filter((x) => x.id !== s.id))}
        />
      ))}
    </div>
  );
}

import { Rocket, Shield, Cpu, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Rocket,
    title: "Unified Digital Ecosystem",
    desc: "Starstreak brings together platforms like Nexora and Trustia into one connected ecosystem built for long-term expansion.",
  },
  {
    icon: Shield,
    title: "Privacy & Security First",
    desc: "Our products follow strict encryption standards and modern protection layers to keep users safe across the ecosystem.",
  },
  {
    icon: Cpu,
    title: "Smart, Adaptive Technology",
    desc: "Intelligent infrastructure automatically optimizes performance, reliability, and resource efficiency across all Starstreak platforms.",
  },
  {
    icon: Zap,
    title: "Seamless Cross-Platform Flow",
    desc: "Unified APIs allow our products to communicate effortlessly, enabling a smooth experience for users across the ecosystem.",
  },
];

export default function Features() {
  return (
    <section
      className="
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10
      "
    >
      {FEATURES.map(({ icon: Icon, title, desc }, index) => (
        <article
          key={index}
          className="
            p-8 rounded-xl text-center transition
            border 
            bg-white/70 border-gray-200 
            hover:bg-white 
            dark:bg-white/5 dark:border-white/10 
            dark:hover:bg-white/8
            shadow-sm dark:shadow-none
            backdrop-blur-sm
          "
        >
          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <Icon
              size={40}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          {/* Title */}
          <h3
            className="
              text-xl font-semibold mb-3
              text-gray-900 dark:text-white
              transition-colors
            "
          >
            {title}
          </h3>

          {/* Description */}
          <p
            className="
              text-sm leading-relaxed
              text-gray-600 dark:text-gray-400
              transition-colors
            "
          >
            {desc}
          </p>
        </article>
      ))}
    </section>
  );
}

import React from "react";
import { Heart, Lightbulb, Award, Users, Shield, Zap } from "lucide-react";

export default function Values() {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      desc: "We push boundaries, explore new ideas, and develop technology that inspires creativity and possibilities across Africa."
    },
    {
      icon: Heart,
      title: "User-First Design",
      desc: "Our products are built for real people. Simplicity, comfort, and cultural relevance guide every feature we craft."
    },
    {
      icon: Award,
      title: "Excellence",
      desc: "We hold ourselves to global standards of quality, performance, and reliability in everything we create."
    },
    {
      icon: Users,
      title: "Community",
      desc: "We grow with our users, creators, and partners—building platforms that uplift and connect African communities."
    },
    {
      icon: Shield,
      title: "Privacy & Trust",
      desc: "We design with protection at the core, ensuring secure, transparent, and respectful digital experiences."
    },
    {
      icon: Zap,
      title: "Speed & Agility",
      desc: "We move fast, build fast, and adapt fast—delivering technology that keeps up with Africa’s energy and ambition."
    },
  ];

  return (
    <section className="section-padding bg-[#0f1522]">
      <div className="container-custom">

        <h2 className="text-4xl font-extrabold text-center mb-12">
          Our Core Values
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="p-8 border border-white/10 rounded-xl hover:-translate-y-2 transition"
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 mb-6 mx-auto shadow-lg shadow-emerald-500/30">
                  <Icon size={32} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-center">{v.title}</h3>
                <p className="text-gray-400 text-center leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

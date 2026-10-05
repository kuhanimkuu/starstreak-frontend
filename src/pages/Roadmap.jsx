import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FaHammer, FaClock, FaLightbulb } from "react-icons/fa";
import { PageHero, Reveal } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

const PHASES = [
  { key: "now", label: "Now building", icon: FaHammer, tone: "bg-flare/15 text-flare", dot: "bg-flare" },
  { key: "soon", label: "Coming soon", icon: FaClock, tone: "bg-amber/15 text-amber", dot: "bg-amber" },
  { key: "future", label: "Future ideas", icon: FaLightbulb, tone: "bg-gold/15 text-gold", dot: "bg-gold" },
];

export default function Roadmap() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("roadmap_items")
      .select("title, description, phase")
      .eq("is_visible", true)
      .order("sort_order")
      .then(({ data }) => {
        setItems(data || []);
        setLoading(false);
      });
  }, []);

  const hasAny = items.length > 0;

  return (
    <>
      <PageHero
        eyebrow="Roadmap"
        title={
          <>
            Where we’re <span className="text-flare-gradient">headed.</span>
          </>
        }
        intro="A transparent look at what we’re building now, what’s coming soon and the long-term vision for Starstreak."
        mascot={<Mascot pose="search" className="w-52" />}
      />

      <section className="py-16 md:py-24">
        <div className="container-ss">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {PHASES.map((p) => (
                <div key={p.key} className="h-80 animate-pulse rounded-3xl bg-night-800" />
              ))}
            </div>
          ) : !hasAny ? (
            <div className="card-night flex flex-col items-center px-8 py-20 text-center">
              <Mascot pose="sleep" className="w-32" />
              <p className="mt-6 text-mist">The roadmap is being drawn up — check back soon.</p>
            </div>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-3">
              {PHASES.map(({ key, label, icon: Icon, tone, dot }, col) => {
                const phaseItems = items.filter((i) => i.phase === key);
                return (
                  <Reveal key={key} delay={col * 100} className="rounded-3xl border border-line bg-night-850 p-5">
                    <div className="flex items-center justify-between px-2 pb-4 pt-1">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
                          <Icon size={15} />
                        </span>
                        <h2 className="font-bold text-star">{label}</h2>
                      </div>
                      <span className="text-sm text-dust">{phaseItems.length}</span>
                    </div>
                    <div className="space-y-3">
                      {phaseItems.length === 0 ? (
                        <p className="px-2 pb-2 text-sm text-dust">Nothing here yet.</p>
                      ) : (
                        phaseItems.map((item, i) => (
                          <div key={i} className="rounded-2xl border border-line bg-night-800 p-5">
                            <div className="flex items-start gap-3">
                              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                              <div>
                                <h3 className="font-semibold text-star">{item.title}</h3>
                                {item.description && (
                                  <p className="mt-1.5 text-sm leading-relaxed text-mist">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}

          <p className="mx-auto mt-16 max-w-2xl text-center text-mist">
            The roadmap evolves as Starstreak grows. We listen to community feedback and adapt our priorities to
            build the best experience possible.
          </p>
        </div>
      </section>
    </>
  );
}

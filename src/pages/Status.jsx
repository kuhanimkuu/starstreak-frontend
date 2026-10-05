import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FaExclamationTriangle, FaClock } from "react-icons/fa";
import { PageHero } from "../components/ui/Section";

const STATUS_UI = {
  operational: { label: "Operational", color: "text-green-400", dot: "bg-green-400" },
  degraded: { label: "Degraded performance", color: "text-amber", dot: "bg-amber" },
  outage: { label: "Outage", color: "text-red-400", dot: "bg-red-400" },
  maintenance: { label: "Maintenance", color: "text-flare", dot: "bg-flare" },
};

const SEVERITY = {
  critical: "bg-red-500/15 text-red-300",
  major: "bg-flare/15 text-flare",
};

const fmt = (ts) => new Date(ts).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });

export default function Status() {
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("service_statuses").select("*").order("sort_order"),
      supabase.from("incidents").select("*").order("started_at", { ascending: false }).limit(20),
    ]).then(([{ data: s }, { data: i }]) => {
      setServices(s || []);
      setIncidents(i || []);
      setLoading(false);
    });
  }, []);

  const allOperational = services.every((s) => s.status === "operational");
  const resolved = incidents.filter((i) => i.resolved);
  const active = incidents.filter((i) => !i.resolved);
  const pill = allOperational ? "bg-green-400" : "bg-amber";

  return (
    <>
      <PageHero
        eyebrow="System status"
        title={
          <>
            Is Starstreak <span className="text-flare-gradient">up?</span>
          </>
        }
        intro="Live status of Starstreak’s services, ongoing incidents and past maintenance."
      >
        {!loading && (
          <div
            className={`mt-8 inline-flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-semibold ${
              allOperational ? "border-green-400/30 bg-green-400/10 text-green-300" : "border-amber/30 bg-amber/10 text-amber"
            }`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${pill}`} />
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${pill}`} />
            </span>
            {allOperational ? "All systems operational" : "Some systems are experiencing issues"}
          </div>
        )}
      </PageHero>

      <section className="py-16 md:py-20">
        <div className="container-ss max-w-4xl">
          {active.length > 0 && (
            <div className="mb-8 space-y-4">
              {active.map((inc) => (
                <div key={inc.id} className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
                  <div className="flex items-center gap-2 font-semibold text-red-300">
                    <FaExclamationTriangle /> Active incident — {inc.title}
                  </div>
                  {inc.description && <p className="mt-1 text-sm text-red-200/80">{inc.description}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="card-night p-6 md:p-10">
            <h2 className="text-2xl font-bold text-star">Services</h2>
            <div className="mt-6 divide-y divide-line">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => <div key={i} className="my-3 h-12 animate-pulse rounded-xl bg-night-700" />)
              ) : services.length === 0 ? (
                <p className="py-4 text-mist">No services are being tracked yet.</p>
              ) : (
                services.map((svc) => {
                  const ui = STATUS_UI[svc.status] || STATUS_UI.operational;
                  return (
                    <div key={svc.id} className="flex items-center justify-between gap-4 py-4">
                      <span className="font-medium text-star">{svc.name}</span>
                      <span className={`flex items-center gap-2 text-sm font-semibold ${ui.color}`}>
                        <span className={`h-2 w-2 rounded-full ${ui.dot}`} /> {ui.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <h2 className="mt-16 text-2xl font-bold text-star">Incident history</h2>
          <div className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-night-800" />
                ))}
              </div>
            ) : resolved.length === 0 ? (
              <p className="text-mist">No past incidents recorded.</p>
            ) : (
              <ol className="relative ml-1.5 space-y-6 border-l border-line pl-8">
                {resolved.map((inc) => (
                  <li key={inc.id} className="relative">
                    <span className="absolute -left-[39px] top-7 h-3 w-3 rounded-full border-2 border-night-900 bg-dust" />
                    <div className="card-night p-6">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-dust">
                        <FaClock />
                        <span>
                          {fmt(inc.started_at)}
                          {inc.resolved_at && ` — resolved ${fmt(inc.resolved_at)}`}
                        </span>
                        {inc.severity && (
                          <span
                            className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                              SEVERITY[inc.severity] || "bg-amber/15 text-amber"
                            }`}
                          >
                            {inc.severity}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-star">{inc.title}</h3>
                      {inc.description && <p className="mt-2 text-mist">{inc.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <p className="mt-16 text-center text-dust">
            Starstreak engineers monitor our systems around the clock to keep the platform fast, reliable and secure.
          </p>
        </div>
      </section>
    </>
  );
}

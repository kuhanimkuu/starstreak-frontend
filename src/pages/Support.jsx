import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUser, FiUsers, FiMessageCircle, FiShield, FiHome, FiZap, FiPlus, FiMinus } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { PageHero, Reveal } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

const CATEGORIES = [
  { icon: FiUser, title: "Account & login", desc: "Login issues, account access, password resets and profile settings." },
  { icon: FiUsers, title: "Communities", desc: "Joining, creating, managing and moderating communities." },
  { icon: FiMessageCircle, title: "Messages", desc: "Direct messages, reactions, media sharing and chat settings." },
  { icon: FiShield, title: "Privacy & safety", desc: "Privacy controls, reporting, blocking and staying safe online." },
  { icon: FiHome, title: "Posts & feed", desc: "Posting, polls, reacting and discovering new content." },
  { icon: FiZap, title: "Flashes", desc: "How live, time-limited Flashes work and how to take part." },
];

export default function Support() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    supabase
      .from("faqs")
      .select("question, answer, category")
      .eq("is_visible", true)
      .order("sort_order")
      .then(({ data }) => {
        setFaqs(data || []);
        setLoading(false);
      });
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? faqs.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
    : faqs;

  return (
    <>
      <PageHero
        eyebrow="Support"
        title={
          <>
            How can we <span className="text-flare-gradient">help?</span>
          </>
        }
        intro="Find answers, troubleshoot issues, or reach the Starstreak team."
        mascot={<Mascot pose="search" className="w-56" />}
      >
        <label className="relative mt-10 block max-w-xl">
          <span className="sr-only">Search FAQs</span>
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-dust" size={20} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full rounded-full border border-night-600 bg-night-850/90 py-4 pl-14 pr-6 text-star placeholder-dust backdrop-blur focus:border-flare focus:outline-none focus:ring-2 focus:ring-flare/25"
          />
        </label>
      </PageHero>

      {!q && (
        <section className="py-16 md:py-20">
          <div className="container-ss grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={(i % 3) * 80} className="card-night card-hover p-7">
                <Icon className="text-accent" size={22} />
                <h2 className="mt-5 text-lg font-bold text-star">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-mist">{desc}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-line bg-night-850 py-16 md:py-24">
        <div className="container-ss max-w-3xl">
          <h2 className="h-display text-center text-3xl text-star md:text-4xl">
            {q ? `Results for “${search.trim()}”` : "Frequently asked questions"}
          </h2>
          <div className="mt-10">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-night-800" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center">
                <Mascot pose="sleep" float={false} className="mx-auto w-28" />
                <p className="mt-4 text-mist">No answers found{q ? " for that search" : " yet"}.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filtered.map((faq, i) => {
                  const isOpen = open === i;
                  return (
                    <li key={faq.question} className="card-night overflow-hidden !rounded-2xl">
                      <button
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                      >
                        <span className="font-semibold text-star">{faq.question}</span>
                        <span className="shrink-0 text-accent">{isOpen ? <FiMinus /> : <FiPlus />}</span>
                      </button>
                      {isOpen && <p className="-mt-1 px-6 pb-6 leading-relaxed text-mist">{faq.answer}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-ss flex flex-col items-center text-center">
          <h2 className="h-display text-3xl text-star md:text-4xl">Still need help?</h2>
          <p className="mt-3 max-w-xl text-mist">Our support team is ready to help with anything you’re facing on Starstreak.</p>
          <Link to="/contact" className="btn-flare mt-8">
            Contact support
          </Link>
        </div>
      </section>
    </>
  );
}

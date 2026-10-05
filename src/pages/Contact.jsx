import { useState } from "react";
import { FiMail, FiMapPin, FiCheck } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { PageHero } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

const CATEGORIES = [
  { value: "general", label: "General question" },
  { value: "bug", label: "Bug report" },
  { value: "safety", label: "Safety concern" },
  { value: "feedback", label: "Feedback / suggestion" },
  { value: "billing", label: "Account" },
  { value: "other", label: "Other" },
];

const RESPONSE_TIMES = [
  ["General enquiries", "1–2 business days"],
  ["Bug reports", "24–48 hours"],
  ["Safety concerns", "Within 24 hours"],
];

const EMPTY = { name: "", email: "", subject: "", category: "general", message: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("support_messages").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim() || form.category,
      category: form.category,
      message: form.message.trim(),
      source: "website",
    });
    setLoading(false);
    if (err) {
      setError("Something went wrong. Please try again or email support@starstreak.org.");
      return;
    }
    setSent(true);
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Say <span className="text-flare-gradient">hello.</span>
          </>
        }
        intro="A question, some feedback or something not working? The Starstreak team is here to help."
        mascot={<Mascot pose="chat" className="w-56" />}
      />

      <section className="py-16 md:py-24">
        <div className="container-ss grid gap-10 lg:grid-cols-12">
          <div className="card-night p-8 md:p-10 lg:col-span-7">
            {sent ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Mascot pose="celebrate" className="w-36" />
                <h2 className="h-display mt-6 text-3xl text-star">Message sent!</h2>
                <p className="mt-3 max-w-sm text-mist">Thanks for reaching out — we usually reply within 1–2 business days.</p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm(EMPTY);
                  }}
                  className="mt-6 font-semibold text-accent hover:text-gold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-2xl font-bold text-star">Send us a message</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ct-name" className="field-label">
                      Your name <span className="text-flare">*</span>
                    </label>
                    <input id="ct-name" required value={form.name} onChange={set("name")} placeholder="Your name" className="field" autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="ct-email" className="field-label">
                      Email <span className="text-flare">*</span>
                    </label>
                    <input id="ct-email" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" className="field" autoComplete="email" />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ct-cat" className="field-label">Topic</label>
                    <select id="ct-cat" value={form.category} onChange={set("category")} className="field">
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ct-subject" className="field-label">Subject</label>
                    <input id="ct-subject" value={form.subject} onChange={set("subject")} placeholder="How can we help?" className="field" />
                  </div>
                </div>
                <div>
                  <label htmlFor="ct-msg" className="field-label">
                    Message <span className="text-flare">*</span>
                  </label>
                  <textarea id="ct-msg" rows={6} required value={form.message} onChange={set("message")} placeholder="Tell us what’s up…" className="field resize-none" />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button type="submit" disabled={loading} className="btn-flare w-full disabled:opacity-60">
                  {loading ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="card-night p-8">
              <h2 className="text-lg font-bold text-star">Reach us directly</h2>
              <ul className="mt-5 space-y-4 text-mist">
                <li className="flex items-center gap-3">
                  <FiMail className="text-accent" />
                  <a href="mailto:support@starstreak.org" className="hover:text-star">
                    support@starstreak.org
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <FiMapPin className="text-accent" />
                  Hephix Ltd · Nairobi, Kenya
                </li>
              </ul>
            </div>
            <div className="card-night p-8">
              <h2 className="text-lg font-bold text-star">Response times</h2>
              <ul className="mt-5 space-y-3">
                {RESPONSE_TIMES.map(([label, time]) => (
                  <li key={label} className="flex items-center justify-between text-sm">
                    <span className="text-mist">{label}</span>
                    <span className="flex items-center gap-1.5 font-semibold text-star">
                      <FiCheck className="text-green-400" /> {time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

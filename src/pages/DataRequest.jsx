import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FaFileDownload, FaTrashAlt, FaLock, FaUserShield, FaEdit, FaBan } from "react-icons/fa";
import { PageHero } from "../components/ui/Section";
import Mascot from "../components/ui/Mascot";

const REQUEST_TYPES = [
  {
    value: "export",
    label: "Download my data",
    icon: FaFileDownload,
    tone: "bg-flare/15 text-flare",
    ring: "border-flare bg-flare/10",
    desc: "Receive a copy of your posts, messages, profile information and activity stored on Starstreak.",
  },
  {
    value: "deletion",
    label: "Delete my account & data",
    icon: FaTrashAlt,
    tone: "bg-red-500/15 text-red-300",
    ring: "border-red-400 bg-red-500/10",
    desc: "Permanently remove your account and all associated data. This cannot be undone.",
  },
  {
    value: "correction",
    label: "Correct my data",
    icon: FaEdit,
    tone: "bg-amber/15 text-amber",
    ring: "border-amber bg-amber/10",
    desc: "Ask us to correct inaccurate personal information we hold about you.",
  },
  {
    value: "restriction",
    label: "Restrict processing",
    icon: FaBan,
    tone: "bg-night-600 text-mist",
    ring: "border-mist bg-night-700",
    desc: "Ask us to limit how we use your personal data while keeping your account active.",
  },
];

const EMPTY = { name: "", email: "", details: "" };

export default function DataRequest() {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) {
      setError("Please select a request type.");
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("data_requests").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      request_type: selected,
      details: form.details.trim() || null,
    });
    if (err) {
      setError("Something went wrong. Please try again or email privacy@starstreak.org directly.");
      setLoading(false);
      return;
    }
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    const type = REQUEST_TYPES.find((r) => r.value === selected);
    return (
      <div className="container-ss flex min-h-screen items-center justify-center pt-28 pb-20">
        <div className="w-full max-w-lg text-center">
          <Mascot pose="celebrate" className="mx-auto w-32" />
          <h1 className="h-display mt-6 text-4xl text-star">Request received</h1>
          <p className="mt-3 text-lg text-mist">
            We’ve received your <strong className="text-star">{type?.label.toLowerCase()}</strong> request for{" "}
            <strong className="text-star">{form.email}</strong>.
          </p>
          <div className="card-night mt-8 p-6 text-left">
            <p className="text-sm font-semibold text-star">What happens next</p>
            <ol className="mt-4 space-y-3 text-sm text-mist">
              {[
                "We verify your identity via the email address you gave.",
                "Once verified, we start processing your request.",
                "You get a confirmation email when it’s complete.",
              ].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-flare/15 text-xs font-bold text-flare">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-line pt-4 text-xs text-dust">
              Processing typically takes 5–10 business days. For urgent requests, email{" "}
              <a href="mailto:privacy@starstreak.org" className="text-accent hover:text-gold">
                privacy@starstreak.org
              </a>
              .
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelected(null);
              setForm(EMPTY);
            }}
            className="mt-6 text-sm font-semibold text-accent hover:text-gold"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Your data"
        title={
          <>
            Your data, <span className="text-flare-gradient">your call.</span>
          </>
        }
        intro="Download, correct, restrict or delete the data Starstreak holds about you. We handle every request within 5–10 business days."
        mascot={<Mascot pose="search" className="w-52" />}
      />

      <section className="py-16 md:py-20">
        <div className="container-ss max-w-3xl space-y-10">
          <div>
            <h2 className="text-xl font-bold text-star">What would you like to do?</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {REQUEST_TYPES.map(({ value, label, icon: Icon, tone, ring, desc }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected === value}
                  onClick={() => {
                    setSelected(value);
                    setError("");
                  }}
                  className={`rounded-2xl border-2 p-5 text-left transition-all ${
                    selected === value ? ring : "border-line bg-night-800 hover:border-night-500"
                  }`}
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
                    <Icon />
                  </span>
                  <p className="mt-4 font-semibold text-star">{label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-mist">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card-night space-y-5 p-8">
            <div>
              <label htmlFor="dr-name" className="field-label">
                Full name <span className="text-flare">*</span>
              </label>
              <input
                id="dr-name"
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                placeholder="Your name as registered on Starstreak"
                className="field"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="dr-email" className="field-label">
                Email address <span className="text-flare">*</span>
              </label>
              <input
                id="dr-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                placeholder="The email linked to your Starstreak account"
                className="field"
                autoComplete="email"
              />
              <p className="mt-1.5 text-xs text-dust">We’ll send a verification email to this address before processing.</p>
            </div>
            <div>
              <label htmlFor="dr-details" className="field-label">
                Additional details <span className="font-normal text-dust">(optional)</span>
              </label>
              <textarea
                id="dr-details"
                rows={4}
                value={form.details}
                onChange={(e) => set("details", e.target.value)}
                placeholder={
                  selected === "correction"
                    ? "Describe what needs correcting and what the correct information is…"
                    : selected === "restriction"
                      ? "Describe which processing you’d like restricted and why…"
                      : "Any other context that might help us process your request…"
                }
                className="field resize-none"
              />
            </div>

            {selected === "deletion" && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                <strong className="text-red-300">Important:</strong> account deletion is permanent. All your posts,
                messages, communities and personal data will be removed, and you won’t be able to recover your account.
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading || !selected}
              className={`w-full disabled:cursor-not-allowed disabled:opacity-50 ${
                selected === "deletion"
                  ? "rounded-full bg-red-600 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-red-500"
                  : "btn-flare"
              }`}
            >
              {loading ? "Submitting…" : "Submit request"}
            </button>

            <p className="text-center text-xs text-dust">
              By submitting, you agree we’ll process your personal data to fulfil this request in line with our{" "}
              <Link to="/privacy" className="text-accent hover:text-gold">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card-night p-6">
              <div className="flex items-center gap-3">
                <FaUserShield className="text-accent" />
                <h3 className="font-bold text-star">Identity verification</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                We may ask you to confirm your identity by email, to protect your account from unauthorised requests.
              </p>
            </div>
            <div className="card-night p-6">
              <div className="flex items-center gap-3">
                <FaLock className="text-accent" />
                <h3 className="font-bold text-star">Your rights</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                Access your data · request deletion · correct inaccurate data · restrict processing · withdraw consent.
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-dust">
            Questions? Email{" "}
            <a href="mailto:privacy@starstreak.org" className="text-accent hover:text-gold">
              privacy@starstreak.org
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

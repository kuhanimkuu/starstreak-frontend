import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import AuthShell, { AuthError } from "../components/ui/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) {
      setError("Failed to send reset email. Please try again.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle={sent ? undefined : "Enter your email and we’ll send you a reset link."}
      back="/login"
      backLabel="Back to sign in"
    >
      {sent ? (
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-400/15 text-green-400">
            <FiCheck size={26} />
          </span>
          <p className="mt-5 font-semibold text-star">Check your email</p>
          <p className="mt-2 text-sm text-mist">
            We sent a reset link to <strong className="text-star">{email}</strong>. Check your inbox and spam folder.
          </p>
          <Link to="/login" className="btn-ghost mt-8 w-full">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <AuthError>{error}</AuthError>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fp-email" className="field-label">Email</label>
              <input
                id="fp-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-flare w-full disabled:opacity-50">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}

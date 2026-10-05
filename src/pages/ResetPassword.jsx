import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import useRecoverySession from "../hooks/useRecoverySession";
import AuthShell, { AuthError } from "../components/ui/AuthShell";

/** Where password-reset emails land: choose a new password. */
export default function ResetPassword() {
  const navigate = useNavigate();
  const { status, error: linkError } = useRecoverySession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(
        err.message?.toLowerCase().includes("different")
          ? "Your new password must be different from the old one."
          : "Couldn’t update your password. The link may have expired — request a new one."
      );
      return;
    }
    setDone(true);
  }

  if (status === "checking") {
    return (
      <AuthShell title="Reset password" back="/login" backLabel="Back to sign in">
        <div className="flex flex-col items-center gap-3 py-4 text-mist">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-night-600 border-t-flare" />
          Checking your reset link…
        </div>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell title="Link expired" subtitle="This reset link is invalid or has already been used." back="/login" backLabel="Back to sign in">
        {linkError && <AuthError>{linkError}</AuthError>}
        <Link to="/forgot-password" className="btn-flare w-full">
          Send a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" back="/" backLabel="Starstreak home">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-400/15 text-green-400">
            <FiCheck size={26} />
          </span>
          <p className="mt-5 text-sm text-mist">
            You’re all set. Use your new password next time you sign in, on the web or in the app.
          </p>
          <button onClick={() => navigate("/dashboard")} className="btn-flare mt-8 w-full">
            Go to my dashboard
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Make it something you haven’t used before." back="/login" backLabel="Back to sign in">
      <AuthError>{error}</AuthError>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rp-password" className="field-label">New password</label>
          <input
            id="rp-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="rp-confirm" className="field-label">Confirm password</label>
          <input
            id="rp-confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field"
            placeholder="Type it again"
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-flare w-full disabled:opacity-50">
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthShell>
  );
}

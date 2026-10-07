import { useState } from "react";
import { supabase } from "../lib/supabase";
import { nextPath } from "../lib/nextPath";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import AuthShell, { AuthError, OrDivider, googleBtn } from "../components/ui/AuthShell";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (err) {
      setError(err.message.includes("already registered") ? "This email is already registered." : "Could not create account. Try again.");
      setLoading(false);
    } else {
      navigate(nextPath());
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${nextPath()}` },
    });
    if (err) {
      setError("Failed to sign up with Google. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Join Starstreak" subtitle="Create your free account">
      <AuthError>{error}</AuthError>
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="su-name" className="field-label">Full name</label>
          <input
            id="su-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="su-email" className="field-label">Email</label>
          <input
            id="su-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="su-password" className="field-label">Password</label>
          <input
            id="su-password"
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
        <button type="submit" disabled={loading} className="btn-flare w-full disabled:opacity-50">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <OrDivider />

      <button onClick={handleGoogle} disabled={loading} className={googleBtn}>
        <FcGoogle className="text-xl" /> Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-mist">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-accent hover:text-gold">
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-center text-xs leading-relaxed text-dust">
        By creating an account you agree to our{" "}
        <Link to="/terms" className="underline hover:text-mist">Terms</Link> and{" "}
        <Link to="/privacy" className="underline hover:text-mist">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}

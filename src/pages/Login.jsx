import { useState } from "react";
import { supabase } from "../lib/supabase";
import { nextPath } from "../lib/nextPath";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import AuthShell, { AuthError, OrDivider, googleBtn } from "../components/ui/AuthShell";
import Turnstile from "../components/Turnstile";
import { useCaptcha, isCaptchaError, CAPTCHA_ERROR } from "../lib/useCaptcha";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const captcha = useCaptcha();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const captchaToken = await captcha.getToken();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } });
    captcha.used();
    if (err) {
      setError(isCaptchaError(err) ? CAPTCHA_ERROR : "Invalid email or password.");
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
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Starstreak account">
      <AuthError>{error}</AuthError>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="field-label">Email</label>
          <input
            id="login-email"
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
          <div className="flex items-baseline justify-between">
            <label htmlFor="login-password" className="field-label">Password</label>
            <Link to="/forgot-password" className="text-xs text-accent hover:text-gold">
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        <Turnstile key={captcha.captchaKey} onToken={captcha.onToken} />
        <button type="submit" disabled={loading} className="btn-flare w-full disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <OrDivider />

      <button onClick={handleGoogle} disabled={loading} className={googleBtn}>
        <FcGoogle className="text-xl" /> Continue with Google
      </button>

      <p className="mt-8 text-center text-sm text-mist">
        New to Starstreak?{" "}
        <Link to="/signup" className="font-semibold text-accent hover:text-gold">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

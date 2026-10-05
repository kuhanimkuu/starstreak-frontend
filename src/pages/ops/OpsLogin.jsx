import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { FiLock, FiMail, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from "react-icons/fi";
import FlarelyMark from "../../components/FlarelyMark";
import Starfield from "../../components/ui/Starfield";

const ADMIN_DOMAIN = "@starstreak.org";

export default function OpsLogin() {
  const navigate = useNavigate();
  const [view, setView] = useState("login"); // login | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.endsWith(ADMIN_DOMAIN)) {
      setError("Only @starstreak.org accounts can access this panel.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Invalid credentials.");
      setLoading(false);
      return;
    }

    const { data: user } = await supabase
      .from("users")
      .select("is_admin")
      .eq("email", data.user.email)
      .single();

    if (!user?.is_admin) {
      await supabase.auth.signOut();
      setError("Access denied. This account does not have admin privileges.");
      setLoading(false);
      return;
    }

    navigate("/ops");
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.endsWith(ADMIN_DOMAIN)) {
      setError("Only @starstreak.org accounts can reset their password here.");
      setLoading(false);
      return;
    }

    // Same origin the console is served from (nexora.starstreak.org in production, localhost in dev).
    const redirectTo = `${window.location.origin}/ops/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (resetError) {
      setError("Failed to send reset email. Check the address and try again.");
      setLoading(false);
      return;
    }

    setResetSent(true);
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-night-950 flex items-center justify-center px-4">
      <Starfield density={40} />
      <div className="relative w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <FlarelyMark size={40} />
          <div className="leading-none">
            <span className="text-flare-gradient text-xl font-extrabold tracking-tight">Starstreak</span>
            <span className="mt-1 block text-[10px] font-bold tracking-[0.2em] text-dust">OPS CONSOLE</span>
          </div>
        </div>

        <div className="bg-night-850 border border-line rounded-3xl p-8 shadow-night">

          {view === "login" && (
            <>
              <h1 className="text-star font-semibold text-lg mb-1">Sign in</h1>
              <p className="text-dust text-sm mb-6">Starstreak staff only.</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="name@starstreak.org"
                      className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-flare transition-colors" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-mist">Password</label>
                    <button type="button" onClick={() => { setView("forgot"); setError(""); }}
                      className="text-xs text-flare-soft hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••"
                      className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:border-flare transition-colors" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dust hover:text-mist">
                      {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-flare-deep hover:bg-flare disabled:opacity-50 text-star font-medium text-sm rounded-full py-2.5 transition-colors">
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </>
          )}

          {view === "forgot" && !resetSent && (
            <>
              <button onClick={() => { setView("login"); setError(""); }}
                className="flex items-center gap-1.5 text-dust hover:text-star text-xs mb-5 transition-colors">
                <FiArrowLeft className="text-sm" /> Back to sign in
              </button>
              <h1 className="text-star font-semibold text-lg mb-1">Reset password</h1>
              <p className="text-dust text-sm mb-6">
                Enter your company email and we will send you a reset link.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">Company email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      placeholder="name@starstreak.org"
                      className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-flare transition-colors" />
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-flare-deep hover:bg-flare disabled:opacity-50 text-star font-medium text-sm rounded-full py-2.5 transition-colors">
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}

          {view === "forgot" && resetSent && (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-2">
                <FiCheck className="text-green-400 text-xl" />
              </div>
              <h2 className="text-star font-semibold">Check your email</h2>
              <p className="text-mist text-sm">
                A reset link has been sent to <span className="text-star">{email}</span>. The link expires in 1 hour.
              </p>
              <button onClick={() => { setView("login"); setResetSent(false); setError(""); }}
                className="text-flare-soft text-sm hover:underline">
                Back to sign in
              </button>
            </div>
          )}

        </div>
        <p className="text-center text-dust text-xs mt-6">Hephix Ltd · Internal use only</p>
      </div>
    </div>
  );
}

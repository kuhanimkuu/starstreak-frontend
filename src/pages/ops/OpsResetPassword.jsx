import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useRecoverySession from "../../hooks/useRecoverySession";
import { FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import FlarelyMark from "../../components/FlarelyMark";
import Starfield from "../../components/ui/Starfield";

export default function OpsResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const { status, error: linkError } = useRecoverySession();

  async function handleReset(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Failed to update password. The link may have expired — request a new one.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setDone(true);
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
          {done ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-2">
                <FiCheck className="text-green-400 text-xl" />
              </div>
              <h2 className="text-star font-semibold">Password updated</h2>
              <p className="text-mist text-sm">Your password has been changed. You can now sign in.</p>
              <button onClick={() => navigate("/ops/login")}
                className="w-full bg-flare-deep hover:bg-flare text-star font-medium text-sm rounded-full py-2.5 transition-colors">
                Go to sign in
              </button>
            </div>
          ) : status === "checking" ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-8 h-8 border-2 border-flare border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-mist text-sm">Verifying reset link...</p>
            </div>
          ) : status === "invalid" ? (
            <div className="text-center py-4 space-y-4">
              <h2 className="text-star font-semibold">Link expired</h2>
              <p className="text-mist text-sm">{linkError || "This reset link is invalid or has already been used."}</p>
              <button onClick={() => navigate("/ops/login")}
                className="w-full bg-flare-deep hover:bg-flare text-star font-medium text-sm rounded-full py-2.5 transition-colors">
                Request a new link
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-star font-semibold text-lg mb-1">Set new password</h1>
              <p className="text-dust text-sm mb-6">Choose a strong password for your account.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">New password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                      placeholder="Min. 8 characters"
                      className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:border-flare transition-colors" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dust hover:text-mist">
                      {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist mb-1.5">Confirm password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dust text-sm" />
                    <input type={showPassword ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required
                      placeholder="Repeat password"
                      className="w-full bg-night-800 border border-night-600 text-star text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-flare transition-colors" />
                  </div>
                </div>
                {password && confirm && password === confirm && (
                  <p className="text-green-400 text-xs flex items-center gap-1"><FiCheck className="text-xs" /> Passwords match</p>
                )}
                {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-flare-deep hover:bg-flare disabled:opacity-50 text-star font-medium text-sm rounded-full py-2.5 transition-colors">
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-dust text-xs mt-6">Hephix Ltd · Internal use only</p>
      </div>
    </div>
  );
}

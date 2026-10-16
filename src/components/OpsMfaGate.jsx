import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import FlarelyMark from "./FlarelyMark";

// Two-factor sign-in for the ops dashboard. The server only grants ops
// powers to a session that passed a second factor (is_ops_admin() checks
// the JWT's aal = aal2; migration 20261016000009), so this screen sets up
// an authenticator app the first time and asks for its code on each
// sign-in.

function Shell({ title, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-night-950 px-4 text-star">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <FlarelyMark size={30} />
          <span className="text-flare-gradient font-extrabold tracking-tight">Starstreak ops</span>
        </div>
        <div className="rounded-2xl border border-line bg-night-900 p-6">
          <div className="mb-4 flex items-center gap-2">
            <FiShield className="text-flare" aria-hidden="true" />
            <h1 className="text-lg font-bold">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function CodeInput({ value, onChange, onSubmit, busy, error, label }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
      <label className="block text-xs text-dust">{label}
        <input ref={ref} value={value} inputMode="numeric" autoComplete="one-time-code" maxLength={6}
               onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
               className="mt-1 w-full rounded-lg border border-night-600 bg-night-800 px-3 py-2 text-center text-xl tracking-[0.4em] text-star focus:border-flare focus:outline-none" />
      </label>
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={busy || value.length !== 6} className="btn-flare w-full !py-2 text-sm disabled:opacity-40">
        {busy ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}

export default function OpsMfaGate({ children }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState("checking"); // checking | enroll | verify | ok
  const [factorId, setFactorId] = useState(null);
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (off) return;
      if (aal?.currentLevel === "aal2") return setStage("ok");
      const { data: factors, error: e } = await supabase.auth.mfa.listFactors();
      if (off) return;
      if (e) { setError(e.message); return setStage("verify"); }
      const verified = (factors?.totp || []).find((f) => f.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        return setStage("verify");
      }
      // First time: clear any half-finished set-up, then start a new one.
      for (const f of factors?.all || []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp", friendlyName: `Starstreak ops ${new Date().toISOString().slice(0, 10)}`,
      });
      if (off) return;
      if (enrollError) { setError(enrollError.message); return setStage("enroll"); }
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStage("enroll");
    })();
    return () => { off = true; };
  }, []);

  async function submit() {
    if (!factorId) return;
    setBusy(true);
    setError("");
    const { error: e } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (e) {
      setCode("");
      return setError(e.message?.toLowerCase().includes("invalid") ? "That code didn't match. Use the newest code in your app." : e.message);
    }
    setStage("ok");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/ops/login");
  }

  if (stage === "ok") return children;
  if (stage === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-flare border-t-transparent" />
      </div>
    );
  }

  if (stage === "enroll") {
    return (
      <Shell title="Set up two-factor sign-in">
        <p className="text-sm text-mist">
          The ops dashboard needs a code from an authenticator app (Google Authenticator, Microsoft Authenticator,
          1Password…) as well as your password.
        </p>
        {qr && <img src={qr} alt="QR code to scan with your authenticator app" className="mx-auto my-4 h-44 w-44 rounded-lg bg-white p-2" />}
        {secret && (
          <p className="mb-3 text-xs text-dust">
            Can't scan? Enter this key: <code className="break-all text-star">{secret}</code>
          </p>
        )}
        <p className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          So a lost phone doesn't lock you out: scan it on a second device too, or keep the key in your password manager.
        </p>
        <CodeInput value={code} onChange={setCode} onSubmit={submit} busy={busy} error={error}
                   label="Then enter the 6-digit code it shows" />
        <button onClick={signOut} className="mt-4 w-full text-xs text-dust hover:text-star">Sign out</button>
      </Shell>
    );
  }

  return (
    <Shell title="Enter your code">
      <p className="mb-4 text-sm text-mist">Open your authenticator app and enter the 6-digit code for Starstreak ops.</p>
      <CodeInput value={code} onChange={setCode} onSubmit={submit} busy={busy} error={error} label="Code" />
      <p className="mt-4 text-xs text-dust">Lost your phone? Ask another ops admin to reset your two-factor.</p>
      <button onClick={signOut} className="mt-2 w-full text-xs text-dust hover:text-star">Sign out</button>
    </Shell>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  FiLock, FiShield, FiTrash2, FiLogOut, FiExternalLink,
  FiAlertTriangle, FiCheck, FiAlertCircle,
} from "react-icons/fi";

export default function Settings() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast]               = useState(null);
  const [deleteModal, setDeleteModal]   = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [pwResetSent, setPwResetSent]   = useState(false);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setPwResetSent(true);
      showToast("success", "Password reset email sent. Check your inbox.");
    } catch {
      showToast("error", "Failed to send reset email.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  async function handleDeleteRequest() {
    if (!user) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("data_requests").insert({
        name:         profile?.display_name || user.displayName || "Unknown",
        email:        user.email,
        request_type: "deletion",
        details:      "Submitted from account Settings page",
      });
      if (error) throw error;
      setDeleteModal(false);
      showToast("success", "Deletion request submitted. We'll process it within 5–10 business days.");
    } catch {
      showToast("error", "Failed to submit. Email privacy@starstreak.org directly.");
    } finally {
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">

      <div>
        <h1 className="h-display text-3xl md:text-4xl text-star">Settings</h1>
        <p className="text-dust text-sm mt-1">Manage your account, security, and privacy preferences.</p>
      </div>

      {/* Account section */}
      <Section title="Account Information" subtitle="Your login and account details.">
        <Row label="Email">
          <span className="text-star text-sm">{user.email}</span>
        </Row>
        <Row label="Username">
          <span className="text-star text-sm">{profile?.username ? `@${profile.username}` : "—"}</span>
        </Row>
        <Row label="Account created">
          <span className="text-mist text-sm">
            {user.created_at ? new Date(user.created_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </span>
        </Row>
        <Row label="Last sign in">
          <span className="text-mist text-sm">
            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </span>
        </Row>
        <Row label="Email verified">
          <span className={`text-sm font-medium ${user.email_confirmed_at ? "text-green-400" : "text-amber-400"}`}>
            {user.email_confirmed_at ? "Verified ✓" : "Not verified"}
          </span>
        </Row>
      </Section>

      {/* Security section */}
      <Section title="Security" subtitle="Keep your account safe." icon={<FiLock />}>
        <Row label="Password">
          <button
            onClick={handlePasswordReset}
            className="text-sm text-accent hover:text-gold font-medium"
          >
            {pwResetSent ? "Reset email sent ✓" : "Send reset email"}
          </button>
        </Row>
        <Row label="Sign out">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-mist hover:text-red-500 transition-colors font-medium"
          >
            <FiLogOut className="text-base" /> Sign out
          </button>
        </Row>
      </Section>

      {/* Privacy section */}
      <Section title="Privacy & Data" subtitle="Control how your data is used." icon={<FiShield />}>
        <Row label="Download my data">
          <Link to="/data-request" className="flex items-center gap-1.5 text-sm text-accent hover:text-gold font-medium">
            Request export <FiExternalLink className="text-xs" />
          </Link>
        </Row>
        <Row label="Data request">
          <Link to="/data-request" className="flex items-center gap-1.5 text-sm text-accent hover:text-gold font-medium">
            Manage request <FiExternalLink className="text-xs" />
          </Link>
        </Row>
        <Row label="Privacy Policy">
          <Link to="/privacy" className="flex items-center gap-1.5 text-sm text-accent hover:text-gold font-medium">
            View <FiExternalLink className="text-xs" />
          </Link>
        </Row>
        <Row label="Cookie Policy">
          <Link to="/cookies" className="flex items-center gap-1.5 text-sm text-accent hover:text-gold font-medium">
            View <FiExternalLink className="text-xs" />
          </Link>
        </Row>
      </Section>

      {/* Danger zone */}
      <div className="bg-night-800 rounded-2xl border border-red-500/30 p-6">
        <div className="flex items-center gap-2 mb-1">
          <FiTrash2 className="text-red-500" />
          <h2 className="font-bold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-dust text-sm mb-5">These actions are permanent and cannot be reversed.</p>
        <button
          onClick={() => setDeleteModal(true)}
          className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Delete My Account
        </button>
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-night-950/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-night-800 p-6 rounded-2xl shadow-night max-w-md w-full border border-line">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center">
                <FiAlertTriangle className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-star">Delete account?</h3>
            </div>
            <p className="text-mist text-sm mb-2">
              This submits a deletion request to our team. We'll verify your identity and permanently remove your profile, posts, communities, and all associated data within 5–10 business days.
            </p>
            <p className="text-red-400 text-sm font-medium mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-2 border border-line rounded-xl text-sm font-medium hover:bg-night-850">
                Cancel
              </button>
              <button onClick={handleDeleteRequest} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Submitting…" : "Yes, request deletion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed right-4 bottom-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-night-800 text-green-300 border border-green-500/40" : "bg-night-800 text-red-300 border border-red-500/40"
        }`}>
          {toast.type === "success" ? <FiCheck /> : <FiAlertCircle />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, icon, children }) {
  return (
    <div className="bg-night-800 rounded-2xl border border-line p-6">
      <div className="flex items-center gap-2 mb-0.5">
        {icon && <span className="text-dust">{icon}</span>}
        <h2 className="font-bold text-star">{title}</h2>
      </div>
      {subtitle && <p className="text-dust text-sm mb-5">{subtitle}</p>}
      <div className="space-y-0 divide-y divide-line">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="font-medium text-mist text-sm">{label}</span>
      <div>{children}</div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  async function loadProfile(uid) {
    let { data } = await supabase.rpc("get_website_profile", { p_firebase_uid: uid });
    // No row yet — auto-create (first time signing in via website)
    if (!data?.length) {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        await supabase.rpc("create_website_user", {
          p_firebase_uid: uid,
          p_email:        u.email,
          p_display_name: u.user_metadata?.full_name || u.user_metadata?.name || "User",
          p_avatar_url:   u.user_metadata?.avatar_url || null,
        });
        const refetch = await supabase.rpc("get_website_profile", { p_firebase_uid: uid });
        data = refetch.data;
      }
    }
    setProfile(data?.[0] || null);
  }

  useEffect(() => {
    // onAuthStateChange fires immediately with INITIAL_SESSION — no getSession() needed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Reset emails sent without a redirect (e.g. from the app) land on the Site URL —
      // send them to the new-password form wherever they arrive.
      if (event === "PASSWORD_RECOVERY" && !window.location.pathname.endsWith("reset-password")) {
        navigate("/reset-password", { replace: true });
      }
      setUser(session?.user || null);
      // Auth state is known immediately — don't wait for profile to unblock the app
      setAuthLoading(false);
      if (session?.user) {
        loadProfile(session.user.id).catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function refreshProfile() {
    if (!user) return;
    const { data } = await supabase.rpc("get_website_profile", { p_firebase_uid: user.id });
    setProfile(data?.[0] || null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, authLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

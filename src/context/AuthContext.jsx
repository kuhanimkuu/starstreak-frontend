import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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
  }, []);

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

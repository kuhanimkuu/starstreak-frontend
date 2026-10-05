import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const ADMIN_DOMAIN = "@starstreak.org";

export default function AdminRoute({ children }) {
  const { user, authLoading } = useAuth();
  const [allowed, setAllowed] = useState(null); // null = checking

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAllowed(false);
      return;
    }

    if (!user.email?.endsWith(ADMIN_DOMAIN)) {
      supabase.auth.signOut();
      setAllowed(false);
      return;
    }

    // Check is_admin flag in DB
    supabase
      .from("me")
      .select("is_admin")
      .maybeSingle()
      .then(({ data }) => setAllowed(data?.is_admin === true))
      .catch(() => setAllowed(false));
  }, [user, authLoading]);

  if (authLoading || allowed === null) {
    return (
      <div className="min-h-screen bg-night-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-flare border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return allowed ? children : <Navigate to="/ops/login" replace />;
}

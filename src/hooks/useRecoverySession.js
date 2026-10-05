import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/** Error Supabase appends to the redirect URL when a reset link is expired or already used. */
function linkError() {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
  const msg = params.get("error_description");
  return msg ? msg.replace(/\+/g, " ") : null;
}

/**
 * For pages a password-reset email links to. Supabase signs the user in from
 * the link (firing PASSWORD_RECOVERY); this resolves to "ready" once there is a
 * session to call updateUser() with, or "invalid" if the link was bad/expired.
 * getSession() waits for the client to finish reading the URL, so a
 * PASSWORD_RECOVERY event that fired before this page mounted isn't missed.
 */
export default function useRecoverySession() {
  const [status, setStatus] = useState("checking"); // checking | ready | invalid
  const [error] = useState(linkError);

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === "PASSWORD_RECOVERY" || session)) setStatus("ready");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setStatus((s) => (s === "ready" || session ? "ready" : "invalid"));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { status: error ? "invalid" : status, error };
}

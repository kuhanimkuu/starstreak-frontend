import { supabase } from "./supabase";
import { WEB_APP_URL } from "./storeLinks";

/**
 * Open the web app, signed in as the current user.
 *
 * The session *moves* to the app rather than being shared: the refresh token
 * goes over in the URL fragment (never sent to a server) and this site drops
 * its local copy. Two clients refreshing the same token would trip Supabase's
 * refresh-token reuse detection and sign the user out of both.
 */
export async function openWebApp() {
  if (!WEB_APP_URL) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.refresh_token) {
    window.location.assign(WEB_APP_URL);
    return;
  }
  const token = session.refresh_token;
  await supabase.auth.signOut({ scope: "local" });
  window.location.assign(`${WEB_APP_URL}/#handoff=${encodeURIComponent(token)}`);
}

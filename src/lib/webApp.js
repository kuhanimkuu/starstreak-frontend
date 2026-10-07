import { WEB_APP_URL } from "./storeLinks";

/** Open the web app. It lives on this site, so you're already signed in there. */
export function openWebApp() {
  if (WEB_APP_URL) window.location.assign(WEB_APP_URL);
}

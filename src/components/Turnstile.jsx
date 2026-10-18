import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "../lib/turnstile";

// Cloudflare Turnstile ("are you a person?") for the public forms. Shown only
// when VITE_TURNSTILE_SITE_KEY is set; the token goes to the public-form edge
// function, which checks it with Cloudflare before saving anything.

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = Object.assign(document.createElement("script"), { src: SCRIPT, async: true, defer: true });
      s.onload = resolve;
      s.onerror = () => { loading = null; reject(new Error("Turnstile failed to load")); };
      document.head.appendChild(s);
    });
  }
  return loading;
}

/** Calls onToken(token) when the check passes, and onToken("") when it expires. */
export default function Turnstile({ onToken }) {
  const box = useRef(null);
  const widget = useRef(null);
  const callback = useRef(onToken);

  useEffect(() => { callback.current = onToken; }, [onToken]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let off = false;
    loadScript().then(() => {
      if (off || !box.current) return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: (t) => callback.current(t),
        "expired-callback": () => callback.current(""),
        "error-callback": () => callback.current(""),
      });
    }).catch(() => {});
    return () => {
      off = true;
      if (widget.current != null && window.turnstile) window.turnstile.remove(widget.current);
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={box} className="min-h-[65px]" />;
}

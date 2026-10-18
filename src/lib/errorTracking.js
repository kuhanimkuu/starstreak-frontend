// Error tracking for the website, web app, ops and business dashboards
// (Sentry). Off until VITE_SENTRY_DSN is set at build time; Sentry's code is
// only downloaded then. No personal data is sent: no IPs, cookies or user
// details, and page addresses lose their query strings.

const DSN = import.meta.env.VITE_SENTRY_DSN || "";
let sentry = null;

export function initErrorTracking() {
  if (!DSN) return;
  import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: DSN,
      environment: import.meta.env.MODE,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend(event) {
        if (event.request?.url) event.request.url = event.request.url.split("?")[0];
        delete event.request?.cookies;
        delete event.user;
        return event;
      },
    });
    sentry = Sentry;
  }).catch(() => {});
}

/** Reports a caught error (e.g. from an error boundary). */
export function reportError(error, context) {
  if (sentry) sentry.captureException(error, context ? { extra: context } : undefined);
}

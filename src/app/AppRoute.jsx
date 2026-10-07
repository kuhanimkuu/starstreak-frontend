import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AppSessionProvider } from "./AppSession";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Layout route for the web app: logged-in only (everyone else goes to /login
 * and comes back afterwards), with one shared session for all its pages.
 */
export default function AppRoute() {
  const { user, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-night-900">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-night-600 border-t-flare" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return (
    <AppSessionProvider>
      <ErrorBoundary resetKey={location.pathname}>
        <Outlet />
      </ErrorBoundary>
    </AppSessionProvider>
  );
}

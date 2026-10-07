import { Component } from "react";

/** Shows a friendly message (instead of a blank page) if a page crashes. */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("[Starstreak web] page crashed:", error);
  }

  componentDidUpdate(prev) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-night-900 px-6 text-center">
        <div>
          <p className="text-2xl font-extrabold text-star">Something went wrong</p>
          <p className="mt-2 text-mist">This page hit a problem. Reloading usually fixes it.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => window.location.reload()} className="btn-flare !py-2.5 text-sm">Reload</button>
            <a href="/home" className="btn-ghost !py-2.5 text-sm">Go home</a>
          </div>
        </div>
      </div>
    );
  }
}

import { useCallback, useEffect, useState } from "react";
import AppShell from "../AppShell";
import Feed, { Spinner } from "../components/Feed";
import { fetchPostsByIds } from "../lib/api";
import { useAppSession } from "../AppSession";

/** Posts you saved (from any post's ••• menu). */
export default function SavedPage() {
  const { me, ready } = useAppSession();
  // Snapshot once your account has loaded, so unsaving doesn't reshuffle the list under you.
  const [ids, setIds] = useState(null);
  useEffect(() => {
    if (ids === null && ready) setIds(me?.saved_posts || []);
  }, [ids, ready, me]);
  const load = useCallback((before) => (before || !ids ? Promise.resolve([]) : fetchPostsByIds(ids)), [ids]);
  return (
    <AppShell title="Saved">
      <div className="sticky top-0 z-30 border-b border-line bg-night-900/85 px-4 py-3 backdrop-blur max-sm:top-[53px]">
        <h1 className="text-xl font-extrabold">Saved posts</h1>
        <p className="text-xs text-dust">Only you can see what you've saved.</p>
      </div>
      {!ids ? <Spinner /> : <Feed key={ids.join(",")} load={load}
            empty={<p className="px-8 py-16 text-center text-mist">Nothing saved yet. Use ••• → Save post on anything you want to come back to.</p>} />}
    </AppShell>
  );
}

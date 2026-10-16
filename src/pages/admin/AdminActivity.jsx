import { useCallback } from "react";
import { supabase } from "../../lib/supabase";
import ActivityList from "../../components/ActivityList";

// Who did what across Starstreak: verifications, suspensions, organisations,
// promotions, moderator and ban changes, team access. Written by database
// triggers, so every change is here whichever tool made it.
export default function AdminActivity() {
  const load = useCallback(
    (before) => supabase.rpc("ops_activity", { p_before: before, p_limit: 50 }),
    [],
  );
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="mt-1 text-sm text-mist">
          Every verification, suspension, organisation and promotion change, moderator and ban change, and change to
          team access: who did it and when.
        </p>
      </div>
      <div className="rounded-xl border border-line bg-night-850 p-5">
        <ActivityList load={load} showCommunity empty="No activity yet." />
      </div>
    </div>
  );
}

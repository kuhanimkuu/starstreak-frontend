import AppShell from "../AppShell";
import { AppOnly } from "../components/GetTheApp";
import { BackHeader } from "./PostPage";

const TITLES = { messages: "Messages", community: "New community", flash: "Start a Flash", manage: "Manage" };

/** A page for a feature that lives in the phone app (the web is the lighter version). */
export default function AppOnlyPage({ feature }) {
  return (
    <AppShell title={TITLES[feature] || "Starstreak"}>
      <BackHeader title={TITLES[feature] || "Starstreak"} />
      <AppOnly feature={feature} />
    </AppShell>
  );
}

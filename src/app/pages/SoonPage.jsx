import { Link } from "react-router-dom";
import AppShell from "../AppShell";
import Mascot from "../../components/ui/Mascot";

const COPY = {
  Explore: "Search people, posts and communities — coming to the web very soon.",
  Notifications: "Your notifications will show up here soon. Until then, they're in the phone app.",
  Messages: "Encrypted messages are coming to the web. For now, chat in the phone app.",
  Communities: "Communities are coming to the web next.",
  Flashes: "Live Flashes are coming to the web soon.",
};

export default function SoonPage({ title }) {
  return (
    <AppShell title={title}>
      <div className="sticky top-0 z-30 border-b border-line bg-night-900/85 px-4 py-3 backdrop-blur max-sm:top-[53px]">
        <h1 className="text-xl font-extrabold">{title}</h1>
      </div>
      <div className="flex flex-col items-center px-8 py-16 text-center">
        <Mascot pose="wave" className="w-32" />
        <p className="mt-6 text-2xl font-extrabold">On its way</p>
        <p className="mt-2 max-w-sm text-mist">{COPY[title]}</p>
        <Link to="/home" className="btn-ghost mt-6 !py-2.5 text-sm">Back to home</Link>
      </div>
    </AppShell>
  );
}

/**
 * Stylised Starstreak app screen inside a phone frame, built from the app's
 * real design language (night navy, flare orange, Flarely mark). Screens:
 * "feed" (home feed with a live Flash), "flash" (inside a live Flash) and
 * "chat" (encrypted DM). Swap for real screenshots once they exist.
 */
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 text-[10px] font-semibold text-star/80">
      <span>9:41</span>
      <span className="h-5 w-20 rounded-full bg-black" />
      <span>●●● 5G</span>
    </div>
  );
}

function AppBar({ title = "Starstreak" }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <img src="/mascot/flarely_mark.png" alt="" className="h-7 w-7" />
      <span className="text-flare-gradient text-base font-extrabold tracking-tight">{title}</span>
      <span className="ml-auto h-7 w-7 rounded-full bg-night-700" />
    </div>
  );
}

function Avatar({ c = "#FFAB3D", i = "A" }) {
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-night-950"
      style={{ background: c }}
    >
      {i}
    </span>
  );
}

function LiveFlashCard() {
  return (
    <div className="mx-3 rounded-2xl border border-flare/40 bg-gradient-to-br from-flare/20 to-night-800 p-3">
      <div className="flex items-center justify-between text-[10px] font-bold">
        <span className="flex items-center gap-1 text-flare">
          <span className="h-1.5 w-1.5 animate-glow-pulse rounded-full bg-flare" /> LIVE FLASH
        </span>
        <span className="font-mono text-amber">01:24:09</span>
      </div>
      <p className="mt-2 text-[13px] font-bold text-star">Derby night watch party ⚽</p>
      <p className="mt-0.5 text-[10px] text-mist">342 here · ends tonight</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-night-700">
        <div className="h-full w-2/3 rounded-full bg-flare-gradient" />
      </div>
    </div>
  );
}

function Post({ name, c, i, text, likes, poll }) {
  return (
    <div className="mx-3 rounded-2xl border border-line bg-night-800 p-3">
      <div className="flex items-center gap-2">
        <Avatar c={c} i={i} />
        <div>
          <p className="text-[12px] font-bold text-star">{name}</p>
          <p className="text-[9px] text-dust">Nairobi Tech · 2m</p>
        </div>
      </div>
      <p className="mt-2 text-[11.5px] leading-snug text-mist">{text}</p>
      {poll && (
        <div className="mt-2 space-y-1">
          {poll.map(([label, pct]) => (
            <div key={label} className="relative overflow-hidden rounded-lg bg-night-700 px-2 py-1 text-[10px] text-star">
              <div className="absolute inset-y-0 left-0 bg-flare/30" style={{ width: `${pct}%` }} />
              <span className="relative flex justify-between">
                {label}
                <span className="text-amber">{pct}%</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-[10px] text-dust">♥ {likes} · 💬 18 · ↗</p>
    </div>
  );
}

function FeedScreen() {
  return (
    <div className="space-y-2.5">
      <AppBar />
      <LiveFlashCard />
      <Post
        name="Amara K."
        c="#FFD166"
        i="A"
        text="Who's coming to the hackathon this weekend? Vote below 👇"
        likes="214"
        poll={[
          ["Already in 🔥", 64],
          ["Maybe", 28],
        ]}
      />
      <Post name="Brian O." c="#7DD3FC" i="B" text="Just shipped my first app. Thanks for all the feedback, fam!" likes="1.2k" />
    </div>
  );
}

function FlashScreen() {
  return (
    <div className="space-y-3">
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full border-2 border-flare p-0.5">
            <img src="/mascot/flarely_stopwatch.png" alt="" className="h-9 w-9" />
          </span>
          <div>
            <p className="text-[13px] font-extrabold text-star">Derby Night ⚽</p>
            <p className="text-[10px] font-bold text-flare">● LIVE · 342 here · 01:24:09</p>
          </div>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-night-700">
          <div className="h-full w-2/3 rounded-full bg-flare-gradient" />
        </div>
      </div>
      {[
        ["Kev", "#FFAB3D", "GOOOAL!! 🔥🔥🔥"],
        ["Wanjiru", "#F9A8D4", "That pass though 😮‍💨"],
        ["Tom", "#86EFAC", "Calling it now: 3–1"],
        ["Zara", "#FFD166", "Who's watching from Kisumu?"],
      ].map(([n, c, t]) => (
        <div key={n} className="mx-3 flex gap-2">
          <Avatar c={c} i={n[0]} />
          <div className="rounded-2xl rounded-tl-sm bg-night-800 px-3 py-2">
            <p className="text-[10px] font-bold text-star">{n}</p>
            <p className="text-[11px] text-mist">{t}</p>
          </div>
        </div>
      ))}
      <div className="mx-3 mt-2 rounded-full bg-flare-gradient py-2 text-center text-[11px] font-extrabold text-night-950">
        POST YOUR TAKE
      </div>
    </div>
  );
}

function ChatScreen() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="rounded-full p-0.5 shadow-[0_0_14px_rgba(168,85,247,0.8)]">
          <Avatar c="#C4B5FD" i="M" />
        </span>
        <div>
          <p className="text-[12px] font-bold text-star">Maya</p>
          <p className="text-[10px] italic text-accent">typing…</p>
        </div>
        <span className="ml-auto text-[10px] text-dust">🔒 encrypted</span>
      </div>
      {[
        ["them", "Are you joining the flash tonight?"],
        ["me", "Obviously 😄 saving you a seat"],
        ["them", "Bring snacks this time 🍿"],
        ["me", "Deal. See you at 8!"],
      ].map(([who, t], k) => (
        <div key={k} className={`flex px-3 ${who === "me" ? "justify-end" : ""}`}>
          <p
            className={`max-w-[75%] rounded-2xl px-3 py-2 text-[11px] ${
              who === "me" ? "rounded-br-sm bg-flare-gradient font-medium text-night-950" : "rounded-bl-sm bg-night-800 text-star"
            }`}
          >
            {t}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function PhoneMockup({ screen = "feed", className = "" }) {
  return (
    <div
      className={`relative mx-auto w-[260px] rounded-[2.6rem] border border-night-500 bg-night-950 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)] md:w-[290px] ${className}`}
    >
      <div className="relative h-[540px] overflow-hidden rounded-[2.1rem] bg-night-900 md:h-[600px]">
        <StatusBar />
        {screen === "flash" ? <FlashScreen /> : screen === "chat" ? <ChatScreen /> : <FeedScreen />}
        <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-line bg-night-900/95 py-3 text-[15px] text-dust backdrop-blur">
          <span className="text-flare">⌂</span>
          <span>⚡</span>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-flare text-[13px] font-bold text-night-950">+</span>
          <span>✉</span>
          <span>☺</span>
        </div>
      </div>
    </div>
  );
}

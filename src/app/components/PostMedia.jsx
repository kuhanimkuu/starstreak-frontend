import { useEffect, useState } from "react";
import { FiExternalLink, FiFileText, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

function Lightbox({ images, index, onClose }) {
  const [i, setI] = useState(index);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => Math.min(images.length - 1, v + 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90" onClick={onClose} role="dialog" aria-modal>
      <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-night-800/80 text-star" aria-label="Close">
        <FiX size={20} />
      </button>
      {i > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setI(i - 1); }}
                className="absolute left-3 grid h-10 w-10 place-items-center rounded-full bg-night-800/80 text-star" aria-label="Previous">
          <FiChevronLeft size={22} />
        </button>
      )}
      <img src={images[i]} alt="" className="max-h-[90vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
      {i < images.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); setI(i + 1); }}
                className="absolute right-3 grid h-10 w-10 place-items-center rounded-full bg-night-800/80 text-star" aria-label="Next">
          <FiChevronRight size={22} />
        </button>
      )}
    </div>
  );
}

/** Image layouts as in the app: 1 wide · 2 squares · 1 big + 2 stacked · 2×2. */
function ImageGrid({ images, onOpen }) {
  const n = images.length;
  const cell = (i, cls = "") => (
    <button key={images[i]} onClick={() => onOpen(i)} className={`relative block overflow-hidden bg-night-850 ${cls}`}>
      <img src={images[i]} alt="" loading="lazy" className="h-full w-full object-cover" />
      {i === 3 && n > 4 && (
        <span className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-bold text-white">+{n - 4}</span>
      )}
    </button>
  );
  if (n === 1) return <div className="aspect-video sm:aspect-[2/1]">{cell(0, "h-full w-full")}</div>;
  if (n === 2) return <div className="grid grid-cols-2 gap-0.5">{cell(0, "aspect-square")}{cell(1, "aspect-square")}</div>;
  if (n === 3) {
    return (
      <div className="grid aspect-[3/2] grid-cols-3 grid-rows-2 gap-0.5">
        {cell(0, "col-span-2 row-span-2")}{cell(1)}{cell(2)}
      </div>
    );
  }
  return <div className="grid grid-cols-2 gap-0.5">{[0, 1, 2, 3].map((i) => cell(i, "aspect-square"))}</div>;
}

export default function PostMedia({ media }) {
  const [open, setOpen] = useState(null);
  const { images, videos, documents, link } = media;
  if (!images.length && !videos.length && !documents.length && !link) return null;

  return (
    <div className="mt-2 space-y-2 px-5" onClick={(e) => e.stopPropagation()}>
      {images.length > 0 && (
        <div className="overflow-hidden rounded-xl">
          <ImageGrid images={images} onOpen={setOpen} />
        </div>
      )}
      {videos.map((src) => (
        <video key={src} src={src} controls preload="metadata" playsInline
               className="max-h-[520px] w-full rounded-xl bg-black" />
      ))}
      {documents.map((d) => (
        <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-3 rounded-xl border border-line bg-night-850 p-3 transition-colors hover:border-flare/50">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-flare/15 text-flare"><FiFileText /></span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-star">{d.name}</span>
          <FiExternalLink className="text-dust" />
        </a>
      ))}
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer nofollow ugc"
           className="flex items-center gap-3 rounded-xl border border-line bg-night-850 p-3 transition-colors hover:border-flare/50">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent"><FiExternalLink /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-star">{new URL(link).hostname.replace(/^www\./, "")}</span>
            <span className="block truncate text-xs text-dust">{link}</span>
          </span>
        </a>
      )}
      {open !== null && <Lightbox images={images} index={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

/**
 * Flarely, the Starstreak mascot. Poses live in /public/mascot and match the
 * app's MascotPose: main, wave, celebrate, sleep, search, sad, stopwatch, chat.
 */
export default function Mascot({ pose = "main", className = "", float = true, alt = "" }) {
  return (
    <img
      src={`/mascot/flarely_${pose}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      className={`select-none ${float ? "animate-float" : ""} ${className}`}
    />
  );
}

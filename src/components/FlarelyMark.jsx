import { useEffect, useRef } from 'react';

/**
 * Flarely — the Starstreak mascot mark, drawn live on a canvas: the flame
 * flickers and breathes, the eyes blink, a shooting star passes over its
 * head every few seconds, and clicking it makes Flarely bounce with happy
 * eyes while the star swoops past.
 *
 * Port of AnimatedFlarelyMark (lib/features/shared/widgets/animated_flarely_mark.dart
 * in the app) — same geometry (viewBox 40 -16 458 458) and timings, so the
 * website and the app move the same way. Respects prefers-reduced-motion and
 * pauses while the tab is hidden.
 */

const NAVY = '#1A1B35';
const VIEW = { x: 40, y: -16, size: 458 };
// Shooting-star arc: enters top-right, sweeps over the flame tip, rests top-left.
const P0 = [430, 150];
const P1 = [290, -40];
const P2 = [140, 66];

const arc = (u) => {
  const v = 1 - u;
  return [
    P0[0] * v * v + P1[0] * 2 * v * u + P2[0] * u * u,
    P0[1] * v * v + P1[1] * 2 * v * u + P2[1] * u * u,
  ];
};
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

function paintBody(ctx, t) {
  const tipX = 262 + 7 * Math.sin(t);
  const tipY = 70 + 4 * Math.sin(t * 2 + 1);
  const rX = 344 + 5 * Math.sin(t + 2);
  const rY = 124 + 4 * Math.sin(t * 2 + 0.5);
  const lX = 172 + 5 * Math.sin(t + 4);
  const lY = 160 + 4 * Math.sin(t * 2 + 2.5);

  const body = new Path2D();
  body.moveTo(tipX, tipY);
  body.bezierCurveTo(286, 120, 330, 150, 352, 168);
  body.bezierCurveTo(352, 150, 350, 138, rX, rY);
  body.bezierCurveTo(384, 160, 404, 215, 404, 290);
  body.bezierCurveTo(404, 378, 338, 440, 256, 440);
  body.bezierCurveTo(174, 440, 108, 378, 108, 290);
  body.bezierCurveTo(108, 228, 138, 186, lX, lY);
  body.bezierCurveTo(170, 178, 174, 196, 184, 206);
  body.bezierCurveTo(196, 160, 236, 126, tipX, tipY);
  body.closePath();

  const fill = ctx.createRadialGradient(244, 285, 0, 244, 285, 201);
  fill.addColorStop(0, '#FFF1A8');
  fill.addColorStop(0.3, '#FFD166');
  fill.addColorStop(0.62, '#FF9A2E');
  fill.addColorStop(1, '#F2560B');
  ctx.fillStyle = fill;
  ctx.fill(body);
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(217, 72, 15, 0.35)';
  ctx.stroke(body);

  // Belly glow.
  const belly = ctx.createRadialGradient(256, 345, 0, 256, 345, 90);
  belly.addColorStop(0, 'rgba(255, 251, 224, 0.85)');
  belly.addColorStop(1, 'rgba(255, 227, 138, 0)');
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(256, 345, 96, 72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Specular streak.
  ctx.beginPath();
  ctx.moveTo(244, 120);
  ctx.bezierCurveTo(232, 150, 228, 168, 232, 186);
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255, 246, 200, 0.55)';
  ctx.stroke();
}

function paintFace(ctx, blink, happy) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = NAVY;
  for (const x of [212, 300]) {
    const y = 292;
    if (happy) {
      ctx.beginPath();
      ctx.moveTo(x - 24, y + 8);
      ctx.quadraticCurveTo(x, y - 20, x + 24, y + 8);
      ctx.lineWidth = 10;
      ctx.stroke();
      continue;
    }
    const open = 1 - blink;
    if (open < 0.2) {
      ctx.beginPath();
      ctx.moveTo(x - 24, y);
      ctx.quadraticCurveTo(x, y + 10, x + 24, y);
      ctx.lineWidth = 9;
      ctx.stroke();
      continue;
    }
    const ry = 34 * open;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, 28, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(26, 27, 53, 0.25)';
    ctx.stroke();
    ctx.clip();
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.arc(x + 3, y + 4, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x + 9, y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = NAVY;
  }

  ctx.fillStyle = 'rgba(255, 90, 95, 0.55)';
  for (const x of [172, 340]) {
    ctx.beginPath();
    ctx.ellipse(x, 340, 24, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  if (happy) {
    ctx.moveTo(218, 336);
    ctx.quadraticCurveTo(256, 392, 294, 336);
    ctx.closePath();
    ctx.fillStyle = NAVY;
    ctx.fill();
  } else {
    ctx.moveTo(228, 338);
    ctx.quadraticCurveTo(256, 368, 284, 338);
    ctx.lineWidth = 9;
    ctx.strokeStyle = NAVY;
    ctx.stroke();
  }
}

function paintStar(ctx, t, pass) {
  const moving = pass < 1;
  const p = easeOutCubic(pass);
  const [hx, hy] = arc(p);
  const tailStart = moving ? Math.max(0, p - 0.55) : 0.55;
  const [tx, ty] = arc(tailStart);
  const shimmer = 0.8 + 0.2 * Math.sin(t * 2);

  const trail = new Path2D();
  trail.moveTo(tx, ty);
  for (let i = 1; i <= 24; i++) {
    const [x, y] = arc(tailStart + ((p - tailStart) * i) / 24);
    trail.lineTo(x, y);
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const outer = ctx.createLinearGradient(tx, ty, hx, hy);
  outer.addColorStop(0, 'rgba(255, 154, 46, 0)');
  outer.addColorStop(0.65, 'rgba(255, 138, 31, 0.9)');
  outer.addColorStop(1, 'rgba(255, 241, 168, 1)');
  ctx.strokeStyle = outer;
  ctx.lineWidth = moving ? 30 : 24;
  ctx.stroke(trail);
  const core = ctx.createLinearGradient(tx, ty, hx, hy);
  core.addColorStop(0, 'rgba(255, 255, 255, 0)');
  core.addColorStop(1, `rgba(255, 255, 255, ${0.95 * shimmer})`);
  ctx.strokeStyle = core;
  ctx.lineWidth = 8;
  ctx.stroke(trail);

  const glowR = moving ? 95 : 78;
  const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, glowR);
  glow.addColorStop(0, `rgba(255, 227, 138, ${0.9 * shimmer})`);
  glow.addColorStop(1, 'rgba(255, 209, 102, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(hx, hy, glowR, 0, Math.PI * 2);
  ctx.fill();

  const twinkle = moving ? 1.12 : 1 + 0.14 * Math.sin(t * 2);
  const rotation = -100 + 6 * Math.sin(t) + 300 * p;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = ((rotation + i * 36) * Math.PI) / 180;
    const r = (i % 2 === 0 ? 50 : 22) * twinkle;
    const x = hx + r * Math.cos(a);
    const y = hy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#FFE38A';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#E8590C';
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(hx - 6, hy - 6, 9, 0, Math.PI * 2);
  ctx.fill();
}

function paint(ctx, size, { time, blink, bounce, pass }) {
  const t = time * 2 * Math.PI;
  const active = bounce > 0 && bounce < 1;
  let hop = 0;
  let sx = 1;
  let sy = 1;
  if (active) {
    const decay = 1 - bounce;
    const wave = Math.sin(bounce * Math.PI * 3);
    hop = -Math.sin(bounce * Math.PI) * 34 * decay;
    sx = 1 + 0.1 * wave * decay;
    sy = 1 - 0.1 * wave * decay;
  }
  const breathe = 1 + 0.015 * Math.sin(t);

  ctx.save();
  ctx.scale(size / VIEW.size, size / VIEW.size);
  ctx.translate(-VIEW.x, -VIEW.y);

  ctx.save();
  ctx.translate(256, 440 + hop);
  ctx.scale(sx * breathe, sy / breathe);
  ctx.translate(-256, -440);
  paintBody(ctx, t);
  paintFace(ctx, blink, active);
  ctx.restore();

  paintStar(ctx, t, pass);
  ctx.restore();
}

export default function FlarelyMark({ size = 40, className = '', interactive = true, title = 'Starstreak' }) {
  const canvasRef = useRef(null);
  const anim = useRef({ bounceStart: -1, passStart: -1, blinkStart: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const state = anim.current;
    const now = () => performance.now();
    const start = now();
    // First pass shortly after mount, like the app.
    state.passStart = start + 700;

    const timers = [];
    const scheduleBlink = () => {
      timers.push(setTimeout(() => {
        state.blinkStart = now();
        scheduleBlink();
      }, 2200 + Math.random() * 2800));
    };
    const schedulePass = () => {
      timers.push(setTimeout(() => {
        state.passStart = now();
        schedulePass();
      }, 3800 + Math.random() * 3200));
    };

    const frame = (ms) => {
      const progress = (begin, duration) => {
        if (begin < 0 || ms < begin) return null;
        const v = (ms - begin) / duration;
        return v >= 1 ? null : v;
      };
      const blinkV = progress(state.blinkStart, 340);
      const values = {
        time: reduce ? 0 : ((ms - start) / 1800) % 1,
        blink: blinkV == null ? 0 : 1 - Math.abs(blinkV * 2 - 1),
        bounce: reduce ? 0 : progress(state.bounceStart, 700) ?? 0,
        pass: reduce ? 1 : progress(state.passStart, 1300) ?? 1,
      };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      paint(ctx, size, values);
    };

    if (reduce) {
      frame(start);
      return undefined;
    }

    scheduleBlink();
    timers.push(setTimeout(schedulePass, 700));
    let raf = 0;
    const loop = (ms) => {
      if (!document.hidden) frame(ms);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [size]);

  const onClick = () => {
    if (!interactive) return;
    const t = performance.now();
    anim.current.bounceStart = t;
    anim.current.passStart = t;
  };

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={title}
      onClick={onClick}
      className={className}
      style={{ width: size, height: size, cursor: interactive ? 'pointer' : undefined }}
    />
  );
}

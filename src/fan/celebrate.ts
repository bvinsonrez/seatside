import confetti from 'canvas-confetti';

/** Confetti burst. Skipped where there is no real canvas (tests). */
export function celebrate() {
  if (typeof navigator === 'undefined' || /jsdom/i.test(navigator.userAgent)) return;
  confetti({ particleCount: 140, spread: 80, origin: { x: 0.15, y: 0.6 } });
}

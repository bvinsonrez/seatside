import confetti from 'canvas-confetti';

let fire: confetti.CreateTypes | null = null;
let boundTo: HTMLCanvasElement | null = null;

/** Confetti burst inside the phone frame only. Skipped where there is no real canvas (tests). */
export function celebrate() {
  if (typeof navigator === 'undefined' || /jsdom/i.test(navigator.userAgent)) return;
  const canvas = document.getElementById('phone-confetti') as HTMLCanvasElement | null;
  if (!canvas) return;
  if (boundTo !== canvas) {
    fire = confetti.create(canvas, { resize: true });
    boundTo = canvas;
  }
  fire?.({ particleCount: 120, spread: 75, origin: { y: 0.55 } });
}

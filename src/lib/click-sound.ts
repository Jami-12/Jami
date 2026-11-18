/**
 * Lightweight UI click feedback built on the Web Audio API — no audio files,
 * no network requests, and silent on the server.
 */

type ClickKind = "click" | "toggle" | "success";

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;

  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return null;
  context = new AudioContextClass();
  return context;
}

const TONES: Record<ClickKind, { frequency: number; duration: number; gain: number }> = {
  click: { frequency: 520, duration: 0.045, gain: 0.055 },
  toggle: { frequency: 680, duration: 0.06, gain: 0.05 },
  success: { frequency: 840, duration: 0.09, gain: 0.045 },
};

export function playClickSound(kind: ClickKind = "click"): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const audio = getContext();
  if (!audio) return;

  if (audio.state === "suspended") {
    void audio.resume().catch(() => undefined);
  }

  const { frequency, duration, gain } = TONES[kind];
  const now = audio.currentTime;

  const oscillator = audio.createOscillator();
  const volume = audio.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + duration);

  volume.gain.setValueAtTime(0, now);
  volume.gain.linearRampToValueAtTime(gain, now + 0.004);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(volume);
  volume.connect(audio.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

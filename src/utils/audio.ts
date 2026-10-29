/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Unlocks the Web Audio Context after direct user interaction to satisfy browser autoplay policies.
 */
export function unlockAudio(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch {
    // Ignore error
  }
}

/**
 * 1. SPINNING SOUND:
 * Plays an audible, smooth, game-like ticking/clicking sound during rotation.
 * Pitch and timing synchronize with rotation speed and natural deceleration.
 */
export function playSpinTickSound(pitchMultiplier = 1.0): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const clampedMultiplier = Math.max(0.6, Math.min(1.6, pitchMultiplier));
    const baseFreq = 850 * clampedMultiplier;

    // Resonant mechanical click (triangle wave with fast decay)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.024);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.024);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.025);

    // Subtle crisp transient pop for physical wheel-ratchet feel
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();

    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(2200 * clampedMultiplier, t);
    snapOsc.frequency.exponentialRampToValueAtTime(400, t + 0.008);

    snapGain.gain.setValueAtTime(0.08, t);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.008);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);

    snapOsc.start(t);
    snapOsc.stop(t + 0.009);
  } catch {
    // Graceful fallback if audio context fails
  }
}

/**
 * Optional settling latch sound when the rolling selector locks in on the final concept.
 */
export function playStopSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.095);
  } catch {
    // Ignore error
  }
}

/**
 * 2. TIMER COMPLETION SOUND:
 * Plays a clear, short beep when the countdown reaches zero.
 * Crisp, clean electronic studio double-beep (880Hz A5 pitch).
 */
export function playTimerBeepSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const freq = 880; // A5 clear electronic beep

    // Two short, clear, authoritative beeps: 80ms beep, 35ms space, 95ms beep
    const pulses = [
      { start: t, duration: 0.08 },
      { start: t + 0.115, duration: 0.095 },
    ];

    pulses.forEach(({ start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.006);
      gain.gain.setValueAtTime(0.25, start + duration - 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration + 0.005);
    });
  } catch {
    // Ignore error
  }
}

// Aliases for backward compatibility
export const playTickSound = playSpinTickSound;
export const playChimeSound = playTimerBeepSound;

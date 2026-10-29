/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSpinTickSound, playStopSound, unlockAudio } from '../utils/audio';

interface RollingWordStageProps {
  wordBank: string[];
  previousConcept: string | null;
  spinDuration: 2 | 4 | 6 | 8;
  onSpinDurationChange: (duration: 2 | 4 | 6 | 8) => void;
  soundEnabled: boolean;
  reducedMotion: boolean;
  onSpinStart: () => void;
  onSpinComplete: (selected: string) => void;
  onOpenWordBank: () => void;
}

export const RollingWordStage: React.FC<RollingWordStageProps> = ({
  wordBank,
  previousConcept,
  spinDuration,
  onSpinDurationChange,
  soundEnabled,
  reducedMotion,
  onSpinStart,
  onSpinComplete,
  onOpenWordBank,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayWord, setDisplayWord] = useState<string>(
    previousConcept || (wordBank.length > 0 ? wordBank[0] : 'Ready')
  );
  const [isFinalLatch, setIsFinalLatch] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);

  // If wordBank is updated and we're not spinning, keep display word sane
  useEffect(() => {
    if (!isSpinning && wordBank.length > 0 && !wordBank.includes(displayWord)) {
      setDisplayWord(wordBank[0]);
    }
  }, [wordBank, isSpinning, displayWord]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const handleStartSpin = useCallback(() => {
    if (isSpinning || wordBank.length < 2) return;

    // Direct user gesture: unlock audio context for browser autoplay policies
    unlockAudio();

    // Snapshot of words at time of spin
    const snapshot = [...wordBank];

    // Pick final target concept avoiding previous if >=2 words exist
    let availableTargets = snapshot;
    if (snapshot.length > 1 && previousConcept) {
      const filtered = snapshot.filter((w) => w.toLowerCase() !== previousConcept.toLowerCase());
      if (filtered.length > 0) {
        availableTargets = filtered;
      }
    }
    const targetWord = availableTargets[Math.floor(Math.random() * availableTargets.length)];

    setIsSpinning(true);
    setIsFinalLatch(false);
    onSpinStart();

    // If reduced motion is enabled, deliver target swiftly
    if (reducedMotion) {
      if (soundEnabled) playSpinTickSound(1.0);
      animationTimeoutRef.current = window.setTimeout(() => {
        setDisplayWord(targetWord);
        setIsSpinning(false);
        setIsFinalLatch(true);
        if (soundEnabled) playStopSound();
        onSpinComplete(targetWord);
      }, 400);
      return;
    }

    // Generate schedule of steps:
    // Starts fast (40ms) and exponentially slows down until targetWord lands
    const totalDurationMs = spinDuration * 1000;
    const startTime = Date.now();
    let currentInterval = 45; // ms
    let stepCount = 0;

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDurationMs, 1);

      if (progress >= 1) {
        // Animation finished: land exactly on targetWord
        setDisplayWord(targetWord);
        setIsSpinning(false);
        setIsFinalLatch(true);
        if (soundEnabled) playStopSound();

        // Brief delay before switching to 'selected' screen so creator can witness final stop
        animationTimeoutRef.current = window.setTimeout(() => {
          onSpinComplete(targetWord);
        }, 500);
        return;
      }

      // Progress-based easing: ease-in-quad for delay lengthening
      // From 45ms up to 360ms near the end
      const easeProgress = Math.pow(progress, 2.4);
      currentInterval = Math.round(45 + easeProgress * 320);

      // Pick a random word from snapshot for the cycle
      const randomIndex = Math.floor(Math.random() * snapshot.length);
      const cycleWord = snapshot[randomIndex];
      setDisplayWord(cycleWord);

      if (soundEnabled) {
        // Pitch descends slightly as it slows down
        const pitch = 1.3 - progress * 0.5;
        playSpinTickSound(pitch);
      }

      stepCount++;
      animationTimeoutRef.current = window.setTimeout(step, currentInterval);
    };

    // Kick off first step
    animationTimeoutRef.current = window.setTimeout(step, currentInterval);
  }, [
    isSpinning,
    wordBank,
    previousConcept,
    spinDuration,
    reducedMotion,
    soundEnabled,
    onSpinStart,
    onSpinComplete,
  ]);

  const hasEnoughWords = wordBank.length >= 2;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center px-4 py-8 md:py-16">
      {/* Top telemetry status */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <span
          className={`h-2 w-2 rounded-full transition-colors duration-300 ${
            isSpinning
              ? 'bg-[#6C7CFF] animate-ping'
              : hasEnoughWords
              ? 'bg-[#10B981]'
              : 'bg-[#F59E0B]'
          }`}
          aria-hidden="true"
        />
        <span className="font-telemetry text-xs tracking-wider uppercase text-[#969FB0]">
          {isSpinning
            ? 'Rolling word bank...'
            : hasEnoughWords
            ? 'Ready to roll topic'
            : 'Word bank needs at least 2 concepts'}
        </span>
      </div>

      {/* Main Rolling Stage Card */}
      <div
        className={`w-full min-h-[260px] md:min-h-[320px] rounded-xl border bg-[#11151D] p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden ${
          isSpinning
            ? 'border-[#6C7CFF]/60 studio-glow-active'
            : isFinalLatch
            ? 'border-[#10B981] shadow-[0_0_30px_-4px_rgba(16,185,129,0.3)]'
            : 'border-[#252B38] hover:border-[#2E3646]'
        }`}
      >
        {/* Subtle background radar/grid lines for studio feel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#6C7CFF_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full flex flex-col items-center">
          <span className="font-telemetry text-xs md:text-sm uppercase tracking-widest text-[#6C7CFF] mb-4 font-semibold">
            {isSpinning ? 'Selecting Concept' : 'Practice Topic'}
          </span>

          {/* Rolling concept display */}
          <div className="h-28 sm:h-32 flex items-center justify-center w-full px-2">
            <h1
              className={`font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F4F6FB] transition-transform duration-100 max-w-2xl leading-tight ${
                isSpinning
                  ? 'opacity-90 blur-[0.3px] scale-[0.99]'
                  : isFinalLatch
                  ? 'scale-[1.02] text-white'
                  : ''
              }`}
              style={{ textWrap: 'balance' }}
            >
              {displayWord}
            </h1>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-telemetry text-[#5A6478]">
            <span>{wordBank.length} concepts loaded</span>
            <span>·</span>
            <span>Duration: {spinDuration}s</span>
          </div>
        </div>
      </div>

      {/* Controls & Spin Trigger */}
      <div className="mt-8 w-full max-w-md flex flex-col items-center gap-6">
        {hasEnoughWords ? (
          <>
            {/* Spin CTA Button */}
            <button
              onClick={handleStartSpin}
              disabled={isSpinning}
              className={`w-full py-4 px-8 rounded-lg font-display text-lg font-bold tracking-wide uppercase transition-all duration-150 flex items-center justify-center gap-3 ${
                isSpinning
                  ? 'bg-[#1E2433] text-[#5A6478] border border-[#252B38] cursor-not-allowed'
                  : 'bg-[#6C7CFF] text-[#F4F6FB] hover:bg-[#5868F0] active:scale-[0.98] cursor-pointer shadow-[0_0_24px_-4px_rgba(108,124,255,0.35)]'
              }`}
            >
              {isSpinning ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#6C7CFF]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Rolling...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Spin Random Topic</span>
                </>
              )}
            </button>

            {/* Spin Duration Selector */}
            {!isSpinning && (
              <div className="flex items-center gap-2 bg-[#11151D] p-1.5 rounded-lg border border-[#252B38]">
                <span className="text-xs font-telemetry text-[#969FB0] px-2">Spin Speed:</span>
                {([2, 4, 6, 8] as const).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => onSpinDurationChange(dur)}
                    className={`px-3 py-1 rounded text-xs font-telemetry font-medium transition-colors ${
                      spinDuration === dur
                        ? 'bg-[#1E2433] text-[#6C7CFF] border border-[#6C7CFF]/40 shadow-xs'
                        : 'text-[#969FB0] hover:text-[#F4F6FB] hover:bg-[#161B26]'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full bg-[#11151D] border border-[#F59E0B]/30 rounded-lg p-5 text-center flex flex-col items-center gap-3">
            <p className="text-sm text-[#F4F6FB]">
              At least 2 concepts are needed to spin the rolling selector.
            </p>
            <button
              onClick={onOpenWordBank}
              className="px-4 py-2 bg-[#6C7CFF] text-[#F4F6FB] text-xs font-semibold rounded hover:bg-[#5868F0] transition-colors"
            >
              Open Word Bank & Add Topics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

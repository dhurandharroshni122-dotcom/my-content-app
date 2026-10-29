/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playTimerBeepSound, unlockAudio } from '../utils/audio';

interface ResearchTimerStageProps {
  concept: string;
  durationSeconds: number;
  soundEnabled: boolean;
  onStartSpeaking: () => void;
  onBackToConcept: () => void;
}

export const ResearchTimerStage: React.FC<ResearchTimerStageProps> = ({
  concept,
  durationSeconds,
  soundEnabled,
  onStartSpeaking,
  onBackToConcept,
}) => {
  const [timerState, setTimerState] = useState<'ready' | 'running' | 'paused' | 'completed'>('ready');
  const [remainingMs, setRemainingMs] = useState<number>(durationSeconds * 1000);

  // References for timestamp tracking
  const startRemainingMsRef = useRef<number>(durationSeconds * 1000);
  const startTimestampRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);
  const hasTriggeredCompletionRef = useRef<boolean>(false);

  // Synchronize if durationSeconds prop changes while ready
  useEffect(() => {
    if (timerState === 'ready') {
      const ms = durationSeconds * 1000;
      setRemainingMs(ms);
      startRemainingMsRef.current = ms;
      hasTriggeredCompletionRef.current = false;
    }
  }, [durationSeconds, timerState]);

  // Reset completion trigger if concept changes
  useEffect(() => {
    hasTriggeredCompletionRef.current = false;
  }, [concept]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleStart = useCallback(() => {
    unlockAudio();
    startTimestampRef.current = Date.now();
    setTimerState('running');

    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimestampRef.current;
      const left = Math.max(0, startRemainingMsRef.current - elapsed);
      setRemainingMs(left);

      if (left <= 0) {
        if (timerIntervalRef.current !== null) {
          window.clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setTimerState('completed');
        if (!hasTriggeredCompletionRef.current) {
          hasTriggeredCompletionRef.current = true;
          if (soundEnabled) {
            playTimerBeepSound();
          }
        }
      }
    }, 100);
  }, [soundEnabled]);

  const handlePause = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const elapsed = Date.now() - startTimestampRef.current;
    const left = Math.max(0, startRemainingMsRef.current - elapsed);
    startRemainingMsRef.current = left;
    setRemainingMs(left);
    setTimerState('paused');
  }, []);

  const handleResume = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleReset = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    const ms = durationSeconds * 1000;
    startRemainingMsRef.current = ms;
    setRemainingMs(ms);
    setTimerState('ready');
    hasTriggeredCompletionRef.current = false;
  }, [durationSeconds]);

  // Format mm:ss
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.min(
    100,
    Math.max(0, 100 - (remainingMs / (durationSeconds * 1000)) * 100)
  );

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center px-4 py-6 md:py-12">
      {/* Top telemetry label */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            timerState === 'running'
              ? 'bg-[#38BDF8] animate-pulse'
              : timerState === 'completed'
              ? 'bg-[#10B981]'
              : 'bg-[#969FB0]'
          }`}
          aria-hidden="true"
        />
        <span className="font-telemetry text-xs tracking-wider uppercase text-[#969FB0]">
          {timerState === 'ready' && 'Research Phase · Ready to Start'}
          {timerState === 'running' && 'Research Active · Tab-Proof Countdown'}
          {timerState === 'paused' && 'Research Paused'}
          {timerState === 'completed' && 'Research Complete · Ready to Speak'}
        </span>
      </div>

      {/* Selected Concept Anchor */}
      <div className="w-full text-center mb-6">
        <span className="font-telemetry text-xs uppercase tracking-widest text-[#6C7CFF] block mb-2 font-semibold">
          Active Concept
        </span>
        <h2
          className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#F4F6FB] px-2"
          style={{ textWrap: 'balance' }}
        >
          {concept}
        </h2>
      </div>

      {/* Main Rectangular Digital Countdown Card */}
      <div className="w-full max-w-xl rounded-xl border border-[#252B38] bg-[#11151D] p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Horizontal progress bar */}
        <div className="w-full h-1.5 bg-[#1E2433] rounded-full mb-8 overflow-hidden">
          <div
            className={`h-full transition-all duration-150 rounded-full ${
              timerState === 'completed' ? 'bg-[#10B981]' : 'bg-[#6C7CFF]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Large Digital Numerals */}
        <div className="py-2 flex items-center justify-center">
          <div
            className={`font-telemetry text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight select-none ${
              timerState === 'completed'
                ? 'text-[#10B981]'
                : timerState === 'running'
                ? 'text-[#F4F6FB]'
                : 'text-[#969FB0]'
            }`}
          >
            {formattedTime}
          </div>
        </div>

        {/* Status Tag */}
        <div className="mt-4 font-telemetry text-xs tracking-widest uppercase text-[#5A6478]">
          {timerState === 'completed' ? (
            <span className="text-[#10B981] font-semibold">Time's Up · Proceed to Speaking</span>
          ) : (
            <span>Target: {Math.round(durationSeconds / 60)} Minutes</span>
          )}
        </div>

        {/* Compact Timer Controls */}
        <div className="mt-8 flex items-center gap-3">
          {timerState === 'ready' && (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-lg bg-[#6C7CFF] text-[#F4F6FB] text-sm font-semibold hover:bg-[#5868F0] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Start Timer</span>
            </button>
          )}

          {timerState === 'running' && (
            <button
              onClick={handlePause}
              className="px-5 py-2.5 rounded-lg bg-[#1E2433] hover:bg-[#252B38] text-[#F4F6FB] text-sm font-semibold border border-[#2E3646] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>Pause</span>
            </button>
          )}

          {timerState === 'paused' && (
            <button
              onClick={handleResume}
              className="px-5 py-2.5 rounded-lg bg-[#6C7CFF] hover:bg-[#5868F0] text-[#F4F6FB] text-sm font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg bg-[#161B26] hover:bg-[#1E2433] text-[#969FB0] hover:text-[#F4F6FB] text-sm font-medium border border-[#252B38] transition-all flex items-center gap-1.5"
            title="Reset Timer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Flow Action: Start Speaking */}
      <div className="mt-8 w-full max-w-md flex flex-col items-center gap-3">
        <button
          onClick={onStartSpeaking}
          className={`w-full py-4 px-8 rounded-lg font-display text-lg font-bold tracking-wide uppercase transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer ${
            timerState === 'completed'
              ? 'bg-[#10B981] text-[#090B10] hover:bg-[#0ea271] shadow-[0_0_24px_-4px_rgba(16,185,129,0.35)]'
              : 'bg-[#6C7CFF] text-[#F4F6FB] hover:bg-[#5868F0] active:scale-[0.98] shadow-[0_0_24px_-4px_rgba(108,124,255,0.35)]'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
          <span>{timerState === 'completed' ? 'Proceed to Speaking' : 'Ready to Speak Now'}</span>
        </button>

        <button
          onClick={onBackToConcept}
          className="text-xs font-telemetry text-[#969FB0] hover:text-[#F4F6FB] transition-colors py-1"
        >
          ← Back to Concept Overview
        </button>
      </div>
    </div>
  );
};

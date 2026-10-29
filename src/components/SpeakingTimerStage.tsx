/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playTimerBeepSound, unlockAudio } from '../utils/audio';

interface SpeakingTimerStageProps {
  concept: string;
  defaultDurationSeconds: number;
  soundEnabled: boolean;
  onRoundCompleted: (concept: string) => void;
  onRepeatRound: () => void;
  onNextWord: () => void;
  onBackToResearch: () => void;
}

export const SpeakingTimerStage: React.FC<SpeakingTimerStageProps> = ({
  concept,
  defaultDurationSeconds,
  soundEnabled,
  onRoundCompleted,
  onRepeatRound,
  onNextWord,
  onBackToResearch,
}) => {
  const [activeDuration, setActiveDuration] = useState<number>(defaultDurationSeconds);
  const [timerState, setTimerState] = useState<'ready' | 'running' | 'paused' | 'completed'>('ready');
  const [remainingMs, setRemainingMs] = useState<number>(defaultDurationSeconds * 1000);

  // References for timestamp tracking
  const startRemainingMsRef = useRef<number>(defaultDurationSeconds * 1000);
  const startTimestampRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);
  const hasTriggeredCompletionRef = useRef<boolean>(false);

  // Synchronize when duration prop changes while in ready state
  useEffect(() => {
    if (timerState === 'ready') {
      const ms = activeDuration * 1000;
      setRemainingMs(ms);
      startRemainingMsRef.current = ms;
      hasTriggeredCompletionRef.current = false;
    }
  }, [activeDuration, timerState]);

  // Reset completion trigger if concept changes
  useEffect(() => {
    hasTriggeredCompletionRef.current = false;
  }, [concept]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleStart = useCallback(() => {
    if (timerState === 'running') return;
    unlockAudio();
    startTimestampRef.current = Date.now();
    setTimerState('running');
    hasTriggeredCompletionRef.current = false;

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

        // Fire completion exactly once per timer session
        if (!hasTriggeredCompletionRef.current) {
          hasTriggeredCompletionRef.current = true;
          if (soundEnabled) {
            playTimerBeepSound();
          }
          onRoundCompleted(concept);
        }
      }
    }, 50);
  }, [timerState, soundEnabled, concept, onRoundCompleted]);

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
    const ms = activeDuration * 1000;
    startRemainingMsRef.current = ms;
    setRemainingMs(ms);
    setTimerState('ready');
    hasTriggeredCompletionRef.current = false;
  }, [activeDuration]);

  const handlePresetSelect = (seconds: number) => {
    if (timerState === 'running') return;
    setActiveDuration(seconds);
    const ms = seconds * 1000;
    startRemainingMsRef.current = ms;
    setRemainingMs(ms);
    setTimerState('ready');
    hasTriggeredCompletionRef.current = false;
  };

  const handleRepeat = () => {
    handleReset();
    onRepeatRound();
  };

  // Time calculations
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Circular progress calculations
  const radius = 125;
  const circumference = 2 * Math.PI * radius; // ~785.4
  const fractionRemaining = remainingMs / (activeDuration * 1000);
  // Stroke depletes clockwise
  const strokeDashoffset = circumference * (1 - fractionRemaining);

  const isWarningZone = totalSeconds <= 10 && timerState === 'running';

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center px-4 py-6 md:py-10">
      {/* Top telemetry indicator */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            timerState === 'running'
              ? isWarningZone
                ? 'bg-[#F59E0B] animate-ping'
                : 'bg-[#6C7CFF] animate-pulse'
              : timerState === 'completed'
              ? 'bg-[#10B981]'
              : 'bg-[#969FB0]'
          }`}
          aria-hidden="true"
        />
        <span className="font-telemetry text-xs tracking-wider uppercase text-[#969FB0]">
          {timerState === 'ready' && 'Speaking Round · Circular Countdown Ready'}
          {timerState === 'running' && 'Live On-Air Practice · Keep Going'}
          {timerState === 'paused' && 'Speaking Paused'}
          {timerState === 'completed' && "Time's Up · Round Complete"}
        </span>
      </div>

      {/* Concept Title Prominently Displayed */}
      <div className="w-full text-center mb-6">
        <span className="font-telemetry text-xs uppercase tracking-widest text-[#6C7CFF] block mb-2 font-semibold">
          Speaking Concept
        </span>
        <h2
          className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#F4F6FB] px-2"
          style={{ textWrap: 'balance' }}
        >
          {concept}
        </h2>
      </div>

      {/* Duration Presets before starting */}
      {timerState === 'ready' && (
        <div className="mb-6 flex items-center gap-1.5 bg-[#11151D] p-1.5 rounded-lg border border-[#252B38]">
          <span className="text-xs font-telemetry text-[#969FB0] px-2">Duration:</span>
          {[30, 45, 60, 90, 120].map((presetSec) => (
            <button
              key={presetSec}
              onClick={() => handlePresetSelect(presetSec)}
              className={`px-3 py-1 rounded text-xs font-telemetry font-medium transition-colors ${
                activeDuration === presetSec
                  ? 'bg-[#1E2433] text-[#6C7CFF] border border-[#6C7CFF]/40 shadow-xs'
                  : 'text-[#969FB0] hover:text-[#F4F6FB] hover:bg-[#161B26]'
              }`}
            >
              {presetSec}s
            </button>
          ))}
        </div>
      )}

      {/* Main Circular Countdown Stage */}
      <div className="relative flex items-center justify-center my-4">
        <svg
          className="w-64 h-64 sm:w-80 sm:h-80 -rotate-90 transform"
          viewBox="0 0 300 300"
        >
          {/* Background track circle */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            className="stroke-[#1E2433]"
            strokeWidth="8"
            fill="transparent"
          />

          {/* Active progress circle depleting clockwise */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            className={`transition-all duration-75 ${
              timerState === 'completed'
                ? 'stroke-[#10B981]'
                : isWarningZone
                ? 'stroke-[#F59E0B]'
                : 'stroke-[#6C7CFF]'
            }`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center content inside circular ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="font-telemetry text-xs tracking-widest uppercase text-[#5A6478] mb-1">
            {timerState === 'ready' && 'Target'}
            {timerState === 'running' && 'Speaking'}
            {timerState === 'paused' && 'Paused'}
            {timerState === 'completed' && "Done"}
          </span>

          {/* Tabular Numerals */}
          <div
            className={`font-telemetry text-5xl sm:text-6xl font-bold tracking-tight select-none ${
              timerState === 'completed'
                ? 'text-[#10B981]'
                : isWarningZone
                ? 'text-[#F59E0B]'
                : 'text-[#F4F6FB]'
            }`}
          >
            {formattedTime}
          </div>

          <span className="font-telemetry text-xs text-[#969FB0] mt-1">
            {timerState === 'completed' ? (
              <span className="text-[#10B981] font-semibold tracking-wider uppercase">Time's Up</span>
            ) : (
              `${activeDuration}s Sprint`
            )}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-md">
        {/* Play/Pause/Resume / Reset row */}
        <div className="flex items-center gap-3">
          {timerState === 'ready' && (
            <button
              onClick={handleStart}
              className="py-3 px-8 rounded-lg bg-[#6C7CFF] text-[#F4F6FB] font-display text-base font-bold tracking-wide uppercase hover:bg-[#5868F0] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_24px_-4px_rgba(108,124,255,0.35)] flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Start Speaking</span>
            </button>
          )}

          {timerState === 'running' && (
            <button
              onClick={handlePause}
              className="py-3 px-6 rounded-lg bg-[#1E2433] hover:bg-[#252B38] text-[#F4F6FB] font-display text-sm font-semibold border border-[#2E3646] transition-all flex items-center gap-2"
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
              className="py-3 px-6 rounded-lg bg-[#6C7CFF] hover:bg-[#5868F0] text-[#F4F6FB] font-display text-sm font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Resume</span>
            </button>
          )}

          {timerState !== 'completed' && (
            <button
              onClick={handleReset}
              className="py-3 px-4 rounded-lg bg-[#161B26] hover:bg-[#1E2433] text-[#969FB0] hover:text-[#F4F6FB] text-sm font-medium border border-[#252B38] transition-all flex items-center gap-1.5"
              title="Reset Timer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Post-Completion or Active Action row */}
        {timerState === 'completed' && (
          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={handleRepeat}
              className="py-3.5 px-4 rounded-lg bg-[#161B26] hover:bg-[#1E2433] text-[#F4F6FB] text-sm font-semibold border border-[#252B38] hover:border-[#6C7CFF]/50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-[#6C7CFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>Repeat Round</span>
            </button>

            <button
              onClick={onNextWord}
              className="py-3.5 px-4 rounded-lg bg-[#6C7CFF] text-[#F4F6FB] text-sm font-bold uppercase tracking-wider hover:bg-[#5868F0] shadow-[0_0_20px_-4px_rgba(108,124,255,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <span>Next Concept</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="flex items-center gap-4 text-xs font-telemetry text-[#969FB0] mt-2">
          <button
            onClick={onBackToResearch}
            className="hover:text-[#F4F6FB] transition-colors py-1"
          >
            ← Research Phase
          </button>
          <span>·</span>
          <button
            onClick={onNextWord}
            className="hover:text-[#F4F6FB] transition-colors py-1"
          >
            Choose Another Concept →
          </button>
        </div>
      </div>
    </div>
  );
};

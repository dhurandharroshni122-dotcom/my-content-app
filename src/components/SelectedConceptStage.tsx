/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SelectedConceptStageProps {
  concept: string;
  researchDurationSeconds: number;
  onStartResearch: () => void;
  onSpinAgain: () => void;
  onSkipToSpeaking: () => void;
}

export const SelectedConceptStage: React.FC<SelectedConceptStageProps> = ({
  concept,
  researchDurationSeconds,
  onStartResearch,
  onSpinAgain,
  onSkipToSpeaking,
}) => {
  const researchMinutes = Math.round(researchDurationSeconds / 60);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center px-4 py-8 md:py-16">
      {/* Top telemetry indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
        <span className="font-telemetry text-xs tracking-wider uppercase text-[#969FB0]">
          Concept Locked · Next: Research Phase
        </span>
      </div>

      {/* Main Selected Concept Box */}
      <div className="w-full min-h-[260px] md:min-h-[320px] rounded-xl border border-[#2E3646] bg-[#11151D] p-6 sm:p-12 flex flex-col items-center justify-center text-center studio-glow relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#6C7CFF_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full flex flex-col items-center">
          <span className="font-telemetry text-xs md:text-sm uppercase tracking-widest text-[#6C7CFF] mb-4 font-semibold">
            Topic Selected
          </span>

          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F4F6FB] max-w-2xl leading-tight my-2"
            style={{ textWrap: 'balance' }}
          >
            {concept}
          </h1>

          <p className="mt-4 text-xs sm:text-sm text-[#969FB0] max-w-md font-sans">
            Ready to formulate your thesis, find real-world business cases, and prepare your pitch.
          </p>
        </div>
      </div>

      {/* Primary & Secondary Actions */}
      <div className="mt-8 w-full max-w-md flex flex-col items-center gap-4">
        {/* Primary CTA: Start Research */}
        <button
          onClick={onStartResearch}
          className="w-full py-4 px-8 rounded-lg font-display text-lg font-bold tracking-wide uppercase bg-[#6C7CFF] text-[#F4F6FB] hover:bg-[#5868F0] active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-[0_0_24px_-4px_rgba(108,124,255,0.35)] flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Start Research ({researchMinutes} Min)</span>
        </button>

        {/* Action Row */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={onSpinAgain}
            className="py-3 px-4 rounded-lg text-xs font-telemetry font-semibold text-[#969FB0] hover:text-[#F4F6FB] bg-[#161B26] hover:bg-[#1E2433] border border-[#252B38] hover:border-[#2E3646] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Spin Again</span>
          </button>

          <button
            onClick={onSkipToSpeaking}
            className="py-3 px-4 rounded-lg text-xs font-telemetry font-semibold text-[#A78BFA] hover:text-white bg-[#161B26] hover:bg-[#1E2433] border border-[#252B38] hover:border-[#A78BFA]/40 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Skip to Speaking</span>
          </button>
        </div>
      </div>
    </div>
  );
};

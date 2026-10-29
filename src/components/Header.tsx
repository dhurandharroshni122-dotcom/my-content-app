/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface HeaderProps {
  wordBankCount: number;
  soundEnabled: boolean;
  cameraCleanMode: boolean;
  onToggleSound: () => void;
  onOpenWordBank: () => void;
  onOpenHistory: () => void;
  onOpenNotes: () => void;
  onOpenSettings: () => void;
  onToggleCameraMode: () => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wordBankCount,
  soundEnabled,
  cameraCleanMode,
  onToggleSound,
  onOpenWordBank,
  onOpenHistory,
  onOpenNotes,
  onOpenSettings,
  onToggleCameraMode,
  onHomeClick,
}) => {
  return (
    <header className="w-full border-b border-[#252B38] bg-[#090B10]/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onHomeClick}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-hidden"
          >
            <span className="font-display text-xl sm:text-2xl font-extrabold tracking-wider text-[#F4F6FB] group-hover:text-white transition-colors">
              WORDRUSH
            </span>
            <span className="font-telemetry text-[10px] text-[#6C7CFF] bg-[#161B26] border border-[#252B38] px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
              Studio
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links / Tools */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-[#969FB0]">
          <button
            onClick={onOpenWordBank}
            className="px-2.5 py-1.5 rounded-md hover:text-[#F4F6FB] hover:bg-[#161B26] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Word Bank</span>
            <span className="font-telemetry text-xs text-[#6C7CFF]">
              ({wordBankCount})
            </span>
          </button>

          <button
            onClick={onOpenHistory}
            className="px-2.5 py-1.5 rounded-md hover:text-[#F4F6FB] hover:bg-[#161B26] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Log</span>
          </button>

          <button
            onClick={onOpenNotes}
            className="px-2.5 py-1.5 rounded-md hover:text-[#F4F6FB] hover:bg-[#161B26] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Notes</span>
          </button>
        </nav>

        {/* Zone 3: Audio, Camera Mode, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'text-[#6C7CFF] bg-[#161B26] border-[#6C7CFF]/40'
                : 'text-[#5A6478] bg-[#11151D] border-[#252B38] hover:text-[#969FB0]'
            }`}
            title={soundEnabled ? 'Sound enabled (click to mute)' : 'Sound muted (click to enable)'}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          {/* Camera Broadcast Mode (Hides distraction for filming) */}
          <button
            onClick={onToggleCameraMode}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              cameraCleanMode
                ? 'text-[#A78BFA] bg-[#161B26] border-[#A78BFA]/50'
                : 'text-[#969FB0] bg-[#11151D] border-[#252B38] hover:text-[#F4F6FB]'
            }`}
            title={cameraCleanMode ? 'Exit Camera-Clean Mode' : 'Enter Camera-Clean Mode (Hides UI for recording)'}
            aria-label="Camera clean recording mode"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#969FB0] hover:text-[#F4F6FB] bg-[#11151D] hover:bg-[#161B26] border border-[#252B38] rounded-lg transition-colors cursor-pointer"
            title="Open Settings"
            aria-label="Open Settings"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

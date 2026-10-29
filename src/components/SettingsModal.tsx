/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppSettings } from '../types';
import { playChimeSound, playTickSound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetSessionStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSessionStats,
}) => {
  const [confirmResetSession, setConfirmResetSession] = useState(false);

  if (!isOpen) return null;

  const handleSoundToggle = (enabled: boolean) => {
    onUpdateSettings({ ...settings, soundEnabled: enabled });
    if (enabled) {
      // Play brief test sound so user verifies sound works
      playChimeSound();
    }
  };

  const handleTestSound = () => {
    playTickSound(1.2);
    setTimeout(() => playChimeSound(), 180);
  };

  const handleConfirmReset = () => {
    onResetSessionStats();
    setConfirmResetSession(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#11151D] border border-[#252B38] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252B38]">
          <h2 className="font-display text-lg font-bold text-[#F4F6FB]">Studio Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#969FB0] hover:text-[#F4F6FB] rounded hover:bg-[#1E2433] transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Spin Duration */}
          <div>
            <label className="block text-xs font-telemetry uppercase tracking-wider text-[#969FB0] mb-2 font-medium">
              Rolling Animation Speed
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([2, 4, 6, 8] as const).map((dur) => (
                <button
                  key={dur}
                  onClick={() => onUpdateSettings({ ...settings, spinDuration: dur })}
                  className={`py-2 px-3 rounded-lg text-xs font-telemetry font-medium transition-colors ${
                    settings.spinDuration === dur
                      ? 'bg-[#6C7CFF] text-[#F4F6FB]'
                      : 'bg-[#161B26] text-[#969FB0] hover:text-[#F4F6FB] border border-[#252B38]'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Research Duration */}
          <div>
            <label className="block text-xs font-telemetry uppercase tracking-wider text-[#969FB0] mb-2 font-medium">
              Research Countdown Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '3m', val: 180 },
                { label: '5m', val: 300 },
                { label: '10m', val: 600 },
                { label: '15m', val: 900 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => onUpdateSettings({ ...settings, researchDuration: opt.val })}
                  className={`py-2 px-3 rounded-lg text-xs font-telemetry font-medium transition-colors ${
                    settings.researchDuration === opt.val
                      ? 'bg-[#6C7CFF] text-[#F4F6FB]'
                      : 'bg-[#161B26] text-[#969FB0] hover:text-[#F4F6FB] border border-[#252B38]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speaking Duration */}
          <div>
            <label className="block text-xs font-telemetry uppercase tracking-wider text-[#969FB0] mb-2 font-medium">
              Speaking Sprint Duration
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[30, 45, 60, 90, 120].map((dur) => (
                <button
                  key={dur}
                  onClick={() => onUpdateSettings({ ...settings, speakingDuration: dur })}
                  className={`py-2 px-2 text-center rounded-lg text-xs font-telemetry font-medium transition-colors ${
                    settings.speakingDuration === dur
                      ? 'bg-[#6C7CFF] text-[#F4F6FB]'
                      : 'bg-[#161B26] text-[#969FB0] hover:text-[#F4F6FB] border border-[#252B38]'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="pt-2 border-t border-[#252B38] flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#F4F6FB]">Sound Effects</div>
              <div className="text-xs text-[#969FB0]">
                Acoustic tick on spin and finish chime
              </div>
            </div>
            <div className="flex items-center gap-2">
              {settings.soundEnabled && (
                <button
                  onClick={handleTestSound}
                  className="text-xs font-telemetry text-[#6C7CFF] hover:underline px-2 py-1"
                  title="Test chime"
                >
                  Test
                </button>
              )}
              <button
                onClick={() => handleSoundToggle(!settings.soundEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.soundEnabled ? 'bg-[#6C7CFF]' : 'bg-[#1E2433]'
                }`}
                role="switch"
                aria-checked={settings.soundEnabled}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="pt-2 border-t border-[#252B38] flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#F4F6FB]">Reduced Motion</div>
              <div className="text-xs text-[#969FB0]">
                Skip fast cycling and jump to target word
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.reducedMotion ? 'bg-[#6C7CFF]' : 'bg-[#1E2433]'
              }`}
              role="switch"
              aria-checked={settings.reducedMotion}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Camera Clean Mode */}
          <div className="pt-2 border-t border-[#252B38] flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#F4F6FB]">Clean Broadcast Mode</div>
              <div className="text-xs text-[#969FB0]">
                Hide secondary menus for clean screen recordings
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, cameraCleanMode: !settings.cameraCleanMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.cameraCleanMode ? 'bg-[#6C7CFF]' : 'bg-[#1E2433]'
              }`}
              role="switch"
              aria-checked={settings.cameraCleanMode}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.cameraCleanMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset Session Stats Action */}
          <div className="pt-4 border-t border-[#252B38]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#969FB0] uppercase tracking-wider">
                  Session Counter
                </div>
                <div className="text-xs text-[#5A6478]">
                  Clears current session metrics (does not affect saved words)
                </div>
              </div>
              <button
                onClick={() => setConfirmResetSession(true)}
                className="px-3 py-1.5 text-xs font-telemetry text-[#F59E0B] hover:text-white bg-[#161B26] hover:bg-[#F59E0B]/20 border border-[#252B38] rounded transition-colors"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#252B38] bg-[#090B10] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1E2433] hover:bg-[#252B38] text-xs font-semibold text-[#F4F6FB] rounded-lg transition-colors cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Session Reset */}
      {confirmResetSession && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-[#161B26] border border-[#252B38] rounded-xl p-6 text-center flex flex-col items-center gap-4">
            <h3 className="font-display text-base font-bold text-[#F4F6FB]">Reset session telemetry?</h3>
            <p className="text-xs text-[#969FB0]">
              This will reset the count of spun topics and completed speaking rounds for this recording session. Your saved word bank will NOT be touched.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmResetSession(false)}
                className="flex-1 py-2 text-xs text-[#969FB0] hover:text-white bg-[#11151D] border border-[#252B38] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#F59E0B] hover:bg-[#e08e08] rounded-md"
              >
                Reset Counts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

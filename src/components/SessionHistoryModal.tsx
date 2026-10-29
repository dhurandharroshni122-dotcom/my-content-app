/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SessionHistoryItem, SessionStats } from '../types';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SessionStats;
  history: SessionHistoryItem[];
  onClearHistory: () => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  stats,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#11151D] border border-[#252B38] rounded-xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252B38]">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-[#F4F6FB]">Session Activity</h2>
            <span className="font-telemetry text-xs text-[#10B981] bg-[#1E2433] px-2.5 py-0.5 rounded border border-[#10B981]/30">
              {stats.completedRounds} Completed Rounds
            </span>
          </div>
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

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 p-6 border-b border-[#252B38] bg-[#161B26]/40">
          <div className="bg-[#11151D] border border-[#252B38] rounded-lg p-4 text-center">
            <div className="font-telemetry text-3xl font-bold text-[#6C7CFF]">
              {stats.topicsSpun}
            </div>
            <div className="font-telemetry text-xs text-[#969FB0] uppercase tracking-wider mt-1">
              Topics Spun
            </div>
          </div>

          <div className="bg-[#11151D] border border-[#252B38] rounded-lg p-4 text-center">
            <div className="font-telemetry text-3xl font-bold text-[#10B981]">
              {stats.completedRounds}
            </div>
            <div className="font-telemetry text-xs text-[#969FB0] uppercase tracking-wider mt-1">
              Rounds Finished
            </div>
          </div>
        </div>

        {/* Recent Concepts List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-[#252B38]/50">
          <div className="text-xs font-telemetry uppercase tracking-wider text-[#969FB0] mb-3 px-2 font-semibold">
            Chronological Drill Log
          </div>

          {history.length > 0 ? (
            history.map((item, idx) => {
              const date = new Date(item.timestamp);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="py-3 px-2 flex items-center justify-between text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-telemetry text-xs text-[#5A6478] w-6">
                      {String(history.length - idx).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="font-medium text-[#F4F6FB]">{item.concept}</div>
                      <div className="font-telemetry text-xs text-[#5A6478]">{timeStr}</div>
                    </div>
                  </div>

                  <div>
                    {item.completedSpeaking ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-telemetry text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/25">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Spoken
                      </span>
                    ) : (
                      <span className="text-xs font-telemetry text-[#5A6478]">
                        Researched
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-[#969FB0]">
              No practice rounds recorded in this session yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#252B38] bg-[#090B10] flex items-center justify-between text-xs font-telemetry">
          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="text-[#F59E0B] hover:text-white disabled:opacity-40 transition-colors"
          >
            Clear Activity Log
          </button>
          <button
            onClick={onClose}
            className="text-[#969FB0] hover:text-white underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

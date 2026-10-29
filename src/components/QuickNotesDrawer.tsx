/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface QuickNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeConcept: string | null;
  savedNotes: Record<string, string>;
  onSaveNote: (concept: string, note: string) => void;
}

const REVIEW_PROMPTS = [
  'Did I explain the concept clearly without jargon?',
  'Did I provide a concrete real-world example?',
  'How could a creator or marketer apply this today?',
  'Did I mention a recognizable brand or case study?',
  'What should I sharpen about my delivery next time?',
];

export const QuickNotesDrawer: React.FC<QuickNotesDrawerProps> = ({
  isOpen,
  onClose,
  activeConcept,
  savedNotes,
  onSaveNote,
}) => {
  const currentKey = activeConcept || 'General Practice Notes';
  const [currentText, setCurrentText] = useState(savedNotes[currentKey] || '');
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    setCurrentText(savedNotes[currentKey] || '');
  }, [currentKey, savedNotes]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCurrentText(val);
    onSaveNote(currentKey, val);
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleInsertPrompt = (promptText: string) => {
    const addition = currentText ? `\n\n• ${promptText}\n` : `• ${promptText}\n`;
    const updated = currentText + addition;
    setCurrentText(updated);
    onSaveNote(currentKey, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md h-[80vh] sm:h-[650px] bg-[#11151D] border-t sm:border border-[#252B38] sm:rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252B38]">
          <div>
            <h3 className="font-display text-base font-bold text-[#F4F6FB]">Quick Reflection Notes</h3>
            <div className="text-xs font-telemetry text-[#6C7CFF] truncate max-w-[280px]">
              {activeConcept ? `Concept: ${activeConcept}` : 'General Notes'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-xs font-telemetry text-[#10B981] animate-fade-in">
                {saveStatus}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#969FB0] hover:text-[#F4F6FB] rounded hover:bg-[#1E2433] transition-colors"
              title="Close drawer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Quick reflection prompts */}
          <div>
            <span className="text-xs font-telemetry text-[#969FB0] uppercase tracking-wider block mb-2 font-medium">
              Self-Critique Prompts (Tap to add):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {REVIEW_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertPrompt(prompt)}
                  className="text-left text-xs text-[#969FB0] hover:text-[#F4F6FB] bg-[#161B26] hover:bg-[#1E2433] border border-[#252B38] px-2.5 py-1.5 rounded transition-colors"
                >
                  + {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Text Editor */}
          <div className="flex-1 flex flex-col min-h-[200px]">
            <textarea
              value={currentText}
              onChange={handleChange}
              placeholder="Record your immediate observations after speaking... (e.g. 'Strong hook with Starbucks example, but rushed the conclusion at 0:10')"
              className="w-full flex-1 bg-[#161B26] border border-[#252B38] focus:border-[#6C7CFF] rounded-lg p-3.5 text-sm text-[#F4F6FB] placeholder-[#5A6478] focus:outline-hidden resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#252B38] bg-[#090B10] flex items-center justify-between text-xs font-telemetry text-[#5A6478]">
          <span>Saved to localStorage automatically</span>
          <button
            onClick={onClose}
            className="text-[#969FB0] hover:text-white underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { STARTER_CONCEPTS, parseAndDeduplicateTerms } from '../constants/starterConcepts';

interface WordBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordBank: string[];
  onUpdateWordBank: (newWords: string[]) => void;
}

export const WordBankModal: React.FC<WordBankModalProps> = ({
  isOpen,
  onClose,
  wordBank,
  onUpdateWordBank,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [singleInput, setSingleInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'warn' | 'info' } | null>(null);

  // Modals for confirmation
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmSampleOpen, setConfirmSampleOpen] = useState(false);

  // Hidden file input for import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return wordBank;
    const q = searchQuery.toLowerCase();
    return wordBank.filter((term) => term.toLowerCase().includes(q));
  }, [wordBank, searchQuery]);

  if (!isOpen) return null;

  const showFeedback = (text: string, type: 'success' | 'warn' | 'info' = 'info') => {
    setFeedbackMessage({ text, type });
    window.setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = singleInput.trim();
    if (!trimmed) return;

    const { validNewTerms, duplicateCount } = parseAndDeduplicateTerms(trimmed, wordBank);
    if (duplicateCount > 0 && validNewTerms.length === 0) {
      showFeedback(`"${trimmed}" is already in your word bank.`, 'warn');
      return;
    }

    if (validNewTerms.length > 0) {
      const updated = [validNewTerms[0], ...wordBank];
      onUpdateWordBank(updated);
      setSingleInput('');
      showFeedback(`Added "${validNewTerms[0]}".`, 'success');
    }
  };

  const handleAddBulk = () => {
    if (!bulkInput.trim()) return;

    const { validNewTerms, duplicateCount } = parseAndDeduplicateTerms(bulkInput, wordBank);

    if (validNewTerms.length === 0) {
      showFeedback(
        duplicateCount > 0 ? `All ${duplicateCount} entered concepts already exist in the word bank.` : 'No valid terms found.',
        'warn'
      );
      return;
    }

    const updated = [...validNewTerms, ...wordBank];
    onUpdateWordBank(updated);
    setBulkInput('');
    setIsBulkMode(false);
    showFeedback(
      `Added ${validNewTerms.length} new concepts${duplicateCount > 0 ? ` (${duplicateCount} duplicates skipped)` : ''}.`,
      'success'
    );
  };

  const handleRemove = (termToRemove: string) => {
    const updated = wordBank.filter((t) => t !== termToRemove);
    onUpdateWordBank(updated);
  };

  const handleShuffle = () => {
    const shuffled = [...wordBank];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    onUpdateWordBank(shuffled);
    showFeedback('Shuffled concept order.', 'info');
  };

  const handleClearAll = () => {
    onUpdateWordBank([]);
    setConfirmClearOpen(false);
    showFeedback('Cleared word bank.', 'info');
  };

  const handleLoadSamples = () => {
    onUpdateWordBank(STARTER_CONCEPTS);
    setConfirmSampleOpen(false);
    showFeedback(`Loaded ${STARTER_CONCEPTS.length} starter concepts.`, 'success');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(wordBank, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'wordrush_concepts.json');
    dlAnchorElem.click();
    showFeedback('Exported word bank as JSON.', 'success');
  };

  const handleExportTXT = () => {
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(wordBank.join('\n'));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'wordrush_concepts.txt');
    dlAnchorElem.click();
    showFeedback('Exported word bank as Plain Text.', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let termsToImport: string[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            termsToImport = parsed.filter((item): item is string => typeof item === 'string');
          } else {
            throw new Error('JSON is not an array of strings');
          }
        } else {
          termsToImport = content.split(/[\n,;]+/);
        }

        const { validNewTerms, duplicateCount } = parseAndDeduplicateTerms(
          termsToImport.join('\n'),
          wordBank
        );

        if (validNewTerms.length > 0) {
          const updated = [...wordBank, ...validNewTerms];
          onUpdateWordBank(updated);
          showFeedback(
            `Imported ${validNewTerms.length} concepts${duplicateCount > 0 ? ` (${duplicateCount} skipped)` : ''}.`,
            'success'
          );
        } else {
          showFeedback('No new unique concepts found in file.', 'warn');
        }
      } catch {
        showFeedback('Failed to parse import file. Please check formatting.', 'warn');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#11151D] border border-[#252B38] rounded-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252B38]">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-[#F4F6FB]">Word Bank</h2>
            <span className="font-telemetry text-xs text-[#6C7CFF] bg-[#1E2433] px-2.5 py-0.5 rounded border border-[#6C7CFF]/30">
              {wordBank.length} Concepts
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

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`px-6 py-2 text-xs font-telemetry flex items-center justify-between ${
              feedbackMessage.type === 'success'
                ? 'bg-[#10B981]/15 text-[#10B981] border-b border-[#10B981]/30'
                : feedbackMessage.type === 'warn'
                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-b border-[#F59E0B]/30'
                : 'bg-[#6C7CFF]/15 text-[#6C7CFF] border-b border-[#6C7CFF]/30'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button onClick={() => setFeedbackMessage(null)} className="opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Input Section */}
        <div className="p-4 sm:p-6 border-b border-[#252B38] bg-[#161B26]/50">
          {!isBulkMode ? (
            <form onSubmit={handleAddSingle} className="flex gap-2">
              <input
                type="text"
                value={singleInput}
                onChange={(e) => setSingleInput(e.target.value)}
                placeholder="Enter a concept (e.g. Scarcity Effect, Framing, Decoy Effect)..."
                className="flex-1 bg-[#11151D] border border-[#252B38] focus:border-[#6C7CFF] rounded-lg px-4 py-2.5 text-sm text-[#F4F6FB] placeholder-[#5A6478] focus:outline-hidden transition-colors"
              />
              <button
                type="submit"
                disabled={!singleInput.trim()}
                className="px-5 py-2.5 bg-[#6C7CFF] hover:bg-[#5868F0] disabled:bg-[#1E2433] disabled:text-[#5A6478] text-[#F4F6FB] font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsBulkMode(true)}
                className="px-3 py-2.5 bg-[#1E2433] hover:bg-[#252B38] text-[#969FB0] hover:text-[#F4F6FB] text-xs font-telemetry rounded-lg border border-[#252B38] transition-colors whitespace-nowrap"
                title="Paste multiple terms"
              >
                Bulk Paste
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#969FB0]">Paste multiple concepts separated by newlines, commas, or semicolons:</span>
                <button
                  onClick={() => setIsBulkMode(false)}
                  className="text-xs font-telemetry text-[#6C7CFF] hover:underline"
                >
                  Switch to Single Add
                </button>
              </div>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Loss Aversion&#10;Social Proof&#10;Dormant Effect&#10;Halo Effect"
                rows={4}
                className="w-full bg-[#11151D] border border-[#252B38] focus:border-[#6C7CFF] rounded-lg p-3 text-xs font-telemetry text-[#F4F6FB] placeholder-[#5A6478] focus:outline-hidden resize-none"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsBulkMode(false)}
                  className="px-4 py-1.5 text-xs text-[#969FB0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddBulk}
                  disabled={!bulkInput.trim()}
                  className="px-5 py-1.5 bg-[#6C7CFF] hover:bg-[#5868F0] disabled:bg-[#1E2433] disabled:text-[#5A6478] text-[#F4F6FB] text-xs font-semibold rounded-lg transition-colors"
                >
                  Import Concepts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar: Search + Quick Tools */}
        <div className="px-6 py-3 border-b border-[#252B38] flex flex-wrap items-center justify-between gap-3 bg-[#11151D]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts..."
              className="w-full bg-[#161B26] border border-[#252B38] focus:border-[#6C7CFF] rounded-md px-3 py-1.5 text-xs text-[#F4F6FB] placeholder-[#5A6478] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#969FB0] hover:text-[#F4F6FB] text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShuffle}
              disabled={wordBank.length < 2}
              className="px-2.5 py-1 text-xs font-telemetry text-[#969FB0] hover:text-[#F4F6FB] bg-[#161B26] hover:bg-[#1E2433] border border-[#252B38] rounded transition-colors disabled:opacity-40"
              title="Shuffle order"
            >
              Shuffle
            </button>

            <button
              onClick={handleExportTXT}
              className="px-2.5 py-1 text-xs font-telemetry text-[#969FB0] hover:text-[#F4F6FB] bg-[#161B26] hover:bg-[#1E2433] border border-[#252B38] rounded transition-colors"
              title="Export as Text file"
            >
              Export
            </button>

            <label
              className="px-2.5 py-1 text-xs font-telemetry text-[#969FB0] hover:text-[#F4F6FB] bg-[#161B26] hover:bg-[#1E2433] border border-[#252B38] rounded transition-colors cursor-pointer"
              title="Import JSON or TXT file"
            >
              Import
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setConfirmSampleOpen(true)}
              className="px-2.5 py-1 text-xs font-telemetry text-[#6C7CFF] hover:text-white bg-[#161B26] hover:bg-[#1E2433] border border-[#252B38] rounded transition-colors"
              title="Reset to 20 starter concepts"
            >
              Reset Samples
            </button>

            <button
              onClick={() => setConfirmClearOpen(true)}
              disabled={wordBank.length === 0}
              className="px-2.5 py-1 text-xs font-telemetry text-[#F59E0B] hover:text-white bg-[#161B26] hover:bg-[#93000a]/20 border border-[#252B38] rounded transition-colors disabled:opacity-40"
              title="Clear all concepts"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Scrollable Concept List */}
        <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-[#252B38]/60 p-2 sm:p-4">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((term, idx) => (
              <div
                key={`${term}-${idx}`}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-[#161B26] rounded group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-telemetry text-xs text-[#5A6478] w-7 select-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium text-[#F4F6FB] group-hover:text-white">
                    {term}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(term)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#969FB0] hover:text-[#F59E0B] rounded hover:bg-[#1E2433] transition-all"
                  title="Remove concept"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#969FB0] flex flex-col items-center justify-center gap-2">
              {searchQuery ? (
                <>
                  <p className="text-sm">No concepts match &quot;{searchQuery}&quot;</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-telemetry text-[#6C7CFF] underline"
                  >
                    Clear search filter
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm">Your word bank is currently empty.</p>
                  <button
                    onClick={handleLoadSamples}
                    className="mt-2 px-4 py-2 bg-[#6C7CFF] text-[#F4F6FB] text-xs font-semibold rounded hover:bg-[#5868F0]"
                  >
                    Load 20 Starter Concepts
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-[#252B38] bg-[#090B10] flex items-center justify-between text-xs font-telemetry text-[#5A6478]">
          <span>Saved locally to browser storage</span>
          <button
            onClick={onClose}
            className="text-[#969FB0] hover:text-white underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Confirmation: Clear All */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-[#161B26] border border-[#252B38] rounded-xl p-6 text-center flex flex-col items-center gap-4">
            <h3 className="font-display text-base font-bold text-[#F4F6FB]">Clear entire word bank?</h3>
            <p className="text-xs text-[#969FB0]">
              This will remove all {wordBank.length} concepts from your local bank. You can always reload the starter list later.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="flex-1 py-2 text-xs text-[#969FB0] hover:text-white bg-[#11151D] border border-[#252B38] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#93000a] hover:bg-[#aa000c] rounded-md"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation: Load Samples */}
      {confirmSampleOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-[#161B26] border border-[#252B38] rounded-xl p-6 text-center flex flex-col items-center gap-4">
            <h3 className="font-display text-base font-bold text-[#F4F6FB]">Replace with starter concepts?</h3>
            <p className="text-xs text-[#969FB0]">
              This will replace your current concepts with the 20 curated consumer psychology starter terms.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmSampleOpen(false)}
                className="flex-1 py-2 text-xs text-[#969FB0] hover:text-white bg-[#11151D] border border-[#252B38] rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleLoadSamples}
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#6C7CFF] hover:bg-[#5868F0] rounded-md"
              >
                Load Starters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

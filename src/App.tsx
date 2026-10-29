/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppPhase,
  AppSettings,
  SessionHistoryItem,
  SessionStats,
} from './types';
import {
  loadSavedWordBank,
  saveWordBank,
  loadSavedSettings,
  saveSettings,
  loadSessionHistory,
  saveSessionHistory,
  loadSessionStats,
  saveSessionStats,
  loadNotes,
  saveNotes,
} from './utils/storage';
import { Header } from './components/Header';
import { RollingWordStage } from './components/RollingWordStage';
import { SelectedConceptStage } from './components/SelectedConceptStage';
import { ResearchTimerStage } from './components/ResearchTimerStage';
import { SpeakingTimerStage } from './components/SpeakingTimerStage';
import { WordBankModal } from './components/WordBankModal';
import { SettingsModal } from './components/SettingsModal';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import { QuickNotesDrawer } from './components/QuickNotesDrawer';

export default function App() {
  // Application Data States
  const [wordBank, setWordBank] = useState<string[]>(() => loadSavedWordBank());
  const [settings, setSettings] = useState<AppSettings>(() => loadSavedSettings());
  const [stats, setStats] = useState<SessionStats>(() => loadSessionStats());
  const [history, setHistory] = useState<SessionHistoryItem[]>(() => loadSessionHistory());
  const [notes, setNotes] = useState<Record<string, string>>(() => loadNotes());

  // Workflow Phase & Concept
  const [phase, setPhase] = useState<AppPhase>('idle');
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [previousConcept, setPreviousConcept] = useState<string | null>(null);

  // Modals & Drawers
  const [isWordBankOpen, setIsWordBankOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  // Synchronize storage
  useEffect(() => {
    saveWordBank(wordBank);
  }, [wordBank]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSessionStats(stats);
  }, [stats]);

  useEffect(() => {
    saveSessionHistory(history);
  }, [history]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Spin lifecycle handlers
  const handleSpinStart = useCallback(() => {
    setPhase('spinning');
  }, []);

  const handleSpinComplete = useCallback((concept: string) => {
    setSelectedConcept(concept);
    setPreviousConcept(concept);
    setPhase('selected');

    // Update stats: topics spun
    setStats((prev) => ({
      ...prev,
      topicsSpun: prev.topicsSpun + 1,
    }));

    // Record in history as researched/selected
    const historyItem: SessionHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      concept,
      timestamp: Date.now(),
      completedSpeaking: false,
    };
    setHistory((prev) => [historyItem, ...prev]);
  }, []);

  // Phase transition handlers
  const handleStartResearch = () => {
    setPhase('research');
  };

  const handleStartSpeaking = () => {
    setPhase('speaking');
  };

  const handleSpinAgain = () => {
    setPhase('idle');
  };

  const handleRoundCompleted = (concept: string) => {
    // Increment completed speaking rounds
    setStats((prev) => ({
      ...prev,
      completedRounds: prev.completedRounds + 1,
    }));

    // Mark current concept in history as completed speaking
    setHistory((prev) =>
      prev.map((item, idx) =>
        idx === 0 && item.concept === concept
          ? { ...item, completedSpeaking: true }
          : item
      )
    );
  };

  const handleRepeatRound = () => {
    // Keep concept, restart speaking
    setPhase('speaking');
  };

  const handleNextWord = () => {
    setPhase('idle');
  };

  // Modals and settings handlers
  const handleToggleSound = () => {
    setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleToggleCameraMode = () => {
    setSettings((prev) => ({ ...prev, cameraCleanMode: !prev.cameraCleanMode }));
  };

  const handleResetSessionStats = () => {
    setStats({ topicsSpun: 0, completedRounds: 0 });
    setHistory([]);
  };

  const handleSaveNote = (conceptKey: string, noteContent: string) => {
    setNotes((prev) => ({
      ...prev,
      [conceptKey]: noteContent,
    }));
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F4F6FB] flex flex-col selection:bg-[#6C7CFF]/30 selection:text-white">
      {/* Broadcast Header (hidden in cameraCleanMode) */}
      {!settings.cameraCleanMode ? (
        <Header
          wordBankCount={wordBank.length}
          soundEnabled={settings.soundEnabled}
          cameraCleanMode={settings.cameraCleanMode}
          onToggleSound={handleToggleSound}
          onOpenWordBank={() => setIsWordBankOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenNotes={() => setIsNotesOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleCameraMode={handleToggleCameraMode}
          onHomeClick={() => setPhase('idle')}
        />
      ) : (
        /* Minimal floating indicator for Camera Mode */
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          <button
            onClick={handleToggleCameraMode}
            className="px-3 py-1.5 rounded-full bg-[#161B26]/80 backdrop-blur-md border border-[#252B38] hover:border-[#6C7CFF] text-xs font-telemetry text-[#969FB0] hover:text-[#F4F6FB] transition-all flex items-center gap-1.5 shadow-lg"
            title="Exit Camera Clean Recording Mode"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Studio Mode</span>
            <span className="text-[#5A6478]">✕</span>
          </button>
        </div>
      )}

      {/* Main Practice Canvas Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-5xl mx-auto px-4">
        {/* Phase 1: Rolling Word Stage (Idle or Actively Spinning) */}
        {(phase === 'idle' || phase === 'spinning') && (
          <RollingWordStage
            wordBank={wordBank}
            previousConcept={previousConcept}
            spinDuration={settings.spinDuration}
            onSpinDurationChange={(dur) =>
              setSettings((prev) => ({ ...prev, spinDuration: dur }))
            }
            soundEnabled={settings.soundEnabled}
            reducedMotion={settings.reducedMotion}
            onSpinStart={handleSpinStart}
            onSpinComplete={handleSpinComplete}
            onOpenWordBank={() => setIsWordBankOpen(true)}
          />
        )}

        {/* Phase 2: Concept Selected State */}
        {phase === 'selected' && selectedConcept && (
          <SelectedConceptStage
            concept={selectedConcept}
            researchDurationSeconds={settings.researchDuration}
            onStartResearch={handleStartResearch}
            onSpinAgain={handleSpinAgain}
            onSkipToSpeaking={handleStartSpeaking}
          />
        )}

        {/* Phase 3: Research Timer State (Digital Rectangular Countdown) */}
        {phase === 'research' && selectedConcept && (
          <ResearchTimerStage
            concept={selectedConcept}
            durationSeconds={settings.researchDuration}
            soundEnabled={settings.soundEnabled}
            onStartSpeaking={handleStartSpeaking}
            onBackToConcept={() => setPhase('selected')}
          />
        )}

        {/* Phase 4: Speaking Timer State (Circular Countdown Ring) */}
        {phase === 'speaking' && selectedConcept && (
          <SpeakingTimerStage
            concept={selectedConcept}
            defaultDurationSeconds={settings.speakingDuration}
            soundEnabled={settings.soundEnabled}
            onRoundCompleted={handleRoundCompleted}
            onRepeatRound={handleRepeatRound}
            onNextWord={handleNextWord}
            onBackToResearch={() => setPhase('research')}
          />
        )}
      </main>

      {/* Studio Minimal Footer (Clean, unboxed, zero-pill) */}
      {!settings.cameraCleanMode && (
        <footer className="w-full border-t border-[#252B38] py-4 px-6 text-center text-xs font-telemetry text-[#5A6478]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span>WORDRUSH</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Consumer Psychology & Spontaneous Speaking Studio</span>
            </div>
            <div className="flex items-center gap-4 text-[#969FB0]">
              <button
                onClick={() => setIsNotesOpen(true)}
                className="hover:text-[#F4F6FB] transition-colors"
              >
                Reflection Notes
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsWordBankOpen(true)}
                className="hover:text-[#F4F6FB] transition-colors"
              >
                Manage Terms
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-[#F4F6FB] transition-colors"
              >
                Preferences
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Modals & Drawers */}
      <WordBankModal
        isOpen={isWordBankOpen}
        onClose={() => setIsWordBankOpen(false)}
        wordBank={wordBank}
        onUpdateWordBank={setWordBank}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetSessionStats={handleResetSessionStats}
      />

      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        stats={stats}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      <QuickNotesDrawer
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        activeConcept={selectedConcept}
        savedNotes={notes}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
}

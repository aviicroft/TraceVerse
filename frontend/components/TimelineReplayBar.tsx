'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock, Zap, DollarSign } from 'lucide-react';
import { NormalizedTransaction } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface TimelineReplayBarProps {
  transactions: NormalizedTransaction[];
  onStepChange?: (tx: NormalizedTransaction | null, stepIndex: number) => void;
}

export const TimelineReplayBar: React.FC<TimelineReplayBarProps> = ({
  transactions,
  onStepChange
}) => {
  // Sort transactions chronologically
  const sortedTxs = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [transactions]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 5x
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = sortedTxs.length;
  const currentTx = sortedTxs[currentIndex] || null;

<<<<<<< Updated upstream
  // Trigger callback when active step changes
=======
>>>>>>> Stashed changes
  useEffect(() => {
    if (sortedTxs.length > 0) {
      onStepChange?.(currentTx, currentIndex);
    }
  }, [currentIndex, currentTx, sortedTxs.length]);

  // Handle Playback Interval
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(400, 1500 / speed);
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  const handleTogglePlay = () => {
    if (currentIndex >= totalSteps - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => Math.min(totalSteps - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentIndex(Number(e.target.value));
  };

  if (totalSteps === 0) return null;

  return (
<<<<<<< Updated upstream
    <div className="p-3 bg-forensic-surface border border-forensic-border rounded-lg shadow-lg flex flex-col space-y-2.5 font-sans">
=======
    <div className="p-4 bg-surface border border-border rounded-xl shadow-panel flex flex-col space-y-3 font-sans text-xs">
>>>>>>> Stashed changes
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Button Group */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleReset}
<<<<<<< Updated upstream
            title="Reset to beginning"
            className="p-1.5 rounded bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-textDim hover:text-forensic-text transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
=======
            title={isActive ? 'Clear replay filter & show all' : 'Reset timeline'}
            className={`h-8 px-2.5 rounded-lg border transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 text-xs font-medium ${
              isActive
                ? 'bg-accent/15 text-accent border-accent/40 hover:bg-accent/25'
                : 'bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border-border'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            {isActive && <span className="hidden sm:inline">Reset</span>}
>>>>>>> Stashed changes
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentIndex === 0}
            title="Previous Step"
<<<<<<< Updated upstream
            className="p-1.5 rounded bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-textDim hover:text-forensic-text disabled:opacity-40 transition-colors"
          >
            <SkipBack className="h-3.5 w-3.5" />
=======
            className="h-8 w-8 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border border-border disabled:opacity-40 transition-colors inline-flex items-center justify-center shrink-0"
          >
            <SkipBack className="h-4 w-4 shrink-0" />
>>>>>>> Stashed changes
          </button>

          <Button
            variant={isPlaying ? 'danger' : 'primary'}
            size="sm"
            onClick={handleTogglePlay}
<<<<<<< Updated upstream
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-bold text-xs shadow-sm transition-all ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Replay Fund Flow</span>
              </>
            )}
          </button>
=======
            icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          >
            {isPlaying ? 'Pause' : 'Replay Transfers'}
          </Button>
>>>>>>> Stashed changes

          <button
            onClick={handleStepForward}
            disabled={currentIndex === totalSteps - 1}
            title="Next Step"
<<<<<<< Updated upstream
            className="p-1.5 rounded bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-textDim hover:text-forensic-text disabled:opacity-40 transition-colors"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-forensic-bg rounded border border-forensic-border p-0.5 ml-2 font-mono text-[10px]">
            {[1, 2, 5].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded transition-all ${
=======
            className="h-8 w-8 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border border-border disabled:opacity-40 transition-colors inline-flex items-center justify-center shrink-0"
          >
            <SkipForward className="h-4 w-4 shrink-0" />
          </button>

          {/* Speed Selector */}
          <div className="inline-flex items-center bg-surface-raised rounded-lg border border-border p-0.5 ml-1 text-xs">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-md transition-all font-medium ${
>>>>>>> Stashed changes
                  speed === s
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-forensic-textDim hover:text-forensic-text'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Step Indicator & Active Timestamp */}
<<<<<<< Updated upstream
        <div className="flex items-center space-x-3 font-mono text-xs text-forensic-textDim">
          <span className="flex items-center space-x-1">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-forensic-text font-bold">
=======
        <div className="inline-flex items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="text-text font-medium">
>>>>>>> Stashed changes
              {currentTx ? new Date(currentTx.timestamp).toUTCString() : '-'}
            </span>
          </span>

<<<<<<< Updated upstream
          <span className="px-2 py-0.5 rounded bg-forensic-bg border border-forensic-border text-[10px] font-bold text-forensic-text">
=======
          <Badge variant="neutral" size="sm">
>>>>>>> Stashed changes
            Step {currentIndex + 1} of {totalSteps}
          </Badge>
        </div>
      </div>

      {/* Scrubbable Range Slider */}
      <div className="relative flex items-center">
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-forensic-surfaceRaised rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
      </div>

      {/* Active Transaction Snapshot Card */}
      {currentTx && (
<<<<<<< Updated upstream
        <div className="p-2 rounded bg-forensic-bg/80 border border-forensic-border flex flex-wrap items-center justify-between text-[11px] font-mono text-forensic-textDim gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <Zap className="h-3 w-3 inline" />
=======
        <div className="p-3 rounded-xl bg-surface-raised/50 border border-border flex flex-wrap items-center justify-between text-xs text-text-secondary gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-text font-mono font-bold inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
>>>>>>> Stashed changes
              <span>
                {currentTx.amount.toFixed(4)} {currentTx.token_symbol || 'ETH'}
              </span>
            </span>
<<<<<<< Updated upstream
            <span>•</span>
            <span className="text-forensic-text truncate max-w-[120px]" title={currentTx.from_address}>
              From: {currentTx.from_address.slice(0, 6)}...{currentTx.from_address.slice(-4)}
            </span>
            <span>→</span>
            <span className="text-forensic-text truncate max-w-[120px]" title={currentTx.to_address}>
=======
            <span className="text-border">•</span>
            <span className="text-text font-mono" title={currentTx.from_address}>
              From: {currentTx.from_address.slice(0, 6)}...{currentTx.from_address.slice(-4)}
            </span>
            <span>→</span>
            <span className="text-text font-mono" title={currentTx.to_address}>
>>>>>>> Stashed changes
              To: {currentTx.to_address.slice(0, 6)}...{currentTx.to_address.slice(-4)}
            </span>
          </div>

<<<<<<< Updated upstream
          <div className="flex items-center space-x-2">
            <span className="text-forensic-textDim text-[10px]">
              Tx: {currentTx.tx_hash.slice(0, 10)}...
            </span>
=======
          <div className="inline-flex items-center gap-2 font-mono text-text-muted">
            <span>Tx: {currentTx.tx_hash.slice(0, 8)}...{currentTx.tx_hash.slice(-6)}</span>
>>>>>>> Stashed changes
          </div>
        </div>
      )}
    </div>
  );
};

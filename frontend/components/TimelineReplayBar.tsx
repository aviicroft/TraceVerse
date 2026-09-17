'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock, Zap } from 'lucide-react';
import { NormalizedTransaction } from '../lib/types';

interface TimelineReplayBarProps {
  transactions: NormalizedTransaction[];
  onStepChange?: (tx: NormalizedTransaction | null, stepIndex: number) => void;
  onClearReplay?: () => void;
}

export const TimelineReplayBar: React.FC<TimelineReplayBarProps> = ({
  transactions,
  onStepChange,
  onClearReplay,
}) => {
  const sortedTxs = React.useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [transactions]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = sortedTxs.length;
  const currentTx = sortedTxs[currentIndex] || null;

  // Only notify parent of step change if replay mode has been explicitly activated by user
  useEffect(() => {
    if (isActive && sortedTxs.length > 0) {
      onStepChange?.(currentTx, currentIndex);
    }
  }, [isActive, currentIndex, currentTx, sortedTxs.length]);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(400, 1500 / speed);
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
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
    setIsActive(true);
    if (currentIndex >= totalSteps - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setIsActive(true);
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsActive(true);
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsActive(false);
    setCurrentIndex(0);
    onClearReplay?.();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsActive(true);
    setIsPlaying(false);
    setCurrentIndex(Number(e.target.value));
  };

  if (totalSteps === 0) return null;

  return (
    <div className="p-3.5 bg-surface border border-border rounded-xl shadow-vercel flex flex-col space-y-3 font-sans">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Playback Button Group */}
        <div className="inline-flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleReset}
            title={isActive ? 'Clear replay filter & show all' : 'Reset timeline'}
            className={`h-7 px-2 rounded-md border transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 ${
              isActive
                ? 'bg-accent/15 text-accent border-accent/40 hover:bg-accent/25'
                : 'bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border-border'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            {isActive && <span className="text-[10px] font-mono font-medium hidden sm:inline leading-none">Reset View</span>}
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentIndex === 0}
            title="Previous Step"
            className="h-7 w-7 rounded-md bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border border-border disabled:opacity-40 transition-colors inline-flex items-center justify-center shrink-0"
          >
            <SkipBack className="h-3.5 w-3.5 shrink-0" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`inline-flex items-center justify-center gap-1.5 h-7 px-3 rounded-md font-medium text-xs shadow-sm transition-all shrink-0 ${
              isPlaying
                ? 'bg-warning text-white'
                : 'bg-text text-bg hover:opacity-90'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 shrink-0" />
                <span className="leading-none">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 shrink-0" />
                <span className="leading-none">Replay Transfers</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentIndex === totalSteps - 1}
            title="Next Step"
            className="h-7 w-7 rounded-md bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border border-border disabled:opacity-40 transition-colors inline-flex items-center justify-center shrink-0"
          >
            <SkipForward className="h-3.5 w-3.5 shrink-0" />
          </button>

          {/* Speed Selector */}
          <div className="inline-flex items-center bg-bg rounded-md border border-border p-0.5 ml-1 font-mono text-[10px] shrink-0">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded transition-all leading-none ${
                  speed === s
                    ? 'bg-surface text-text font-bold shadow-sm'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Step Indicator & Active Timestamp */}
        <div className="inline-flex items-center gap-3 font-mono text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="text-text font-semibold">
              {currentTx ? new Date(currentTx.timestamp).toUTCString() : '-'}
            </span>
          </span>

          <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border text-[10px] font-semibold text-text shrink-0">
            Step {currentIndex + 1} of {totalSteps}
          </span>
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
          className="w-full h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>

      {/* Active Transaction Snapshot Card */}
      {currentTx && (
        <div className="p-2.5 rounded-lg bg-bg border border-border flex flex-wrap items-center justify-between text-[11px] font-mono text-text-dim gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-text font-bold inline-flex items-center gap-1">
              <Zap className="h-3 w-3 text-accent shrink-0" />
              <span>
                {currentTx.amount.toFixed(4)} {currentTx.token_symbol || 'ETH'}
              </span>
            </span>
            <span>•</span>
            <span className="text-text truncate max-w-[130px]" title={currentTx.from_address}>
              From: {currentTx.from_address.slice(0, 6)}...{currentTx.from_address.slice(-4)}
            </span>
            <span>→</span>
            <span className="text-text truncate max-w-[130px]" title={currentTx.to_address}>
              To: {currentTx.to_address.slice(0, 6)}...{currentTx.to_address.slice(-4)}
            </span>
          </div>

          <div className="inline-flex items-center gap-2">
            <span className="text-text-muted text-[10px]">
              Tx: {currentTx.tx_hash.slice(0, 10)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

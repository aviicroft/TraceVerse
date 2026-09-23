'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock, Zap } from 'lucide-react';
import { NormalizedTransaction } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
    <div className="p-4 bg-surface border border-border rounded-xl shadow-panel flex flex-col space-y-3 font-sans text-xs">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback Button Group */}
        <div className="inline-flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleReset}
            title={isActive ? 'Clear replay filter & show all' : 'Reset timeline'}
            className={`h-8 px-2.5 rounded-lg border transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 text-xs font-medium ${
              isActive
                ? 'bg-accent/15 text-accent border-accent/40 hover:bg-accent/25'
                : 'bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border-border'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            {isActive && <span className="hidden sm:inline">Reset</span>}
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentIndex === 0}
            title="Previous Step"
            className="h-8 w-8 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-muted hover:text-text border border-border disabled:opacity-40 transition-colors inline-flex items-center justify-center shrink-0"
          >
            <SkipBack className="h-4 w-4 shrink-0" />
          </button>

          <Button
            variant={isPlaying ? 'danger' : 'primary'}
            size="sm"
            onClick={handleTogglePlay}
            icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          >
            {isPlaying ? 'Pause' : 'Replay Transfers'}
          </Button>

          <button
            onClick={handleStepForward}
            disabled={currentIndex === totalSteps - 1}
            title="Next Step"
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
        <div className="inline-flex items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="text-text font-medium">
              {currentTx ? new Date(currentTx.timestamp).toUTCString() : '-'}
            </span>
          </span>

          <Badge variant="neutral" size="sm">
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
          className="w-full h-1.5 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>

      {/* Active Transaction Snapshot Card */}
      {currentTx && (
        <div className="p-3 rounded-xl bg-surface-raised/50 border border-border flex flex-wrap items-center justify-between text-xs text-text-secondary gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-text font-mono font-bold inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>
                {currentTx.amount.toFixed(4)} {currentTx.token_symbol || 'ETH'}
              </span>
            </span>
            <span className="text-border">•</span>
            <span className="text-text font-mono" title={currentTx.from_address}>
              From: {currentTx.from_address.slice(0, 6)}...{currentTx.from_address.slice(-4)}
            </span>
            <span>→</span>
            <span className="text-text font-mono" title={currentTx.to_address}>
              To: {currentTx.to_address.slice(0, 6)}...{currentTx.to_address.slice(-4)}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 font-mono text-text-muted">
            <span>Tx: {currentTx.tx_hash.slice(0, 8)}...{currentTx.tx_hash.slice(-6)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

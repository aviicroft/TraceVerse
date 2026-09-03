'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Clock, Zap, DollarSign } from 'lucide-react';
import { NormalizedTransaction } from '../lib/types';

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

  // Trigger callback when active step changes
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
    <div className="p-3 bg-forensic-surface border border-forensic-border rounded-lg shadow-lg flex flex-col space-y-2.5 font-sans">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Playback Button Group */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleReset}
            title="Reset to beginning"
            className="p-1.5 rounded bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-textDim hover:text-forensic-text transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleStepBack}
            disabled={currentIndex === 0}
            title="Previous Step"
            className="p-1.5 rounded bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-textDim hover:text-forensic-text disabled:opacity-40 transition-colors"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleTogglePlay}
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

          <button
            onClick={handleStepForward}
            disabled={currentIndex === totalSteps - 1}
            title="Next Step"
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
        <div className="flex items-center space-x-3 font-mono text-xs text-forensic-textDim">
          <span className="flex items-center space-x-1">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-forensic-text font-bold">
              {currentTx ? new Date(currentTx.timestamp).toUTCString() : '-'}
            </span>
          </span>

          <span className="px-2 py-0.5 rounded bg-forensic-bg border border-forensic-border text-[10px] font-bold text-forensic-text">
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
          className="w-full h-1.5 bg-forensic-surfaceRaised rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
      </div>

      {/* Active Transaction Snapshot Card */}
      {currentTx && (
        <div className="p-2 rounded bg-forensic-bg/80 border border-forensic-border flex flex-wrap items-center justify-between text-[11px] font-mono text-forensic-textDim gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <Zap className="h-3 w-3 inline" />
              <span>
                {currentTx.amount.toFixed(4)} {currentTx.token_symbol || 'ETH'}
              </span>
            </span>
            <span>•</span>
            <span className="text-forensic-text truncate max-w-[120px]" title={currentTx.from_address}>
              From: {currentTx.from_address.slice(0, 6)}...{currentTx.from_address.slice(-4)}
            </span>
            <span>→</span>
            <span className="text-forensic-text truncate max-w-[120px]" title={currentTx.to_address}>
              To: {currentTx.to_address.slice(0, 6)}...{currentTx.to_address.slice(-4)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-forensic-textDim text-[10px]">
              Tx: {currentTx.tx_hash.slice(0, 10)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  X,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../lib/api';

interface MLEvalData {
  evaluation_timestamp: string;
  model_version: string;
  deployment_status: string;
  deployment_status_explanation: string;
  dataset_summary: {
    total_labelled_wallets: number;
    usable_test_wallets: number;
    train_wallets: number;
    validation_wallets: number;
    number_of_vasps_represented: number;
    class_distribution: Record<string, number>;
  };
  comparative_benchmarks: {
    rule_based_baseline: {
      top_1_accuracy: number;
      top_3_accuracy: number;
      precision_macro: number;
      recall_macro: number;
      f1_macro: number;
    };
    ml_model_alone: {
      top_1_accuracy: number;
      top_3_accuracy: number;
      precision_macro: number;
      recall_macro: number;
      f1_macro: number;
    };
    'hybrid_ensemble_0.70_rule_0.30_ml': {
      top_1_accuracy: number;
      top_3_accuracy: number;
      precision_macro: number;
      recall_macro: number;
      f1_macro: number;
      lift_over_rule_baseline: number;
    };
  };
  per_vasp_performance: Record<string, { test_instances: number; top_1_accuracy: number }>;
  confusion_matrix: {
    classes: string[];
    matrix: number[][];
  };
  limitations_and_disclaimer: string[];
}

interface MLEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MLEvaluationModal: React.FC<MLEvaluationModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<MLEvalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEval = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMLEvaluation();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch ML evaluation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEval();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
      <div className="bg-surface border border-border rounded-xl shadow-vercel-lg w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-text transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-raised/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-verified/10 border border-verified/20 text-verified inline-flex items-center justify-center shrink-0">
              <BrainCircuit className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide uppercase font-mono">
                  Offline Machine Learning Evaluation & Benchmarks
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-warning-subtle text-warning border border-warning-border font-medium">
                  Model Audit
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Comparative validation of Rule-based heuristic vs ML Pointwise Ranker vs Hybrid Ensemble
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 shrink-0" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
          {loading ? (
            <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center space-y-3 font-sans">
              <RefreshCw className="h-6 w-6 animate-spin text-accent shrink-0" />
              <span>Running benchmark diagnostics over held-out test partitions...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-danger-subtle border border-danger-border text-danger inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <>
              {/* Top Deployment Gate Notice */}
              <div className="p-4 rounded-xl bg-danger-subtle border border-danger-border flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-danger">
                    Evaluation Gate Status: {data.deployment_status}
                  </div>
                  <div className="text-text-muted text-[11px] mt-1 font-sans leading-relaxed">
                    {data.deployment_status_explanation} Primary attribution in the investigation console remains 100% deterministic and explainable.
                  </div>
                </div>
              </div>

              {/* Benchmark Cards */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-text mb-3 inline-flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent shrink-0" />
                  <span>Held-Out Test Set Performance (N = {data.dataset_summary.usable_test_wallets} Unique Wallets)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Rule-Based Baseline */}
                  <div className="p-4 rounded-xl bg-surface-raised/50 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text">1. Rule-Based Baseline</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/10 text-accent border border-accent/20">
                        Deterministic
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-text-dim">Top-1 Accuracy:</span>
                        <span className="font-bold text-accent">{data.comparative_benchmarks.rule_based_baseline.top_1_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Top-3 Accuracy:</span>
                        <span className="text-text font-semibold">{data.comparative_benchmarks.rule_based_baseline.top_3_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Macro Precision:</span>
                        <span className="text-text font-semibold">{data.comparative_benchmarks.rule_based_baseline.precision_macro}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Macro F1 Score:</span>
                        <span className="text-text font-semibold">{data.comparative_benchmarks.rule_based_baseline.f1_macro}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: ML Model Alone */}
                  <div className="p-4 rounded-xl bg-surface-raised/50 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text">2. ML Pointwise Model</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-warning-subtle text-warning border border-warning-border">
                        GradientBoosting
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-text-dim">Top-1 Accuracy:</span>
                        <span className="font-bold text-warning">{data.comparative_benchmarks.ml_model_alone.top_1_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Top-3 Accuracy:</span>
                        <span className="text-text font-semibold">{data.comparative_benchmarks.ml_model_alone.top_3_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Macro Precision:</span>
                        <span className="text-text font-semibold">{data.comparative_benchmarks.ml_model_alone.precision_macro}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Macro F1 Score:</span>
                        <span className="text-text font-semibold">{data.comparative_benchmarks.ml_model_alone.f1_macro}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Hybrid Ensemble */}
                  <div className="p-4 rounded-xl bg-surface-raised/50 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text">3. Hybrid Ensemble (70/30)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-verified-subtle text-verified border border-verified-border">
                        Ensemble
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-text-dim">Top-1 Accuracy:</span>
                        <span className="font-bold text-verified">{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].top_1_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Top-3 Accuracy:</span>
                        <span className="text-text font-semibold">{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].top_3_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Lift vs Baseline:</span>
                        <span className="text-verified font-bold">+{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].lift_over_rule_baseline}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-dim">Macro F1 Score:</span>
                        <span className="text-text font-semibold">{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].f1_macro}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="p-4 bg-surface-raised/40 rounded-xl border border-border space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-text">
                  Confusion Matrix ({data.confusion_matrix.classes.length} VASP Classes)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-1.5 text-left text-text-dim">Actual \ Predicted</th>
                        {data.confusion_matrix.classes.map((c) => (
                          <th key={c} className="p-1.5 text-text font-bold uppercase truncate max-w-[70px]">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {data.confusion_matrix.classes.map((rowName, rIdx) => (
                        <tr key={rowName}>
                          <td className="p-1.5 text-left font-bold text-text truncate max-w-[90px]">
                            {rowName}
                          </td>
                          {data.confusion_matrix.matrix[rIdx]?.map((val, cIdx) => (
                            <td
                              key={cIdx}
                              className={`p-1.5 ${
                                rIdx === cIdx
                                  ? 'bg-accent/15 text-accent font-bold'
                                  : val > 0
                                  ? 'text-danger font-semibold'
                                  : 'text-text-dim'
                              }`}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per-VASP Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-text">
                  Per-VASP Accuracy Performance Breakdown
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(data.per_vasp_performance).map(([vasp, perf]) => (
                    <div key={vasp} className="p-2.5 bg-bg rounded-lg border border-border space-y-0.5">
                      <span className="text-[10px] text-text-dim uppercase font-semibold truncate block">{vasp}</span>
                      <div className="text-sm font-bold text-text">{perf.top_1_accuracy}%</div>
                      <span className="text-[9px] text-text-dim">{perf.test_instances} Test Wallets</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

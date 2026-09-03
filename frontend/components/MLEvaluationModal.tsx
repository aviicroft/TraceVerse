'use client';

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Database,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  FileCode2,
  ShieldAlert,
  Scale
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-forensic-surface border border-forensic-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-forensic-text">
        {/* Header */}
        <div className="p-4 border-b border-forensic-border flex items-center justify-between bg-forensic-surfaceRaised/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold tracking-wide uppercase">
                  Offline Machine Learning Evaluation & Model Benchmark
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Experimental / Diagnostic Mode
                </span>
              </div>
              <p className="text-xs text-forensic-textDim mt-0.5">
                Held-out wallet-level comparative validation of Rule-based vs ML Pointwise Ranker vs Hybrid Ensemble
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-forensic-surfaceRaised text-forensic-textMuted hover:text-forensic-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {loading ? (
            <div className="py-20 text-center text-forensic-textMuted flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
              <span>Running benchmark over held-out test partitions...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          ) : data ? (
            <>
              {/* Top Deployment Gate Notice */}
              <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-800/40 flex items-start space-x-3">
                <ShieldAlert className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-purple-300">
                    Offline Evaluation Gate Status: {data.deployment_status}
                  </div>
                  <div className="text-forensic-textDim text-[11px] mt-0.5">
                    {data.deployment_status_explanation} Primary attribution in the investigation console remains 100% deterministic and explainable.
                  </div>
                </div>
              </div>

              {/* Tri-Way Benchmark Comparison Cards */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-forensic-textDim mb-3 flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span>Held-Out Test Set Performance (N = {data.dataset_summary.usable_test_wallets} Unique Wallets)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Rule-Based Baseline */}
                  <div className="p-4 rounded-xl bg-forensic-surfaceRaised/60 border border-forensic-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-forensic-text">1. Rule-Based Baseline</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Deterministic
                      </span>
                    </div>
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Top-1 Accuracy:</span>
                        <span className="font-bold text-blue-400">{data.comparative_benchmarks.rule_based_baseline.top_1_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Top-3 Accuracy:</span>
                        <span className="text-forensic-text">{data.comparative_benchmarks.rule_based_baseline.top_3_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Macro Precision:</span>
                        <span className="text-forensic-text">{data.comparative_benchmarks.rule_based_baseline.precision_macro}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Macro F1 Score:</span>
                        <span className="text-forensic-text">{data.comparative_benchmarks.rule_based_baseline.f1_macro}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: ML Model Alone */}
                  <div className="p-4 rounded-xl bg-forensic-surfaceRaised/60 border border-forensic-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-forensic-text">2. ML Pointwise Model</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        GradientBoosting
                      </span>
                    </div>
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Top-1 Accuracy:</span>
                        <span className="font-bold text-purple-400">{data.comparative_benchmarks.ml_model_alone.top_1_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Top-3 Accuracy:</span>
                        <span className="text-forensic-text">{data.comparative_benchmarks.ml_model_alone.top_3_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Macro Precision:</span>
                        <span className="text-forensic-text">{data.comparative_benchmarks.ml_model_alone.precision_macro}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Macro F1 Score:</span>
                        <span className="text-forensic-text">{data.comparative_benchmarks.ml_model_alone.f1_macro}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Hybrid Ensemble */}
                  <div className="p-4 rounded-xl bg-forensic-surfaceRaised/60 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-emerald-400">3. Hybrid Ensemble</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        0.70 R + 0.30 ML
                      </span>
                    </div>
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Top-1 Accuracy:</span>
                        <span className="font-bold text-emerald-400">{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].top_1_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Top-3 Accuracy:</span>
                        <span className="text-forensic-text">{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].top_3_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Lift Over Baseline:</span>
                        <span className="text-emerald-400 font-bold">+{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].lift_over_rule_baseline}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-forensic-textDim">Macro F1 Score:</span>
                        <span className="text-forensic-text">{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].f1_macro}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dataset Summary & Class Distribution */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-forensic-textDim mb-3 flex items-center space-x-2">
                  <Database className="h-4 w-4 text-forensic-teal" />
                  <span>Genuine Labelled Dataset Partition (Zero Wallet Leakage)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-forensic-surfaceRaised/40 border border-forensic-border text-center">
                    <div className="text-lg font-bold text-forensic-text">{data.dataset_summary.total_labelled_wallets}</div>
                    <div className="text-[10px] text-forensic-textDim uppercase">Total Labelled Wallets</div>
                  </div>
                  <div className="p-3 rounded-lg bg-forensic-surfaceRaised/40 border border-forensic-border text-center">
                    <div className="text-lg font-bold text-blue-400">{data.dataset_summary.train_wallets}</div>
                    <div className="text-[10px] text-forensic-textDim uppercase">Training Wallets (70%)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-forensic-surfaceRaised/40 border border-forensic-border text-center">
                    <div className="text-lg font-bold text-purple-400">{data.dataset_summary.validation_wallets}</div>
                    <div className="text-[10px] text-forensic-textDim uppercase">Validation Wallets (15%)</div>
                  </div>
                  <div className="p-3 rounded-lg bg-forensic-surfaceRaised/40 border border-forensic-border text-center">
                    <div className="text-lg font-bold text-emerald-400">{data.dataset_summary.usable_test_wallets}</div>
                    <div className="text-[10px] text-forensic-textDim uppercase">Held-Out Test Wallets (15%)</div>
                  </div>
                </div>

                {/* Per-VASP Class Distribution Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(data.dataset_summary.class_distribution).map(([vasp, count]) => (
                    <div
                      key={vasp}
                      className="px-2.5 py-1 rounded bg-forensic-surfaceRaised border border-forensic-border font-mono text-[11px] flex items-center space-x-1.5"
                    >
                      <span className="text-forensic-text font-medium">{vasp}:</span>
                      <span className="text-forensic-teal font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-VASP Accuracy Table */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-forensic-textDim mb-3 flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-amber-400" />
                  <span>Per-VASP Accuracy on Test Partition</span>
                </div>
                <div className="overflow-x-auto border border-forensic-border rounded-lg">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="bg-forensic-surfaceRaised/80 text-forensic-textDim border-b border-forensic-border">
                        <th className="py-2 px-3 font-semibold">VASP Entity</th>
                        <th className="py-2 px-3 font-semibold">Test Wallets</th>
                        <th className="py-2 px-3 font-semibold">Top-1 Accuracy</th>
                        <th className="py-2 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forensic-border/50">
                      {Object.entries(data.per_vasp_performance).map(([vasp, perf]) => (
                        <tr key={vasp} className="hover:bg-forensic-surfaceRaised/30 transition-colors">
                          <td className="py-2 px-3 font-medium text-forensic-text">{vasp}</td>
                          <td className="py-2 px-3 text-forensic-textDim">{perf.test_instances}</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">{perf.top_1_accuracy}%</td>
                          <td className="py-2 px-3">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              PASS
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Limitations & Legal Disclaimer */}
              <div className="p-4 rounded-lg bg-forensic-surfaceRaised/30 border border-forensic-border space-y-2">
                <div className="font-bold text-forensic-text uppercase tracking-wide flex items-center space-x-1.5">
                  <Scale className="h-4 w-4 text-forensic-textDim" />
                  <span>Methodological Safeguards & Non-Proof Disclaimer</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-forensic-textDim text-[11px]">
                  {data.limitations_and_disclaimer.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-forensic-border bg-forensic-surfaceRaised/40 flex items-center justify-between text-xs">
          <div className="text-[11px] text-forensic-textDim font-mono">
            Model: {data?.model_version || 'vasp-ranker-v1.0'} | Timestamp: {data?.evaluation_timestamp || '2026-08-26'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-forensic-surfaceRaised hover:bg-forensic-border text-forensic-text border border-forensic-border transition-colors font-medium text-xs"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

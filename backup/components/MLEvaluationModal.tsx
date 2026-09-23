'use client';

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  X,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../lib/api';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
      <div className="bg-surface border border-border rounded-xl shadow-panel-elevated w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-text transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface-raised/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-verified-subtle border border-verified-border text-verified inline-flex items-center justify-center shrink-0">
              <BrainCircuit className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold tracking-tight text-text">
                  Offline Machine Learning Evaluation & Benchmarks
                </h2>
                <Badge variant="warning" size="sm">
                  Model Audit
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Comparative validation of Rule-based heuristic vs ML Pointwise Ranker vs Hybrid Ensemble
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-raised text-text-muted hover:text-text transition-colors inline-flex items-center justify-center shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 shrink-0" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {loading ? (
            <div className="py-20 text-center text-text-muted flex flex-col items-center justify-center space-y-3 font-sans">
              <RefreshCw className="h-6 w-6 animate-spin text-accent shrink-0" />
              <span>Running benchmark diagnostics over held-out test partitions...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-danger-subtle border border-danger-border text-danger inline-flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <>
              {/* Top Deployment Gate Notice */}
              <div className="p-4 rounded-xl bg-danger-subtle border border-danger-border flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-danger text-sm">
                    Evaluation Gate Status: {data.deployment_status}
                  </div>
                  <div className="text-text-secondary text-xs leading-relaxed">
                    {data.deployment_status_explanation} Primary attribution in the investigation console remains 100% deterministic and explainable.
                  </div>
                </div>
              </div>

              {/* Benchmark Cards */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted inline-flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent shrink-0" />
                  <span>Held-Out Test Set Performance (N = {data.dataset_summary.usable_test_wallets} Unique Wallets)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Rule-Based Baseline */}
                  <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text text-sm">1. Rule-Based Baseline</span>
                      <Badge variant="accent" size="sm">
                        Deterministic
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Top-1 Accuracy:</span>
                        <span className="font-bold font-mono text-accent">{data.comparative_benchmarks.rule_based_baseline.top_1_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Top-3 Accuracy:</span>
                        <span className="font-semibold font-mono text-text">{data.comparative_benchmarks.rule_based_baseline.top_3_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Macro Precision:</span>
                        <span className="font-semibold font-mono text-text">{data.comparative_benchmarks.rule_based_baseline.precision_macro}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Macro F1 Score:</span>
                        <span className="font-semibold font-mono text-text">{data.comparative_benchmarks.rule_based_baseline.f1_macro}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: ML Model Alone */}
                  <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text text-sm">2. ML Pointwise Model</span>
                      <Badge variant="warning" size="sm">
                        GradientBoosting
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Top-1 Accuracy:</span>
                        <span className="font-bold font-mono text-warning">{data.comparative_benchmarks.ml_model_alone.top_1_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Top-3 Accuracy:</span>
                        <span className="font-semibold font-mono text-text">{data.comparative_benchmarks.ml_model_alone.top_3_accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Macro Precision:</span>
                        <span className="font-semibold font-mono text-text">{data.comparative_benchmarks.ml_model_alone.precision_macro}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Macro F1 Score:</span>
                        <span className="font-semibold font-mono text-text">{data.comparative_benchmarks.ml_model_alone.f1_macro}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Hybrid Ensemble */}
                  <div className="p-4 rounded-xl bg-surface-raised/40 border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text text-sm">3. Hybrid Ensemble</span>
                      <Badge variant="success" size="sm">
                        70/30 Blend
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Top-1 Accuracy:</span>
                        <span className="font-bold font-mono text-verified">
                          {data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].top_1_accuracy}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Top-3 Accuracy:</span>
                        <span className="font-semibold font-mono text-text">
                          {data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].top_3_accuracy}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Lift Over Baseline:</span>
                        <span className="font-bold font-mono text-verified">
                          +{data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].lift_over_rule_baseline}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Macro F1 Score:</span>
                        <span className="font-semibold font-mono text-text">
                          {data.comparative_benchmarks['hybrid_ensemble_0.70_rule_0.30_ml'].f1_macro}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-VASP Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Per-Entity Attribution Accuracy (Top-1 Recall)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Object.entries(data.per_vasp_performance).map(([vasp, perf]) => (
                    <div key={vasp} className="p-3 bg-surface-raised/40 rounded-xl border border-border space-y-1">
                      <span className="font-bold text-text text-xs block truncate">{vasp}</span>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>{perf.test_instances} instances</span>
                        <strong className="text-verified font-mono">{perf.top_1_accuracy}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimers */}
              <div className="p-4 bg-surface-raised/30 rounded-xl border border-border space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                  Methodology Boundaries & Statistical Disclaimers
                </span>
                <ul className="space-y-1 text-xs text-text-secondary list-disc pl-4">
                  {data.limitations_and_disclaimer.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-raised/40 flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close Diagnostic Dossier
          </Button>
        </div>
      </div>
    </div>
  );
};

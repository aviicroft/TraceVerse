import os
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional
import networkx as nx
import joblib

from backend.app.ml.features import (
    FEATURE_NAMES,
    extract_candidate_features,
    feature_dict_to_vector
)
from backend.app.ml.train import MODEL_PATH, META_PATH

logger = logging.getLogger(__name__)


class MLInferenceService:
    """
    Thread-safe, lightweight inference engine for VASP candidate ranking.
    Computes learned association probabilities and translates top feature signals.
    """

    _instance = None
    _loaded = False
    _model = None
    _scaler = None
    _metadata = {}

    @classmethod
    def load(cls) -> bool:
        if cls._loaded and cls._model is not None:
            return True

        if not MODEL_PATH.exists():
            logger.info("ML model artifact not found. Inference service remaining in fallback mode.")
            return False

        try:
            artifact = joblib.load(MODEL_PATH)
            cls._model = artifact["model"]
            cls._scaler = artifact["scaler"]
            cls._version = artifact.get("version", "vasp-ranker-v1.0")

            if META_PATH.exists():
                with open(META_PATH, "r", encoding="utf-8") as f:
                    cls._metadata = json.load(f)

            cls._loaded = True
            logger.info(f"Loaded ML model: {cls._version}")
            return True
        except Exception as e:
            logger.error(f"Failed to load ML model artifact: {e}")
            cls._loaded = False
            return False

    @classmethod
    def is_available(cls) -> bool:
        if not cls._loaded:
            return cls.load()
        return cls._loaded and cls._model is not None

    @classmethod
    def predict_candidate(
        cls,
        graph: nx.MultiDiGraph,
        root_wallet: str,
        candidate_vasp_name: str,
        candidate_nodes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates ML association probability and top contributing signals for a candidate VASP.
        Returns graceful fallback if ML is unavailable.
        """
        if not cls.is_available():
            return {
                "ml_available": False,
                "ml_score": None,
                "model_version": None,
                "top_features": [],
                "reason": "Model artifact not loaded or in evaluation mode."
            }

        try:
            feat_dict = extract_candidate_features(
                graph=graph,
                root_wallet=root_wallet,
                candidate_vasp_name=candidate_vasp_name,
                candidate_nodes=candidate_nodes
            )
            feat_vec = feature_dict_to_vector(feat_dict)
            feat_scaled = cls._scaler.transform([feat_vec])

            # Predict positive association probability
            prob = float(cls._model.predict_proba(feat_scaled)[0][1]) * 100.0
            prob_score = round(prob, 1)

            # Extract top contributing signals
            top_signals = []
            if feat_dict.get("is_direct_hop1") == 1.0:
                top_signals.append("+ Direct 1-hop VASP interaction")
            elif feat_dict.get("is_hop2") == 1.0:
                top_signals.append("+ 2-hop intermediary routing")

            if feat_dict.get("flow_volume_ratio", 0.0) >= 0.50:
                top_signals.append("+ High fund flow concentration (>=50% outflow)")
            elif feat_dict.get("flow_volume_ratio", 0.0) >= 0.15:
                top_signals.append("+ Moderate fund flow concentration")

            if feat_dict.get("interaction_count", 0) >= 5:
                top_signals.append(f"+ Frequent interaction pattern ({int(feat_dict['interaction_count'])} txs)")

            if feat_dict.get("burst_density", 0) >= 2.0:
                top_signals.append("+ High temporal velocity (rapid pass-through)")

            if not top_signals:
                top_signals.append("+ Observable graph proximity connection")

            return {
                "ml_available": True,
                "ml_score": prob_score,
                "model_version": cls._version,
                "top_features": top_signals[:4],
                "raw_features": feat_dict
            }
        except Exception as e:
            logger.warning(f"ML inference error for candidate {candidate_vasp_name}: {e}")
            return {
                "ml_available": False,
                "ml_score": None,
                "model_version": None,
                "top_features": [],
                "reason": str(e)
            }


# Try auto-loading on startup
MLInferenceService.load()

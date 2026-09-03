import json
import logging
import datetime
from typing import Dict, Any, Optional
import networkx as nx
from sqlalchemy import select, update

from backend.app.core.config import settings
from backend.app.models.database import (
    AsyncSessionLocal, 
    AnalysisRun, 
    Transaction as DBTransaction,
    Attribution as DBAttribution,
    Evidence as DBEvidence,
    RiskAssessment as DBRiskAssessment
)
from backend.app.services.blockchain.factory import BlockchainProviderFactory
from backend.app.services.graph.builder import TransactionGraphBuilder
from backend.app.services.attribution.engine import AttributionEngine
from backend.app.services.evidence.generator import EvidenceGenerator
from backend.app.services.risk.classifier import RiskClassifier
from backend.app.schemas.analysis import (
    AnalysisDetailResponse,
    GraphData,
    AttributionSchema,
    EvidenceSchema,
    RiskAssessmentSchema
)

logger = logging.getLogger(__name__)

# Fast in-memory cache for live analysis sessions & graph objects
active_analyses_cache: Dict[str, Dict[str, Any]] = {}


class AnalysisWorker:
    """
    Orchestrates the asynchronous execution of full blockchain investigation pipelines:
    Data Acquisition -> Graph Construction -> VASP Attribution -> Evidence Generation -> Risk Scoring.
    """

    @classmethod
    async def run_pipeline(cls, analysis_id: str, wallet_address: str, max_hops: int = 3):
        logger.info(f"Starting investigation pipeline for {wallet_address} (ID: {analysis_id})")
        
        # Initialize in-memory cache state
        active_analyses_cache[analysis_id] = {
            "status": "FETCHING_DATA",
            "wallet_address": wallet_address,
            "max_hops": max_hops,
            "started_at": datetime.datetime.utcnow(),
            "graph_data": None,
            "attributions": [],
            "evidence": [],
            "risk_assessment": None,
            "transactions": [],
            "error_message": None
        }

        async with AsyncSessionLocal() as session:
            try:
                # 1. Update DB state -> FETCHING_DATA
                await session.execute(
                    update(AnalysisRun)
                    .where(AnalysisRun.id == analysis_id)
                    .values(status="FETCHING_DATA")
                )
                await session.commit()

                # 2. Blockchain Fetching & Graph Construction (Auto-routes Ethereum vs Tron)
                provider = BlockchainProviderFactory.get_provider(wallet_address)
                graph_builder = TransactionGraphBuilder(
                    blockchain_provider=provider,
                    max_hops=max_hops,
                    max_nodes=settings.MAX_NODES_PER_ANALYSIS,
                    max_tx_per_address=settings.MAX_TRANSACTIONS_PER_ADDRESS
                )

                active_analyses_cache[analysis_id]["status"] = "BUILDING_GRAPH"
                await session.execute(
                    update(AnalysisRun)
                    .where(AnalysisRun.id == analysis_id)
                    .values(status="BUILDING_GRAPH")
                )
                await session.commit()

                graph: nx.MultiDiGraph = await graph_builder.build_graph_for_wallet(wallet_address)
                graph_data: GraphData = graph_builder.export_cytoscape_data(wallet_address)
                all_txs = graph_builder.all_transactions

                # 3. Analyze: Attribution, Evidence, Risk
                active_analyses_cache[analysis_id]["status"] = "ANALYZING"
                await session.execute(
                    update(AnalysisRun)
                    .where(AnalysisRun.id == analysis_id)
                    .values(status="ANALYZING")
                )
                await session.commit()

                attribution_engine = AttributionEngine()
                attributions = attribution_engine.calculate_attributions(graph, wallet_address)

                evidence_items = []
                for attr in attributions:
                    evs = EvidenceGenerator.generate_evidence_for_attribution(graph, wallet_address, attr)
                    evidence_items.extend(evs)

                risk_assessment = RiskClassifier.evaluate_risk(graph, wallet_address)

                # 4. Persist Results to DB
                # A. Save normalized transactions (conflict-free deduplication)
                seen_keys = set()
                for tx in all_txs:
                    composite_key = (tx.chain, tx.tx_hash, tx.token_address or "", (tx.from_address or "").lower(), (tx.to_address or "").lower())
                    if composite_key in seen_keys:
                        continue
                    seen_keys.add(composite_key)

                    try:
                        if "postgresql" in settings.DATABASE_URL.lower():
                            from sqlalchemy.dialects.postgresql import insert as pg_insert
                            stmt = pg_insert(DBTransaction).values(
                                tx_hash=tx.tx_hash,
                                chain=tx.chain,
                                block_number=tx.block_number,
                                timestamp=tx.timestamp,
                                from_address=tx.from_address,
                                to_address=tx.to_address,
                                asset_type=tx.asset_type,
                                token_address=tx.token_address,
                                token_symbol=tx.token_symbol,
                                token_decimals=tx.token_decimals,
                                amount=tx.amount,
                                gas_used=tx.gas_used,
                                is_error=tx.is_error
                            ).on_conflict_do_nothing()
                            await session.execute(stmt)
                        else:
                            from sqlalchemy.dialects.sqlite import insert as sqlite_insert
                            stmt = sqlite_insert(DBTransaction).values(
                                tx_hash=tx.tx_hash,
                                chain=tx.chain,
                                block_number=tx.block_number,
                                timestamp=tx.timestamp,
                                from_address=tx.from_address,
                                to_address=tx.to_address,
                                asset_type=tx.asset_type,
                                token_address=tx.token_address,
                                token_symbol=tx.token_symbol,
                                token_decimals=tx.token_decimals,
                                amount=tx.amount,
                                gas_used=tx.gas_used,
                                is_error=tx.is_error
                            ).on_conflict_do_nothing()
                            await session.execute(stmt)
                    except Exception as tx_err:
                        logger.debug(f"Transaction insert skipped: {tx_err}")

                # B. Save Attributions
                for attr in attributions:
                    db_attr = DBAttribution(
                        analysis_id=analysis_id,
                        vasp_name=attr.vasp_name,
                        score=attr.score,
                        evidence_strength=attr.evidence_strength,
                        rank=attr.rank,
                        summary=attr.summary,
                        metrics_json=json.dumps(attr.metrics) if attr.metrics else None
                    )
                    session.add(db_attr)

                # C. Save Evidence
                for ev in evidence_items:
                    db_ev = DBEvidence(
                        analysis_id=analysis_id,
                        evidence_type=ev.evidence_type,
                        source_address=ev.source_address,
                        target_address=ev.target_address,
                        tx_hash=ev.tx_hash,
                        hop_distance=ev.hop_distance,
                        amount=ev.amount,
                        asset_symbol=ev.asset_symbol,
                        explanation=ev.explanation,
                        strength=ev.strength
                    )
                    session.add(db_ev)

                # D. Save Risk Assessment
                db_risk = DBRiskAssessment(
                    analysis_id=analysis_id,
                    risk_level=risk_assessment.risk_level,
                    score=risk_assessment.score,
                    indicators_json=json.dumps(risk_assessment.indicators),
                    explanation=risk_assessment.explanation
                )
                session.add(db_risk)

                # E. Update AnalysisRun to COMPLETED
                completed_time = datetime.datetime.utcnow()
                await session.execute(
                    update(AnalysisRun)
                    .where(AnalysisRun.id == analysis_id)
                    .values(
                        status="COMPLETED",
                        completed_at=completed_time,
                        num_transactions=len(all_txs),
                        num_nodes=len(graph.nodes),
                        num_edges=len(graph.edges)
                    )
                )
                await session.commit()

                # Update in-memory cache
                active_analyses_cache[analysis_id].update({
                    "status": "COMPLETED",
                    "completed_at": completed_time,
                    "graph_data": graph_data,
                    "attributions": attributions,
                    "evidence": evidence_items,
                    "risk_assessment": risk_assessment,
                    "transactions": all_txs,
                    "num_transactions": len(all_txs),
                    "num_nodes": len(graph.nodes),
                    "num_edges": len(graph.edges)
                })
                logger.info(f"Pipeline completed successfully for {wallet_address} (ID: {analysis_id})")

            except Exception as e:
                logger.exception(f"Pipeline execution failed for {wallet_address}: {e}")
                err_msg = str(e)
                active_analyses_cache[analysis_id]["status"] = "FAILED"
                active_analyses_cache[analysis_id]["error_message"] = err_msg

                await session.execute(
                    update(AnalysisRun)
                    .where(AnalysisRun.id == analysis_id)
                    .values(
                        status="FAILED",
                        error_message=err_msg,
                        completed_at=datetime.datetime.utcnow()
                    )
                )
                await session.commit()

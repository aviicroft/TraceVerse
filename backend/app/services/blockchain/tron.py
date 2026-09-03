import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx

from backend.app.core.config import settings
from backend.app.core.address_validator import is_valid_tron_address, hex_to_tron_base58
from backend.app.schemas.analysis import NormalizedTransaction
from backend.app.services.blockchain.base import BlockchainProvider

logger = logging.getLogger(__name__)

TRONGRID_API_URL = "https://api.trongrid.io"
USDT_TRON_CONTRACT = "TR7NHqjekKQxGTCi8q8ZY4pL8otSzgjLj6"


class TronProvider(BlockchainProvider):
    """
    Production-ready Tron data provider interfacing with TronGrid API.
    Fetches real TRX transfers and TRC-20 (USDT) token movements.
    """

    def __init__(self, api_url: Optional[str] = None):
        self.api_url = api_url or TRONGRID_API_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS
        self.max_retries = settings.MAX_RETRIES
        # Lower throttle if an authenticated API key is configured
        self.rate_limit_delay = 0.05 if settings.TRONGRID_API_KEY else settings.RATE_LIMIT_DELAY_SECONDS
        self._lock = asyncio.Lock()
        self._last_request_time = 0.0

    def _get_headers(self) -> Dict[str, str]:
        headers = {"Accept": "application/json"}
        if settings.TRONGRID_API_KEY:
            headers["TRON-PRO-API-KEY"] = settings.TRONGRID_API_KEY
        return headers

    async def _throttle(self):
        async with self._lock:
            loop = asyncio.get_running_loop()
            now = loop.time()
            elapsed = now - self._last_request_time
            if elapsed < self.rate_limit_delay:
                await asyncio.sleep(self.rate_limit_delay - elapsed)
            self._last_request_time = loop.time()

    async def get_native_transactions(
        self, 
        address: str, 
        page: int = 1, 
        offset: int = 50
    ) -> List[NormalizedTransaction]:
        """Fetches native TRX transactions from TronGrid."""
        if not is_valid_tron_address(address):
            return []

        url = f"{self.api_url}/v1/accounts/{address}/transactions"
        params = {"limit": min(offset, 50), "order_by": "block_timestamp,desc"}

        try:
            await self._throttle()
            async with httpx.AsyncClient(timeout=self.timeout, headers=self._get_headers()) as client:
                response = await client.get(url, params=params)
                if response.status_code != 200:
                    logger.warning(f"TronGrid returned status {response.status_code} for {address}")
                    return []
                data = response.json()
                raw_txs = data.get("data", [])

            parsed = []
            for item in raw_txs:
                tx_id = item.get("txID", "")
                raw_data = item.get("raw_data", {})
                contract_list = raw_data.get("contract", [])
                if not contract_list:
                    continue

                contract = contract_list[0]
                contract_type = contract.get("type", "")
                
                # TransferContract represents standard TRX transfer
                if contract_type == "TransferContract":
                    val = contract.get("parameter", {}).get("value", {})
                    owner_addr = hex_to_tron_base58(val.get("owner_address", ""))
                    to_addr = hex_to_tron_base58(val.get("to_address", ""))
                    amount_sun = int(val.get("amount", 0))
                    amount_trx = amount_sun / 1e6

                    ts_ms = raw_data.get("timestamp", 0)
                    dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc) if ts_ms > 0 else datetime.now(timezone.utc)

                    parsed.append(
                        NormalizedTransaction(
                            tx_hash=tx_id,
                            chain="tron",
                            block_number=item.get("blockNumber", 0),
                            timestamp=dt,
                            from_address=owner_addr,
                            to_address=to_addr,
                            asset_type="TRX",
                            token_symbol="TRX",
                            token_decimals=6,
                            amount=amount_trx,
                            is_error=False
                        )
                    )
            return parsed
        except Exception as e:
            logger.error(f"Error fetching Tron native transactions for {address}: {e}")
            return []

    async def get_token_transfers(
        self, 
        address: str, 
        page: int = 1, 
        offset: int = 50
    ) -> List[NormalizedTransaction]:
        """Fetches TRC-20 (USDT, etc.) token transfers from TronGrid."""
        if not is_valid_tron_address(address):
            return []

        url = f"{self.api_url}/v1/accounts/{address}/transactions/trc20"
        params = {"limit": min(offset, 50), "order_by": "block_timestamp,desc"}

        try:
            await self._throttle()
            async with httpx.AsyncClient(timeout=self.timeout, headers=self._get_headers()) as client:
                response = await client.get(url, params=params)
                if response.status_code != 200:
                    logger.warning(f"TronGrid TRC20 returned status {response.status_code} for {address}")
                    return []
                data = response.json()
                raw_txs = data.get("data", [])

            parsed = []
            for item in raw_txs:
                tx_id = item.get("transaction_id", "")
                token_info = item.get("token_info", {})
                sym = token_info.get("symbol", "USDT")
                decimals = int(token_info.get("decimals", 6) or 6)
                val_raw = int(item.get("value", 0))
                amt = val_raw / (10 ** decimals) if decimals > 0 else float(val_raw)

                ts_ms = item.get("block_timestamp", 0)
                dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc) if ts_ms > 0 else datetime.now(timezone.utc)

                from_addr = item.get("from", "")
                to_addr = item.get("to", "")

                if from_addr and to_addr:
                    parsed.append(
                        NormalizedTransaction(
                            tx_hash=tx_id,
                            chain="tron",
                            block_number=0,
                            timestamp=dt,
                            from_address=from_addr,
                            to_address=to_addr,
                            asset_type="TRC20",
                            token_address=token_info.get("address", USDT_TRON_CONTRACT),
                            token_symbol=sym,
                            token_decimals=decimals,
                            amount=amt,
                            is_error=False
                        )
                    )
            return parsed
        except Exception as e:
            logger.error(f"Error fetching Tron TRC20 transfers for {address}: {e}")
            return []

    async def get_address_activity(
        self, 
        address: str, 
        max_tx: int = 50
    ) -> List[NormalizedTransaction]:
        """Fetches combined TRX and TRC-20 transfers for Tron address."""
        trx_task = self.get_native_transactions(address, page=1, offset=max_tx)
        trc20_task = self.get_token_transfers(address, page=1, offset=max_tx)

        results = await asyncio.gather(trx_task, trc20_task, return_exceptions=True)
        combined: List[NormalizedTransaction] = []
        for res in results:
            if isinstance(res, list):
                combined.extend(res)
            elif isinstance(res, Exception):
                logger.error(f"Error in Tron address activity: {res}")

        combined.sort(key=lambda x: x.timestamp, reverse=True)
        return combined[:max_tx]

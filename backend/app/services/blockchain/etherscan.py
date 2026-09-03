import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx

from backend.app.core.config import settings
from backend.app.core.address_validator import normalize_eth_address
from backend.app.schemas.analysis import NormalizedTransaction
from backend.app.services.blockchain.base import BlockchainProvider

logger = logging.getLogger(__name__)


class EtherscanProvider(BlockchainProvider):
    """
    Production-ready Ethereum data provider interfacing with Etherscan-compatible APIs.
    Implements robust rate-limiting, exponential backoff, pagination, and error isolation.
    """

    def __init__(
        self, 
        api_key: Optional[str] = None, 
        api_url: Optional[str] = None
    ):
        self.api_key = api_key if api_key is not None else settings.BLOCKCHAIN_API_KEY
        self.api_url = api_url or settings.BLOCKCHAIN_API_URL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS
        self.max_retries = settings.MAX_RETRIES
        self.rate_limit_delay = settings.RATE_LIMIT_DELAY_SECONDS
        self._lock = asyncio.Lock()
        self._last_request_time = 0.0

    async def _throttle(self):
        """Ensure requests respect provider rate limits (e.g., max 5 req/sec)."""
        async with self._lock:
            loop = asyncio.get_running_loop()
            now = loop.time()
            elapsed = now - self._last_request_time
            if elapsed < self.rate_limit_delay:
                await asyncio.sleep(self.rate_limit_delay - elapsed)
            self._last_request_time = loop.time()

    async def _fetch_with_retry(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes HTTP GET request against the blockchain explorer with exponential backoff.
        """
        # Always attach API key and Chain ID for Etherscan V2 API
        active_key = self.api_key or settings.BLOCKCHAIN_API_KEY
        if active_key:
            params["apikey"] = active_key
        if "chainid" not in params:
            params["chainid"] = settings.CHAIN_ID

        for attempt in range(1, self.max_retries + 1):
            await self._throttle()
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.get(self.api_url, params=params)
                    response.raise_for_status()
                    data = response.json()

                    # Check Etherscan response status
                    status = str(data.get("status", "1"))
                    message = str(data.get("message", ""))
                    result = data.get("result")

                    # Handle valid empty result
                    if status == "0" and ("No transactions found" in message or "No records found" in message):
                        return {"status": "1", "result": []}

                    # Handle rate limit error message
                    if status == "0" and ("Max rate limit reached" in message or "rate limit" in str(result).lower()):
                        wait_time = 1.5 * attempt
                        logger.warning(f"Etherscan rate limit reached. Backing off for {wait_time}s (Attempt {attempt}/{self.max_retries})")
                        await asyncio.sleep(wait_time)
                        continue

                    # Handle invalid API key or other critical errors
                    if status == "0":
                        err_msg = str(result) or message
                        # If API key missing / invalid, log clearly
                        if "Invalid API Key" in err_msg or "Missing/Invalid API Key" in err_msg:
                            raise PermissionError(f"Etherscan API error: {err_msg}. Please configure a valid BLOCKCHAIN_API_KEY in .env.")
                        logger.warning(f"Etherscan returned non-success: status={status}, message={message}, result={result}")
                        return {"status": "0", "result": [], "error": err_msg}

                    return data

            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error querying Etherscan on attempt {attempt}: {e}")
                if attempt == self.max_retries:
                    raise ConnectionError(f"Blockchain API returned HTTP error: {e.response.status_code}")
                await asyncio.sleep(1.0 * attempt)
            except httpx.RequestError as e:
                logger.error(f"Network error querying Etherscan on attempt {attempt}: {e}")
                if attempt == self.max_retries:
                    raise ConnectionError(f"Failed to connect to Blockchain API: {str(e)}")
                await asyncio.sleep(1.0 * attempt)

        return {"status": "0", "result": [], "error": "Exceeded maximum retry attempts"}

    def _parse_native_tx(self, raw: Dict[str, Any]) -> Optional[NormalizedTransaction]:
        """Normalizes a raw Etherscan native ETH transaction."""
        try:
            # Skip contract creation if no to_address
            to_addr = raw.get("to") or ""
            from_addr = raw.get("from") or ""
            if not from_addr or not to_addr:
                return None

            value_wei = int(raw.get("value", 0))
            amount_eth = value_wei / 1e18

            timestamp_unix = int(raw.get("timeStamp", 0))
            dt = datetime.utcfromtimestamp(timestamp_unix) if timestamp_unix > 0 else datetime.utcnow()

            return NormalizedTransaction(
                tx_hash=raw.get("hash", ""),
                chain="ethereum",
                block_number=int(raw.get("blockNumber", 0)),
                timestamp=dt,
                from_address=normalize_eth_address(from_addr),
                to_address=normalize_eth_address(to_addr),
                asset_type="ETH",
                token_address=None,
                token_symbol="ETH",
                token_decimals=18,
                amount=amount_eth,
                gas_used=int(raw.get("gasUsed", 0)) if raw.get("gasUsed") else None,
                is_error=(raw.get("isError") == "1" or raw.get("txreceipt_status") == "0")
            )
        except Exception as e:
            logger.warning(f"Failed to parse native transaction: {e}")
            return None

    def _parse_token_tx(self, raw: Dict[str, Any]) -> Optional[NormalizedTransaction]:
        """Normalizes a raw Etherscan ERC-20 token transfer."""
        try:
            to_addr = raw.get("to") or ""
            from_addr = raw.get("from") or ""
            if not from_addr or not to_addr:
                return None

            decimals = int(raw.get("tokenDecimal", 18) or 18)
            value_raw = int(raw.get("value", 0))
            amount_token = value_raw / (10 ** decimals) if decimals > 0 else float(value_raw)

            timestamp_unix = int(raw.get("timeStamp", 0))
            dt = datetime.utcfromtimestamp(timestamp_unix) if timestamp_unix > 0 else datetime.utcnow()

            return NormalizedTransaction(
                tx_hash=raw.get("hash", ""),
                chain="ethereum",
                block_number=int(raw.get("blockNumber", 0)),
                timestamp=dt,
                from_address=normalize_eth_address(from_addr),
                to_address=normalize_eth_address(to_addr),
                asset_type="ERC20",
                token_address=normalize_eth_address(raw.get("contractAddress", "")),
                token_symbol=raw.get("tokenSymbol", "ERC20"),
                token_decimals=decimals,
                amount=amount_token,
                gas_used=int(raw.get("gasUsed", 0)) if raw.get("gasUsed") else None,
                is_error=False
            )
        except Exception as e:
            logger.warning(f"Failed to parse token transaction: {e}")
            return None

    async def get_native_transactions(
        self, 
        address: str, 
        page: int = 1, 
        offset: int = 50
    ) -> List[NormalizedTransaction]:
        """Fetches native ETH transactions for an address."""
        norm_address = normalize_eth_address(address)
        params = {
            "module": "account",
            "action": "txlist",
            "address": norm_address,
            "startblock": 0,
            "endblock": 99999999,
            "page": page,
            "offset": offset,
            "sort": "desc"
        }
        data = await self._fetch_with_retry(params)
        raw_list = data.get("result", [])
        if not isinstance(raw_list, list):
            return []

        parsed = []
        for item in raw_list:
            tx = self._parse_native_tx(item)
            if tx and not tx.is_error:  # Exclude reverted transactions from fund flow
                parsed.append(tx)
        return parsed

    async def get_token_transfers(
        self, 
        address: str, 
        page: int = 1, 
        offset: int = 50
    ) -> List[NormalizedTransaction]:
        """Fetches ERC-20 token transfer events for an address."""
        norm_address = normalize_eth_address(address)
        params = {
            "module": "account",
            "action": "tokentx",
            "address": norm_address,
            "startblock": 0,
            "endblock": 99999999,
            "page": page,
            "offset": offset,
            "sort": "desc"
        }
        data = await self._fetch_with_retry(params)
        raw_list = data.get("result", [])
        if not isinstance(raw_list, list):
            return []

        parsed = []
        for item in raw_list:
            tx = self._parse_token_tx(item)
            if tx:
                parsed.append(tx)
        return parsed

    async def get_address_activity(
        self, 
        address: str, 
        max_tx: int = 50
    ) -> List[NormalizedTransaction]:
        """
        Fetches combined native ETH and ERC-20 token transfers, dedupes, and sorts by timestamp.
        """
        norm_address = normalize_eth_address(address)
        
        # Parallel fetch of ETH transactions and ERC-20 transfers
        eth_task = self.get_native_transactions(norm_address, page=1, offset=max_tx)
        token_task = self.get_token_transfers(norm_address, page=1, offset=max_tx)
        
        results = await asyncio.gather(eth_task, token_task, return_exceptions=True)
        
        combined: List[NormalizedTransaction] = []
        for res in results:
            if isinstance(res, list):
                combined.extend(res)
            elif isinstance(res, Exception):
                logger.error(f"Error fetching address activity for {norm_address}: {res}")
                # Propagate authorization errors
                if isinstance(res, PermissionError):
                    raise res

        # Sort descending by timestamp, take up to max_tx
        combined.sort(key=lambda x: x.timestamp, reverse=True)
        return combined[:max_tx]

from abc import ABC, abstractmethod
from typing import List
from backend.app.schemas.analysis import NormalizedTransaction


class BlockchainProvider(ABC):
    """
    Abstract Base Class defining the contract for EVM blockchain data providers.
    All concrete blockchain providers must implement these methods without 
    fabricating or guessing transaction data.
    """

    @abstractmethod
    async def get_native_transactions(
        self, 
        address: str, 
        page: int = 1, 
        offset: int = 50
    ) -> List[NormalizedTransaction]:
        """Fetch native ETH normal transactions for the given address."""
        pass

    @abstractmethod
    async def get_token_transfers(
        self, 
        address: str, 
        page: int = 1, 
        offset: int = 50
    ) -> List[NormalizedTransaction]:
        """Fetch ERC-20 token transfers for the given address."""
        pass

    @abstractmethod
    async def get_address_activity(
        self, 
        address: str, 
        max_tx: int = 50
    ) -> List[NormalizedTransaction]:
        """
        Fetch combined native ETH and ERC-20 token transfer activity 
        for an address, sorted chronologically.
        """
        pass

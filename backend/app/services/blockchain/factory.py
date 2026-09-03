from backend.app.core.config import settings
from backend.app.core.address_validator import detect_blockchain, is_valid_tron_address
from backend.app.services.blockchain.base import BlockchainProvider
from backend.app.services.blockchain.etherscan import EtherscanProvider
from backend.app.services.blockchain.tron import TronProvider


class BlockchainProviderFactory:
    """
    Factory automatically routing to the appropriate blockchain provider
    (Ethereum or Tron) based on the address prefix/network.
    """

    @staticmethod
    def get_provider(address_or_chain: str = "ethereum") -> BlockchainProvider:
        # Check if argument is a Tron address or explicit chain name
        if address_or_chain.lower() == "tron" or is_valid_tron_address(address_or_chain):
            return TronProvider()
            
        # Default: Ethereum Etherscan-compatible provider
        return EtherscanProvider(
            api_key=settings.BLOCKCHAIN_API_KEY,
            api_url=settings.BLOCKCHAIN_API_URL
        )

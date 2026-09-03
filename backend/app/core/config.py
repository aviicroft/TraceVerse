import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Determine project base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"


class Settings(BaseSettings):
    # Blockchain Intelligence API
    BLOCKCHAIN_API_KEY: str = Field(default="", description="Etherscan or compatible API Key")
    BLOCKCHAIN_API_URL: str = Field(default="https://api.etherscan.io/v2/api", description="Base API URL for Ethereum explorer")
    TRONGRID_API_KEY: str = Field(default="", description="TronGrid API Key for Tron/TRC-20 tracing")
    CHAIN_ID: str = Field(default="1", description="EVM Chain ID (1 for Ethereum Mainnet)")
    
    # Database
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./crypto_trace.db", description="Database connection URL")
    
    # Analysis Limits
    MAX_HOPS: int = Field(default=3, description="Maximum traversal depth from root wallet")
    MAX_NODES_PER_ANALYSIS: int = Field(default=150, description="Node explosion guard cap")
    MAX_TRANSACTIONS_PER_ADDRESS: int = Field(default=50, description="Max transactions retrieved per address per hop")
    
    # Network & Rate Limiting
    REQUEST_TIMEOUT_SECONDS: float = Field(default=15.0, description="HTTP request timeout in seconds")
    MAX_RETRIES: int = Field(default=3, description="Maximum retry attempts on transient network/rate limit failure")
    RATE_LIMIT_DELAY_SECONDS: float = Field(default=0.25, description="Throttle delay between API calls")

    # Paths
    VASP_DATA_PATH: Path = Field(default=BASE_DIR / "data" / "vasp" / "vasp_addresses.csv")
    ATTRIBUTION_CONFIG_PATH: Path = Field(default=BACKEND_DIR / "attribution_config.yaml")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

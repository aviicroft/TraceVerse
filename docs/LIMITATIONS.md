# Analytical Limitations & Future Cross-Chain Roadmap

## 1. Technical & Analytical Limitations

1. **Analytical Inference vs Legal Proof**:
   - VASP attribution represents probabilistic graph proximity and observable fund flow associations.
   - It should **never** be interpreted as definitive legal proof of beneficial wallet ownership.

2. **Bounded 3-Hop Traversal**:
   - Traversal is limited to 3 hops and 150 local graph nodes to ensure sub-second response times and prevent graph explosion.
   - Flow paths extending beyond 3 hops are intentionally not crawled in this prototype.

3. **Off-Chain & Privacy Obfuscation**:
   - Internal exchange book transfers (off-chain ledger balancing) cannot be observed on the public blockchain.
   - Zero-knowledge mixers (Tornado Cash) and smart contract obfuscation breaks deterministic tracing.

4. **Public Explorer API Rate Limits**:
   - Free tier API keys enforce a limit of ~5 requests/second, which the backend throttles automatically.

---

## 2. Future Cross-Chain Roadmap

Planned extensions for subsequent enterprise / law enforcement versions:
- **Multi-Chain Expansion**: Bitcoin (UTXO graph analysis), Tron (USDT tracking), Solana, BNB Chain, Polygon.
- **Cross-Chain Bridge Detection**: Automated hop continuation across Stargate, Wormhole, Across, and Hop Protocol.
- **DeFi & Mixer Intelligence**: Liquidity pool tracing and smart contract interaction disassembly.
- **Law Enforcement Portal Integration**: NCRP (National Cybercrime Reporting Portal) and SAHYOG interoperability.
- **Supervised GNN Attribution Models**: Graph Neural Networks trained on verified LEA ground-truth datasets.

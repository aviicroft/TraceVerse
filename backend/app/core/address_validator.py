import re
import hashlib
from typing import Optional

ETH_ADDRESS_REGEX = re.compile(r"^(?:0x|0X)[0-9a-fA-F]{40}$")
TRON_ADDRESS_REGEX = re.compile(r"^T[1-9A-HJ-NP-za-km-z]{33}$")
ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def keccak256(data: bytes) -> bytes:
    """Pure-Python implementation of Ethereum Keccak-256 hash."""
    state = [0] * 25
    rate = 136

    RC = [
        0x0000000000000001, 0x0000000000008082, 0x800000000000808A,
        0x8000000080008000, 0x000000000000808B, 0x0000000080000001,
        0x8000000080008081, 0x8000000000008009, 0x000000000000008A,
        0x0000000000000088, 0x0000000080008009, 0x000000008000000A,
        0x000000008000808B, 0x800000000000008B, 0x8000000000008089,
        0x8000000000008003, 0x8000000000008002, 0x8000000000000080,
        0x000000000000800A, 0x800000008000000A, 0x8000000080008081,
        0x8000000000008080, 0x0000000080000001, 0x8000000080008008
    ]

    r_offsets = [
        [0, 36, 3, 41, 18],
        [1, 44, 10, 45, 2],
        [62, 6, 43, 15, 61],
        [28, 55, 25, 21, 56],
        [27, 20, 39, 8, 14]
    ]

    def keccak_f(st):
        for round_idx in range(24):
            C = [st[x] ^ st[x + 5] ^ st[x + 10] ^ st[x + 15] ^ st[x + 20] for x in range(5)]
            D = [C[(x + 4) % 5] ^ (((C[(x + 1) % 5] << 1) | (C[(x + 1) % 5] >> 63)) & 0xFFFFFFFFFFFFFFFF) for x in range(5)]
            st = [st[i] ^ D[i % 5] for i in range(25)]

            B = [0] * 25
            for x in range(5):
                for y in range(5):
                    orig = st[x + 5 * y]
                    rot = r_offsets[x][y]
                    B[y + 5 * ((2 * x + 3 * y) % 5)] = ((orig << rot) | (orig >> (64 - rot))) & 0xFFFFFFFFFFFFFFFF if rot else orig

            for y in range(5):
                y5 = y * 5
                for x in range(5):
                    st[x + y5] = B[x + y5] ^ ((~B[(x + 1) % 5 + y5]) & B[(x + 2) % 5 + y5])

            st[0] ^= RC[round_idx]
        return st

    data_bytearray = bytearray(data)
    data_bytearray.append(0x01)
    while len(data_bytearray) % rate != (rate - 1):
        data_bytearray.append(0x00)
    data_bytearray.append(0x80)

    for block_start in range(0, len(data_bytearray), rate):
        block = data_bytearray[block_start:block_start + rate]
        for i in range(rate // 8):
            val = int.from_bytes(block[i * 8:(i + 1) * 8], byteorder='little')
            state[i] ^= val
        state = keccak_f(state)

    out = bytearray()
    for i in range(4):
        out.extend(state[i].to_bytes(8, byteorder='little'))
    return bytes(out)


def b58decode(s: str) -> Optional[bytes]:
    """Decodes a Base58 string to bytes."""
    val = 0
    for char in s:
        idx = ALPHABET.find(char)
        if idx < 0:
            return None
        val = val * 58 + idx

    res = bytearray()
    while val > 0:
        res.append(val & 0xFF)
        val >>= 8
    res.reverse()

    num_ones = len(s) - len(s.lstrip('1'))
    return b'\x00' * num_ones + bytes(res)


def b58encode(b: bytes) -> str:
    """Encodes bytes to a Base58 string."""
    val = int.from_bytes(b, byteorder='big')
    chars = []
    while val > 0:
        val, mod = divmod(val, 58)
        chars.append(ALPHABET[mod])

    num_zeros = len(b) - len(b.lstrip(b'\x00'))
    return '1' * num_zeros + ''.join(reversed(chars))


def hex_to_tron_base58(hex_addr: str) -> str:
    """Converts a 41-prefixed Tron hex address into Base58Check format (T...)."""
    if not hex_addr or not isinstance(hex_addr, str):
        return ""
    clean = hex_addr.strip().lower()
    if clean.startswith("0x"):
        clean = clean[2:]
    if clean.startswith("41") and len(clean) == 42:
        try:
            raw = bytes.fromhex(clean)
            checksum = hashlib.sha256(hashlib.sha256(raw).digest()).digest()[:4]
            return b58encode(raw + checksum)
        except Exception:
            return hex_addr
    return hex_addr


def detect_blockchain(address: str) -> str:
    """
    Detects blockchain network from address format.
    Returns 'ethereum' or 'tron'.
    """
    if not address or not isinstance(address, str):
        raise ValueError("Address must be a non-empty string.")

    clean = address.strip()
    if is_valid_eth_address(clean):
        return "ethereum"
    elif is_valid_tron_address(clean):
        return "tron"
    else:
        raise ValueError(f"Unrecognized cryptocurrency address format: {address}. Supported: Ethereum (0x...) and Tron (T...).")


def is_valid_crypto_address(address: str) -> bool:
    """Validates if address is a valid Ethereum or Tron address."""
    if not address or not isinstance(address, str):
        return False
    clean = address.strip()
    return bool(is_valid_eth_address(clean) or is_valid_tron_address(clean))


def is_valid_eth_address(address: str) -> bool:
    """Validates Ethereum 20-byte hex address (supports 0x and 0X prefix)."""
    if not address or not isinstance(address, str):
        return False
    return bool(ETH_ADDRESS_REGEX.match(address.strip()))


def is_valid_tron_address(address: str) -> bool:
    """Validates Tron Base58 address starting with T."""
    if not address or not isinstance(address, str):
        return False
    clean = address.strip()
    return bool(TRON_ADDRESS_REGEX.match(clean))


def normalize_address(address: str) -> str:
    """Normalizes address according to its blockchain standard."""
    chain = detect_blockchain(address)
    clean = address.strip()
    if chain == "ethereum":
        return clean.lower()
    return clean  # Tron addresses are case-sensitive Base58


def normalize_eth_address(address: str) -> str:
    """Normalizes Ethereum address to lowercase string with 0x prefix."""
    if not is_valid_eth_address(address):
        raise ValueError(f"Invalid Ethereum address format: {address}")
    return address.strip().lower()


def to_checksum_address(address: str) -> str:
    """Converts Ethereum address to standard EIP-55 checksum format using Keccak-256."""
    if not is_valid_eth_address(address):
        raise ValueError(f"Invalid Ethereum address: {address}")

    clean_addr = address.strip().lower()[2:]
    try:
        keccak = keccak256(clean_addr.encode('utf-8')).hex()
    except Exception:
        return f"0x{clean_addr}"

    checksum_chars = []
    for i, char in enumerate(clean_addr):
        if char.isdigit():
            checksum_chars.append(char)
        else:
            if int(keccak[i], 16) >= 8:
                checksum_chars.append(char.upper())
            else:
                checksum_chars.append(char.lower())

    return "0x" + "".join(checksum_chars)

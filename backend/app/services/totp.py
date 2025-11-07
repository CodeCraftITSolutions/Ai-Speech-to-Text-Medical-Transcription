"""Utilities for managing time-based one-time password (TOTP) secrets."""
from __future__ import annotations

import base64
import hashlib
import hmac
import re
import secrets
import time
from urllib.parse import quote

from app.settings import get_settings

_settings = get_settings()

_CODE_PATTERN = re.compile(r"\s+")
_PERIOD = 30
_DIGITS = 6


def _pad_base32(value: str) -> str:
    missing_padding = (-len(value)) % 8
    if missing_padding:
        value += "=" * missing_padding
    return value


def generate_secret(length: int = 20) -> str:
    """Return a new base32-encoded secret suitable for TOTP."""

    random_bytes = secrets.token_bytes(length)
    secret = base64.b32encode(random_bytes).decode("utf-8").rstrip("=")
    return secret


def build_otpauth_url(secret: str, username: str) -> str:
    """Return an otpauth:// provisioning URI for the given user."""

    issuer = quote(_settings.APP_NAME)
    label = quote(f"{_settings.APP_NAME}:{username}", safe=":")
    params = f"secret={secret}&issuer={issuer}&algorithm=SHA1&digits={_DIGITS}&period={_PERIOD}"
    return f"otpauth://totp/{label}?{params}"


def _generate_otp(secret: str, for_time: float) -> str:
    padded_secret = _pad_base32(secret.upper())
    key = base64.b32decode(padded_secret, casefold=True)
    counter = int(for_time // _PERIOD)
    counter_bytes = counter.to_bytes(8, "big")
    hmac_digest = hmac.new(key, counter_bytes, hashlib.sha1).digest()
    offset = hmac_digest[-1] & 0x0F
    code = (
        ((hmac_digest[offset] & 0x7F) << 24)
        | ((hmac_digest[offset + 1] & 0xFF) << 16)
        | ((hmac_digest[offset + 2] & 0xFF) << 8)
        | (hmac_digest[offset + 3] & 0xFF)
    )
    otp = code % (10**_DIGITS)
    return f"{otp:0{_DIGITS}d}"


def _normalize_code(code: str) -> str:
    return _CODE_PATTERN.sub("", code.strip())


def verify_code(secret: str, code: str, *, valid_window: int = 1) -> bool:
    """Verify a user supplied TOTP code allowing limited clock skew."""

    if not secret or not code:
        return False

    normalized = _normalize_code(code)
    if not normalized.isdigit():
        return False

    current_time = time.time()
    for step in range(-valid_window, valid_window + 1):
        comparison_time = current_time + step * _PERIOD
        candidate = _generate_otp(secret, comparison_time)
        if hmac.compare_digest(candidate, normalized):
            return True
    return False


__all__ = ["generate_secret", "build_otpauth_url", "verify_code"]

"""Helpers for time-based one-time password (TOTP) two-factor workflows."""
from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import re
import secrets
import string
import time
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import quote

_CODE_PATTERN = re.compile(r"\D+")
_DEFAULT_CHALLENGE_MINUTES = 10
_DEFAULT_LOGIN_MINUTES = 5
_SECRET_ALPHABET = string.ascii_uppercase + "234567"
_TOTP_DIGITS = 6
_TIME_STEP = 30


def _normalize_code(code: str | None) -> str:
    if not code:
        return ""
    return _CODE_PATTERN.sub("", code)


def _totp_counter(timestamp: Optional[float] = None) -> int:
    ts = timestamp if timestamp is not None else time.time()
    return int(ts // _TIME_STEP)


def _decode_secret(secret: str) -> bytes:
    normalized = secret.strip().replace(" ", "").upper()
    padding = "=" * ((8 - len(normalized) % 8) % 8)
    return base64.b32decode(normalized + padding)


def _hotp(secret: bytes, counter: int) -> int:
    msg = counter.to_bytes(8, byteorder="big")
    digest = hmac.new(secret, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    truncated = digest[offset : offset + 4]
    code_int = int.from_bytes(truncated, byteorder="big") & 0x7FFFFFFF
    return code_int % (10**_TOTP_DIGITS)


def _generate_secret(length: int = 32) -> str:
    return "".join(secrets.choice(_SECRET_ALPHABET) for _ in range(length))


def generate_totp_secret(length: int = 32) -> str:
    """Generate a random base32 secret for a TOTP authenticator."""

    return _generate_secret(length)


def provisioning_uri(secret: str, username: str, issuer: str) -> str:
    """Create an otpauth URI for authenticator applications."""

    issuer_part = quote(issuer)
    user_part = quote(username)
    label = f"{issuer_part}:{user_part}"
    return f"otpauth://totp/{label}?secret={secret}&issuer={issuer_part}"


def _totp_code(secret: str, counter: int) -> str:
    secret_bytes = _decode_secret(secret)
    code_int = _hotp(secret_bytes, counter)
    return f"{code_int:0{_TOTP_DIGITS}d}"


def verify_totp(code: str, secret: str) -> bool:
    """Validate a user supplied TOTP code against the shared secret."""

    normalized = _normalize_code(code)
    if not normalized or not secret:
        return False

    try:
        secret_bytes = _decode_secret(secret)
    except (binascii.Error, ValueError):
        return False

    current_counter = _totp_counter()
    for offset in (-1, 0, 1):
        counter = current_counter + offset
        if counter < 0:
            continue
        expected = _hotp(secret_bytes, counter)
        if normalized == f"{expected:0{_TOTP_DIGITS}d}":
            return True
    return False


def active_debug_code(secret: Optional[str]) -> Optional[str]:
    """Return the current TOTP code for debugging in non-production envs."""

    if not secret:
        return None
    try:
        return _totp_code(secret, _totp_counter())
    except (binascii.Error, ValueError):
        return None


def enrollment_deadline(minutes: int = _DEFAULT_CHALLENGE_MINUTES) -> datetime:
    """Return when an enrollment challenge should expire."""

    return datetime.utcnow() + timedelta(minutes=minutes)


def login_challenge_deadline(minutes: int = _DEFAULT_LOGIN_MINUTES) -> datetime:
    """Return when a login verification challenge should expire."""

    return datetime.utcnow() + timedelta(minutes=minutes)


__all__ = [
    "active_debug_code",
    "enrollment_deadline",
    "generate_totp_secret",
    "login_challenge_deadline",
    "provisioning_uri",
    "verify_totp",
]

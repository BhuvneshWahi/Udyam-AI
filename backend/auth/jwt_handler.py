"""
UDYAM AI — Supabase JWT & Auth Handler
Extracts, verifies, and parses Supabase JWT tokens.
"""

import os
import logging
from typing import Optional, Dict, Any
from backend.services.supabase_client import get_supabase_optional, is_supabase_configured

logger = logging.getLogger("udyam.auth.jwt")

# Grounded demo user for offline/demo fallback
DEMO_USER: Dict[str, Any] = {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "owner@sharmageneralstore.demo",
    "full_name": "Demo Owner",
    "role": "authenticated",
    "user_metadata": {
        "full_name": "Demo Owner",
        "name": "Demo Owner",
        "preferred_language": "Hinglish",
        "business_name": "Sharma General Store",
    },
    "mfa_enabled": False,
    "aal": "aal1",
    "is_demo": True,
}

DEMO_BUSINESS: Dict[str, Any] = {
    "business_id": "00000000-0000-0000-0000-000000000001",
    "name": "Sharma General Store",
    "owner_name": "Demo Owner",
    "role": "OWNER",
    "city": "Delhi",
    "state": "Delhi",
    "is_demo": True,
}


def is_demo_mode_enabled() -> bool:
    """Allow offline demo auth locally, but disable it automatically with Supabase configured."""
    explicit = os.getenv("UDYAM_DEMO_MODE")
    if explicit is not None:
        return explicit.strip().lower() in {"1", "true", "yes", "on"}
    return not is_supabase_configured()


def extract_bearer_token(auth_header: Optional[str]) -> Optional[str]:
    """Extract bearer token from Authorization header value."""
    if not auth_header:
        return None
    parts = auth_header.strip().split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    if len(parts) == 1:
        return parts[0]
    return None


def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify Supabase JWT token against Supabase Auth service.
    Returns parsed user dict or None if invalid.
    """
    if not token:
        return None

    # Offline demo tokens are accepted only in demo mode. By default this mode
    # disables itself when Supabase is configured, preventing demo-token access
    # from bypassing real authentication in deployed environments.
    if token in ("demo-token", "offline-demo-token"):
        if is_demo_mode_enabled():
            return DEMO_USER
        logger.warning("Rejected offline demo token because demo mode is disabled.")
        return None

    client = get_supabase_optional()
    if not client:
        logger.debug("Supabase not configured; cannot verify JWT token.")
        return None

    try:
        # Call get_user with the JWT token
        user_response = client.auth.get_user(jwt=token)
        if not user_response or not user_response.user:
            return None

        user = user_response.user
        factors = getattr(user, "factors", []) or []
        mfa_enabled = any(getattr(f, "status", "") == "verified" for f in factors)

        # Determine Authenticator Assurance Level (AAL)
        # aal1: password/OTP; aal2: verified MFA factor present
        aal = "aal2" if mfa_enabled else "aal1"

        return {
            "id": str(user.id),
            "email": user.email,
            "role": user.role or "authenticated",
            "phone": user.phone,
            "user_metadata": user.user_metadata or {},
            "app_metadata": user.app_metadata or {},
            "factors": [
                {
                    "id": getattr(f, "id", None),
                    "factor_type": getattr(f, "factor_type", "totp"),
                    "status": getattr(f, "status", None),
                }
                for f in factors
            ],
            "mfa_enabled": mfa_enabled,
            "aal": aal,
            "is_demo": False,
        }
    except Exception as e:
        logger.warning(f"Failed to verify Supabase JWT: {e}")
        return None

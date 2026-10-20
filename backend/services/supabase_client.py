import os
import time
from functools import lru_cache
from typing import Optional, Dict, Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Environment variables can still be provided by the host process.
    pass

try:
    from supabase import Client, create_client
    SUPABASE_SDK_AVAILABLE = True
except ImportError:
    # Keep offline/demo mode importable without the optional database SDK.
    Client = Any  # type: ignore[misc,assignment]
    create_client = None
    SUPABASE_SDK_AVAILABLE = False


def is_supabase_configured() -> bool:
    """Check if minimum required Supabase environment variables are present."""
    url = os.getenv("SUPABASE_URL", "").strip()
    key = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or "").strip()
    return bool(url and key and not url.startswith("your-") and not key.startswith("your-"))


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Create and cache the Supabase client.

    IMPORTANT:
    SUPABASE_URL and SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY must come from environment variables.
    Never hard-code keys in source code.
    Never expose service-role keys to the frontend.
    """
    supabase_url = os.getenv("SUPABASE_URL", "").strip()
    # Support either SUPABASE_SERVICE_ROLE_KEY (backend operations) or SUPABASE_KEY
    supabase_key = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY", "")).strip()

    if not supabase_url:
        raise RuntimeError("SUPABASE_URL is not configured. Set SUPABASE_URL in your .env file.")

    if not supabase_key:
        raise RuntimeError("SUPABASE_KEY is not configured. Set SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY in your .env file.")

    if not SUPABASE_SDK_AVAILABLE or create_client is None:
        raise RuntimeError(
            "The Supabase Python SDK is not installed. Run `pip install -r requirements.txt`."
        )

    return create_client(supabase_url, supabase_key)


def get_supabase() -> Client:
    """Alias for get_supabase_client."""
    return get_supabase_client()


def get_supabase_optional() -> Optional[Client]:
    """Return Supabase client if configured, otherwise None without raising RuntimeError."""
    if not is_supabase_configured():
        return None
    try:
        return get_supabase_client()
    except Exception:
        return None


def check_supabase_health() -> Dict[str, Any]:
    """
    Safe Supabase health check for /api/supabase/health.
    Never returns secrets, tokens, or private keys.
    """
    configured = is_supabase_configured()
    if not configured:
        return {
            "status": "unconfigured",
            "configured": False,
            "connected": False,
            "message": "SUPABASE_URL or SUPABASE_KEY not configured in environment.",
            "latency_ms": None,
        }

    client = get_supabase_optional()
    if not client:
        return {
            "status": "error",
            "configured": True,
            "connected": False,
            "message": "Failed to initialize Supabase client.",
            "latency_ms": None,
        }

    start_time = time.time()
    try:
        # Perform lightweight check against auth or public table
        # We query auth settings or a basic table query
        res = client.table("businesses").select("id").limit(1).execute()
        latency = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "online",
            "configured": True,
            "connected": True,
            "latency_ms": latency,
            "message": "Supabase connection verified successfully.",
        }
    except Exception as e:
        latency = round((time.time() - start_time) * 1000, 2)
        # Check if it was a table-missing error (schema not migrated yet) vs connection error
        err_msg = str(e)
        if "relation" in err_msg.lower() or "does not exist" in err_msg.lower() or "404" in err_msg:
            return {
                "status": "connected_needs_migration",
                "configured": True,
                "connected": True,
                "latency_ms": latency,
                "message": "Supabase connected. Database tables require migration (run migrations/001_initial_schema.sql).",
            }
        return {
            "status": "unreachable",
            "configured": True,
            "connected": False,
            "latency_ms": latency,
            "message": f"Connection error: {err_msg[:120]}",
        }

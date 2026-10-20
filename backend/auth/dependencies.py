"""
UDYAM AI — FastAPI Authentication & Multi-Tenant Authorization Dependencies
"""

import os
import logging
from typing import Optional, List, Dict, Any, Callable
from fastapi import Header, HTTPException, Depends, status

from backend.services.supabase_client import get_supabase_optional, is_supabase_configured
from backend.auth.jwt_handler import (
    extract_bearer_token,
    verify_supabase_token,
    DEMO_USER,
    DEMO_BUSINESS,
)

logger = logging.getLogger("udyam.auth.deps")


def get_optional_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> Optional[Dict[str, Any]]:
    """
    Extract and verify user from Authorization header if present.
    Returns None if no token or invalid, without raising 401.
    """
    token = extract_bearer_token(authorization)
    if not token:
        # If unconfigured, provide demo user in demo mode
        if not is_supabase_configured():
            return DEMO_USER
        return None

    user = verify_supabase_token(token)
    if not user and not is_supabase_configured():
        return DEMO_USER
    return user


def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> Dict[str, Any]:
    """
    FastAPI dependency to enforce authentication.
    If Supabase is configured and token is missing/invalid, raises 401.
    If Supabase is NOT configured, falls back gracefully to DEMO_USER.
    """
    token = extract_bearer_token(authorization)

    if not is_supabase_configured():
        # Offline / Grounded Demo Mode
        return DEMO_USER

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided. Include 'Authorization: Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = verify_supabase_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or revoked authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_business(
    current_user: Dict[str, Any] = Depends(get_current_user),
    x_business_id: Optional[str] = Header(None, alias="X-Business-ID"),
) -> Dict[str, Any]:
    """
    FastAPI dependency to resolve the active tenant business and verified role.
    Resolves business membership via public.business_members in Supabase.
    """
    # In offline / demo mode
    if current_user.get("is_demo") or not is_supabase_configured():
        return DEMO_BUSINESS

    client = get_supabase_optional()
    if not client:
        return DEMO_BUSINESS

    user_id = current_user.get("id")
    try:
        query = (
            client.table("business_members")
            .select("business_id, role, businesses(id, name, owner_name, city, state, business_type)")
            .eq("user_id", user_id)
        )

        if x_business_id:
            query = query.eq("business_id", x_business_id)

        res = query.execute()
        memberships = res.data or []

        if not memberships:
            # Check if user has any businesses created or if we need to auto-link
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have access to any business or the requested business.",
            )

        # Use matched or first business membership
        active = memberships[0]
        business_info = active.get("businesses") or {}

        return {
            "business_id": str(active.get("business_id")),
            "role": active.get("role", "MEMBER"),
            "name": business_info.get("name", "Unknown Business"),
            "owner_name": business_info.get("owner_name", ""),
            "city": business_info.get("city", ""),
            "state": business_info.get("state", ""),
            "business_type": business_info.get("business_type", ""),
            "is_demo": False,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving business membership: {e}")
        # Fall back to demo business if table does not exist yet
        return DEMO_BUSINESS


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Factory dependency to enforce specific RBAC roles (e.g. ['OWNER', 'ADMIN']).
    """
    def role_checker(
        business: Dict[str, Any] = Depends(get_current_business),
    ) -> Dict[str, Any]:
        user_role = business.get("role", "VIEWER")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}. Your role is '{user_role}'.",
            )
        return business

    return role_checker


def require_mfa(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Dependency enforcing that the user has verified a Two-Factor Authentication factor (AAL2).
    """
    if current_user.get("is_demo") or not is_supabase_configured():
        return current_user

    if not current_user.get("mfa_enabled") or current_user.get("aal") != "aal2":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Two-Level Security (MFA) verification required for this operation. Please complete TOTP challenge.",
            headers={"X-MFA-Required": "true"},
        )
    return current_user

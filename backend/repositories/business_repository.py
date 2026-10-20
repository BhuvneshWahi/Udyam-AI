"""
UDYAM AI — Business Repository
Manages business profiles, tenant memberships, and settings via Supabase with offline fallback.
"""

import logging
from typing import Optional, List, Dict, Any
from backend.services.supabase_client import get_supabase_optional, is_supabase_configured
from backend.demo_data import get_initial_demo_data

logger = logging.getLogger("udyam.repo.business")


class BusinessRepository:
    def __init__(self):
        self._fallback_data = get_initial_demo_data()

    def get_business_by_id(self, business_id: str) -> Optional[Dict[str, Any]]:
        client = get_supabase_optional()
        if not client or not is_supabase_configured():
            bp = dict(self._fallback_data["business_profile"])
            bp["id"] = business_id
            return bp

        try:
            res = client.table("businesses").select("*").eq("id", business_id).limit(1).execute()
            if res.data:
                return res.data[0]
            return self._fallback_data["business_profile"]
        except Exception as e:
            logger.warning(f"Error fetching business {business_id} from Supabase: {e}")
            return self._fallback_data["business_profile"]

    def list_user_businesses(self, user_id: str) -> List[Dict[str, Any]]:
        client = get_supabase_optional()
        if not client or not is_supabase_configured():
            return [{
                "business_id": "00000000-0000-0000-0000-000000000001",
                "role": "OWNER",
                "name": self._fallback_data["business_profile"]["name"],
                "owner_name": self._fallback_data["business_profile"]["owner"],
                "city": self._fallback_data["business_profile"]["city"],
                "state": self._fallback_data["business_profile"]["state"],
                "business_type": self._fallback_data["business_profile"]["business_type"],
            }]

        try:
            res = (
                client.table("business_members")
                .select("business_id, role, businesses(id, name, owner_name, city, state, business_type, annual_revenue)")
                .eq("user_id", user_id)
                .execute()
            )
            out = []
            for row in res.data or []:
                b_info = row.get("businesses") or {}
                out.append({
                    "business_id": row.get("business_id"),
                    "role": row.get("role", "MEMBER"),
                    "name": b_info.get("name", "Unknown Business"),
                    "owner_name": b_info.get("owner_name", ""),
                    "city": b_info.get("city", ""),
                    "state": b_info.get("state", ""),
                    "business_type": b_info.get("business_type", ""),
                    "annual_revenue": b_info.get("annual_revenue", 0),
                })
            return out
        except Exception as e:
            logger.warning(f"Error listing businesses for user {user_id}: {e}")
            return [{
                "business_id": "00000000-0000-0000-0000-000000000001",
                "role": "OWNER",
                "name": self._fallback_data["business_profile"]["name"],
                "owner_name": self._fallback_data["business_profile"]["owner"],
                "city": self._fallback_data["business_profile"]["city"],
                "state": self._fallback_data["business_profile"]["state"],
                "business_type": self._fallback_data["business_profile"]["business_type"],
            }]

    def create_business(self, user_id: str, business_data: Dict[str, Any]) -> Dict[str, Any]:
        client = get_supabase_optional()
        if not client or not is_supabase_configured():
            return {
                "id": "00000000-0000-0000-0000-000000000001",
                **business_data,
                "role": "OWNER",
            }

        try:
            # 1. Insert business
            b_res = client.table("businesses").insert({
                "name": business_data.get("name"),
                "owner_name": business_data.get("owner_name") or business_data.get("owner", "Owner"),
                "business_type": business_data.get("business_type", "Micro Enterprise"),
                "gstin": business_data.get("gstin"),
                "state": business_data.get("state", "Delhi"),
                "city": business_data.get("city", "Delhi"),
                "annual_revenue": business_data.get("annual_revenue", 0),
                "sector": business_data.get("sector", "Retail"),
            }).execute()

            new_business = b_res.data[0]
            business_id = new_business["id"]

            # 2. Add creator as OWNER in business_members
            client.table("business_members").insert({
                "business_id": business_id,
                "user_id": user_id,
                "role": "OWNER",
            }).execute()

            new_business["role"] = "OWNER"
            return new_business
        except Exception as e:
            logger.error(f"Failed to create business in Supabase: {e}")
            raise

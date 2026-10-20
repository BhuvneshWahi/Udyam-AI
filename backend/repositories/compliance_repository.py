"""
UDYAM AI — Compliance Repository
Manages GST, GSTR-1, GSTR-3B filings, and tax calendar entries via Supabase with offline fallback.
"""

import logging
from typing import Optional, List, Dict, Any
from backend.services.supabase_client import get_supabase_optional, is_supabase_configured
from backend.demo_data import get_initial_demo_data

logger = logging.getLogger("udyam.repo.compliance")


class ComplianceRepository:
    def __init__(self):
        self._fallback_data = get_initial_demo_data()

    def get_filings(self, business_id: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_optional()
        if not client or not is_supabase_configured() or not business_id or business_id.startswith("00000000"):
            return self._fallback_data["compliance"]["filings"]

        try:
            res = client.table("compliance_filings").select("*").eq("business_id", business_id).order("due_date").execute()
            rows = res.data or []
            if not rows:
                return self._fallback_data["compliance"]["filings"]

            return [
                {
                    "form": r.get("form_name"),
                    "period": r.get("period"),
                    "due_date": str(r.get("due_date")),
                    "status": r.get("status", "Pending"),
                    "tax_amount": float(r.get("tax_amount", 0)),
                }
                for r in rows
            ]
        except Exception as e:
            logger.warning(f"Error fetching compliance filings for {business_id}: {e}")
            return self._fallback_data["compliance"]["filings"]

    def update_filing_status(self, business_id: str, form_name: str, period: str, status: str) -> bool:
        client = get_supabase_optional()
        if not client or not is_supabase_configured() or business_id.startswith("00000000"):
            # Update demo in-memory
            for f in self._fallback_data["compliance"]["filings"]:
                if f["form"] == form_name and f["period"] == period:
                    f["status"] = status
                    return True
            return False

        try:
            client.table("compliance_filings").update({"status": status}).eq("business_id", business_id).eq("form_name", form_name).eq("period", period).execute()
            return True
        except Exception as e:
            logger.error(f"Error updating compliance filing status: {e}")
            return False

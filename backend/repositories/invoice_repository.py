"""
UDYAM AI — Invoice Repository
Manages e-invoices, ITC tax credits, and reconciliation records via Supabase with offline fallback.
"""

import logging
from typing import Optional, List, Dict, Any
from datetime import date
from backend.services.supabase_client import get_supabase_optional, is_supabase_configured

logger = logging.getLogger("udyam.repo.invoice")

# The verified demo package intentionally ships no invoice/customer ledger.
# Return no records in offline mode rather than inventing client names, GSTINs,
# discrepancies or reconciliation outcomes.
FALLBACK_INVOICES: List[Dict[str, Any]] = []


class InvoiceRepository:
    def get_invoices(self, business_id: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_optional()
        if not client or not is_supabase_configured() or not business_id or business_id.startswith("00000000"):
            return FALLBACK_INVOICES

        try:
            res = client.table("invoices").select("*").eq("business_id", business_id).order("invoice_date", desc=True).execute()
            rows = res.data or []
            if not rows:
                return FALLBACK_INVOICES

            return [
                {
                    "id": str(r.get("id")),
                    "invoice_no": r.get("invoice_no"),
                    "client_name": r.get("client_name"),
                    "invoice_date": str(r.get("invoice_date")),
                    "due_date": str(r.get("due_date")) if r.get("due_date") else None,
                    "amount": float(r.get("amount", 0)),
                    "itc_amount": float(r.get("itc_amount", 0)),
                    "status": r.get("status", "Pending"),
                    "discrepancy_note": r.get("discrepancy_note"),
                }
                for r in rows
            ]
        except Exception as e:
            logger.warning(f"Error fetching invoices for {business_id}: {e}")
            return FALLBACK_INVOICES

    def create_invoice(self, business_id: str, inv: Dict[str, Any]) -> Dict[str, Any]:
        client = get_supabase_optional()
        record = {
            "business_id": business_id,
            "invoice_no": inv.get("invoice_no") or f"INV-{abs(hash(str(inv))) % 100000:05d}",
            "client_name": inv.get("client_name", "Valued Client"),
            "invoice_date": inv.get("invoice_date") or str(date.today()),
            "due_date": inv.get("due_date"),
            "amount": float(inv.get("amount", 0)),
            "itc_amount": float(inv.get("itc_amount", 0)),
            "status": inv.get("status", "Pending"),
            "discrepancy_note": inv.get("discrepancy_note"),
        }

        if not client or not is_supabase_configured() or business_id.startswith("00000000"):
            return {**record, "id": "INV-LOCAL-001"}

        try:
            res = client.table("invoices").insert(record).execute()
            if res.data:
                return res.data[0]
            return record
        except Exception as e:
            logger.error(f"Error inserting invoice into Supabase: {e}")
            return record

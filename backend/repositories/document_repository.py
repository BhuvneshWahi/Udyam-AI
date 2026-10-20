"""
UDYAM AI — Document Repository
Manages uploaded commercial datasets, parsed agreements, and audit history via Supabase with offline fallback.
"""

import logging
from typing import Optional, List, Dict, Any
from backend.services.supabase_client import get_supabase_optional, is_supabase_configured

logger = logging.getLogger("udyam.repo.document")

FALLBACK_DOCUMENTS = [
    {
        "id": "DOC-001",
        "filename": "Apex_Auto_B2B_Supply_Agreement.pdf",
        "file_type": "agreement",
        "storage_path": "agreements/Apex_Auto_B2B_Supply_Agreement.pdf",
        "records_count": 1,
        "status": "Processed",
        "created_at": "2026-09-24T12:00:00Z",
    },
    {
        "id": "DOC-002",
        "filename": "monthly_sales_batch_aug2026.csv",
        "file_type": "sales",
        "storage_path": "uploads/monthly_sales_batch_aug2026.csv",
        "records_count": 1420,
        "status": "Processed",
        "created_at": "2026-09-25T08:30:00Z",
    }
]


class DocumentRepository:
    def get_documents(self, business_id: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_optional()
        if not client or not is_supabase_configured() or not business_id or business_id.startswith("00000000"):
            return FALLBACK_DOCUMENTS

        try:
            res = client.table("documents").select("*").eq("business_id", business_id).order("created_at", desc=True).execute()
            rows = res.data or []
            if not rows:
                return FALLBACK_DOCUMENTS

            return [
                {
                    "id": str(r.get("id")),
                    "filename": r.get("filename"),
                    "file_type": r.get("file_type", "sales"),
                    "storage_path": r.get("storage_path"),
                    "records_count": r.get("records_count", 0),
                    "status": r.get("status", "Processed"),
                    "analysis_summary": r.get("analysis_summary"),
                    "created_at": str(r.get("created_at")),
                }
                for r in rows
            ]
        except Exception as e:
            logger.warning(f"Error fetching documents for {business_id}: {e}")
            return FALLBACK_DOCUMENTS

    def record_document(self, business_id: str, doc: Dict[str, Any]) -> Dict[str, Any]:
        client = get_supabase_optional()
        record = {
            "business_id": business_id,
            "filename": doc.get("filename", "unknown_file"),
            "file_type": doc.get("file_type", "sales"),
            "storage_path": doc.get("storage_path", f"uploads/{doc.get('filename')}"),
            "records_count": int(doc.get("records_count", 0)),
            "status": doc.get("status", "Processed"),
            "analysis_summary": doc.get("analysis_summary"),
        }

        if not client or not is_supabase_configured() or business_id.startswith("00000000"):
            return {**record, "id": f"DOC-LOCAL-{abs(hash(str(doc))) % 1000:03d}"}

        try:
            res = client.table("documents").insert(record).execute()
            if res.data:
                return res.data[0]
            return record
        except Exception as e:
            logger.error(f"Error recording document in Supabase: {e}")
            return record

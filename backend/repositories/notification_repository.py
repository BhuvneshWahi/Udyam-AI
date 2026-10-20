"""
UDYAM AI — Notification Repository
Manages system, inventory, compliance, and copilot alerts via Supabase with offline fallback.
"""

import logging
from typing import Optional, List, Dict, Any
from pathlib import Path
import csv
from backend.services.supabase_client import get_supabase_optional, is_supabase_configured

logger = logging.getLogger("udyam.repo.notification")

def _load_fallback_notifications() -> List[Dict[str, Any]]:
    """Load the canonical seeded notifications for offline/demo API responses."""
    data_file = Path(__file__).resolve().parents[1] / "verified_data" / "notifications.csv"
    if not data_file.exists():
        logger.warning("Verified notification feed not found: %s", data_file)
        return []

    category_map = {
        "news": "Market",
        "procurement": "Procurement",
        "compliance_due": "Compliance",
        "festival": "Market",
    }
    severity_map = {"HIGH": "CRITICAL", "MEDIUM": "WARNING", "LOW": "INFO"}
    action_map = {
        "news": "/market-intelligence",
        "procurement": "/procurement-reconciliation?tab=purchase-orders",
        "compliance_due": "/compliance?tab=gst",
        "festival": "/market-intelligence?tab=festivals",
    }

    notifications: List[Dict[str, Any]] = []
    with data_file.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            notification_type = str(row.get("type", "system")).lower()
            priority = str(row.get("priority", "LOW")).upper()
            notifications.append({
                "id": str(row.get("id", "")),
                "title": row.get("title", "Business alert"),
                "message": row.get("body", ""),
                "category": category_map.get(notification_type, "System"),
                "severity": severity_map.get(priority, "INFO"),
                "action_url": action_map.get(notification_type, "/notifications"),
                "is_read": str(row.get("is_read", "false")).strip().lower() == "true",
                "created_at": str(row.get("created_at", "")),
            })
    return notifications


FALLBACK_NOTIFICATIONS = _load_fallback_notifications()


class NotificationRepository:
    def get_notifications(self, business_id: Optional[str] = None) -> List[Dict[str, Any]]:
        client = get_supabase_optional()
        if not client or not is_supabase_configured() or not business_id or business_id.startswith("00000000"):
            return FALLBACK_NOTIFICATIONS

        try:
            res = client.table("notifications").select("*").eq("business_id", business_id).order("created_at", desc=True).limit(50).execute()
            rows = res.data or []
            if not rows:
                return FALLBACK_NOTIFICATIONS

            return [
                {
                    "id": str(r.get("id")),
                    "title": r.get("title"),
                    "message": r.get("message"),
                    "category": r.get("category", "System"),
                    "severity": r.get("severity", "info"),
                    "action_url": r.get("action_url"),
                    "is_read": bool(r.get("is_read", False)),
                    "created_at": str(r.get("created_at")),
                }
                for r in rows
            ]
        except Exception as e:
            logger.warning(f"Error fetching notifications for {business_id}: {e}")
            return FALLBACK_NOTIFICATIONS

    def create_notification(self, business_id: str, notif: Dict[str, Any]) -> Dict[str, Any]:
        client = get_supabase_optional()
        record = {
            "business_id": business_id,
            "title": notif.get("title", "Alert"),
            "message": notif.get("message", ""),
            "category": notif.get("category", "System"),
            "severity": notif.get("severity", "info"),
            "action_url": notif.get("action_url"),
            "is_read": False,
        }

        if not client or not is_supabase_configured() or business_id.startswith("00000000"):
            return {**record, "id": f"NOTIF-LOCAL-{abs(hash(str(notif))) % 10000:04d}"}

        try:
            res = client.table("notifications").insert(record).execute()
            if res.data:
                return res.data[0]
            return record
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return record

    def mark_as_read(self, business_id: str, notif_id: str) -> bool:
        client = get_supabase_optional()
        if not client or not is_supabase_configured() or business_id.startswith("00000000"):
            for n in FALLBACK_NOTIFICATIONS:
                if n["id"] == notif_id:
                    n["is_read"] = True
                    return True
            return True

        try:
            client.table("notifications").update({"is_read": True}).eq("business_id", business_id).eq("id", notif_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False

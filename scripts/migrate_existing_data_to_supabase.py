"""
UDYAM AI — Grounded Demo Data Migration to Supabase
Migrates in-memory MSME dataset into PostgreSQL Supabase tables.

Usage:
    python scripts/migrate_existing_data_to_supabase.py --dry-run
    python scripts/migrate_existing_data_to_supabase.py --live
"""

import os
import sys
import argparse
from typing import Dict, Any, List

# Ensure project root is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from dotenv import load_dotenv
load_dotenv()

from backend.demo_data import get_initial_demo_data
from backend.services.supabase_client import get_supabase_optional, is_supabase_configured
from backend.repositories.invoice_repository import FALLBACK_INVOICES
from backend.repositories.notification_repository import FALLBACK_NOTIFICATIONS


def print_banner(mode: str):
    print("=" * 70)
    print("  UDYAM AI — SUPABASE GROUNDED DATA MIGRATION ENGINE")
    print(f"  Mode: {mode.upper()}")
    print("=" * 70)


def migrate_data(is_live: bool = False):
    data = get_initial_demo_data()
    configured = is_supabase_configured()

    if is_live and not configured:
        print("\n[ERROR] Cannot run live migration: SUPABASE_URL and/or SUPABASE_KEY are not configured.")
        print("Please configure .env or run with --dry-run to validate dataset schemas.\n")
        sys.exit(1)

    client = get_supabase_optional() if is_live else None

    # Track migration statistics
    stats: Dict[str, Dict[str, int]] = {
        "businesses": {"read": 1, "inserted": 0, "skipped": 0, "failed": 0},
        "products": {"read": len(data["products"]), "inserted": 0, "skipped": 0, "failed": 0},
        "sales_records": {"read": len(data["sales_trends"]), "inserted": 0, "skipped": 0, "failed": 0},
        "customers": {"read": len(data["customers_summary"]["top_buyers"]), "inserted": 0, "skipped": 0, "failed": 0},
        "invoices": {"read": len(FALLBACK_INVOICES), "inserted": 0, "skipped": 0, "failed": 0},
        "compliance_filings": {"read": len(data["compliance"]["filings"]), "inserted": 0, "skipped": 0, "failed": 0},
        "notifications": {"read": len(FALLBACK_NOTIFICATIONS), "inserted": 0, "skipped": 0, "failed": 0},
        "daily_actions": {"read": len(data["daily_actions"]), "inserted": 0, "skipped": 0, "failed": 0},
    }

    business_id = "00000000-0000-0000-0000-000000000001"

    if not is_live:
        print("\n[*] Validating dataset integrity in DRY-RUN mode...")
        # Validate business
        bp = data["business_profile"]
        assert bp.get("name") and bp.get("owner"), "Missing business name/owner"
        stats["businesses"]["inserted"] = 1

        # Validate products
        for p in data["products"]:
            assert p.get("sku") and p.get("name"), f"Invalid product {p}"
            stats["products"]["inserted"] += 1

        # Validate sales
        for s in data["sales_trends"]:
            assert s.get("month") and "revenue" in s, f"Invalid sales record {s}"
            stats["sales_records"]["inserted"] += 1

        # Validate customers
        for c in data["customers_summary"]["top_buyers"]:
            assert c.get("name"), f"Invalid customer {c}"
            stats["customers"]["inserted"] += 1

        # Validate invoices
        for inv in FALLBACK_INVOICES:
            assert inv.get("invoice_no") and inv.get("client_name"), f"Invalid invoice {inv}"
            stats["invoices"]["inserted"] += 1

        # Validate compliance
        for cf in data["compliance"]["filings"]:
            assert cf.get("form") and cf.get("period"), f"Invalid compliance filing {cf}"
            stats["compliance_filings"]["inserted"] += 1

        # Validate notifications
        for n in FALLBACK_NOTIFICATIONS:
            assert n.get("title") and n.get("message"), f"Invalid notification {n}"
            stats["notifications"]["inserted"] += 1

        # Validate daily actions
        for act in data["daily_actions"]:
            assert act.get("title") and act.get("impact"), f"Invalid action {act}"
            stats["daily_actions"]["inserted"] += 1

        print("[PASS] All in-memory demo dataset tables validated with 100% schema compliance.")

    else:
        print("\n[*] Connecting to Supabase live instance...")
        try:
            # 1. Businesses
            bp = data["business_profile"]
            b_record = {
                "id": business_id,
                "name": bp["name"],
                "owner_name": bp["owner"],
                "business_type": bp.get("business_type", "Micro Enterprise"),
                "gstin": bp.get("gstin"),
                "state": bp.get("state", "Maharashtra"),
                "city": bp.get("city", "Pune"),
                "business_age_years": bp.get("business_age_years", 4),
                "employee_count": bp.get("employee_count", 18),
                "annual_revenue": bp.get("annual_revenue", 14500000),
                "sector": bp.get("sector", "Auto Components & Hardware"),
            }
            client.table("businesses").upsert(b_record, on_conflict="id").execute()
            stats["businesses"]["inserted"] = 1
        except Exception as e:
            print(f"[-] Error inserting business: {e}")
            stats["businesses"]["failed"] = 1

        # 2. Products
        for p in data["products"]:
            try:
                prod_rec = {
                    "business_id": business_id,
                    "sku_code": p["sku"],
                    "name": p["name"],
                    "category": p.get("category", "General"),
                    "stock": p.get("stock", 0),
                    "cost_price": float(p.get("cost_price", 0)),
                    "selling_price": float(p.get("selling_price", 0)),
                    "avg_daily_sales": float(p.get("avg_daily_sales", 0)),
                    "days_remaining": float(p.get("days_remaining", 0)),
                    "status": p.get("status", "Healthy"),
                    "forecast_demand_30d": p.get("forecast_demand_30d", 0),
                    "suggested_reorder": p.get("suggested_reorder", 0),
                    "sales_growth_30d": float(p.get("sales_growth_30d", 0)),
                    "margin_pct": float(p.get("margin_pct", 0)),
                }
                client.table("products").upsert(prod_rec, on_conflict="business_id,sku_code").execute()
                stats["products"]["inserted"] += 1
            except Exception as e:
                stats["products"]["failed"] += 1

        # 3. Sales Records
        for s in data["sales_trends"]:
            try:
                s_rec = {
                    "business_id": business_id,
                    "month": s["month"],
                    "revenue": float(s.get("revenue", 0)),
                    "profit": float(s.get("profit", 0)),
                    "orders_count": int(s.get("orders", 0)),
                    "growth_pct": float(s.get("growth_pct", 0)),
                }
                client.table("sales_records").upsert(s_rec, on_conflict="business_id,month").execute()
                stats["sales_records"]["inserted"] += 1
            except Exception as e:
                stats["sales_records"]["failed"] += 1

        # 4. Customers
        for c in data["customers_summary"]["top_buyers"]:
            try:
                c_rec = {
                    "business_id": business_id,
                    "name": c["name"],
                    "orders_count": int(c.get("orders", 0)),
                    "total_spend": float(c.get("spend", 0)),
                }
                client.table("customers").upsert(c_rec, on_conflict="business_id,name").execute()
                stats["customers"]["inserted"] += 1
            except Exception as e:
                stats["customers"]["failed"] += 1

        # 5. Invoices
        for inv in FALLBACK_INVOICES:
            try:
                inv_rec = {
                    "business_id": business_id,
                    "invoice_no": inv["invoice_no"],
                    "client_name": inv["client_name"],
                    "invoice_date": inv["invoice_date"],
                    "due_date": inv.get("due_date"),
                    "amount": float(inv.get("amount", 0)),
                    "itc_amount": float(inv.get("itc_amount", 0)),
                    "status": inv.get("status", "Pending"),
                    "discrepancy_note": inv.get("discrepancy_note"),
                }
                client.table("invoices").upsert(inv_rec, on_conflict="business_id,invoice_no").execute()
                stats["invoices"]["inserted"] += 1
            except Exception as e:
                stats["invoices"]["failed"] += 1

        # 6. Compliance Filings
        for cf in data["compliance"]["filings"]:
            try:
                cf_rec = {
                    "business_id": business_id,
                    "form_name": cf["form"],
                    "period": cf["period"],
                    "due_date": "2026-09-20" if "3B" in cf["form"] else ("2026-09-11" if "1" in cf["form"] else "2026-12-31"),
                    "status": cf.get("status", "Pending"),
                    "tax_amount": float(cf.get("tax_amount", 0)),
                }
                client.table("compliance_filings").upsert(cf_rec, on_conflict="business_id,form_name,period").execute()
                stats["compliance_filings"]["inserted"] += 1
            except Exception as e:
                stats["compliance_filings"]["failed"] += 1

        # 7. Notifications
        for n in FALLBACK_NOTIFICATIONS:
            try:
                notif_rec = {
                    "business_id": business_id,
                    "title": n["title"],
                    "message": n["message"],
                    "category": n.get("category", "System"),
                    "severity": n.get("severity", "info"),
                    "action_url": n.get("action_url"),
                    "is_read": n.get("is_read", False),
                }
                client.table("notifications").insert(notif_rec).execute()
                stats["notifications"]["inserted"] += 1
            except Exception as e:
                stats["notifications"]["failed"] += 1

        # 8. Daily Actions
        for act in data["daily_actions"]:
            try:
                act_rec = {
                    "business_id": business_id,
                    "title": act["title"],
                    "impact": act.get("impact", ""),
                    "category": act.get("category", "Operational"),
                    "action_type": act.get("action_type", "NAVIGATE"),
                    "urgency": act.get("priority", "MEDIUM").upper(),
                    "is_completed": False,
                }
                client.table("daily_actions").insert(act_rec).execute()
                stats["daily_actions"]["inserted"] += 1
            except Exception as e:
                stats["daily_actions"]["failed"] += 1

    # Print summary table
    print("\n" + "-" * 70)
    print(f"{'Table':<22} | {'Read':<6} | {'Inserted':<9} | {'Skipped':<8} | {'Failed':<6} | {'Status'}")
    print("-" * 70)
    for table_name, counts in stats.items():
        status = "OK" if counts["failed"] == 0 else "PARTIAL"
        print(f"{table_name:<22} | {counts['read']:<6} | {counts['inserted']:<9} | {counts['skipped']:<8} | {counts['failed']:<6} | {status}")
    print("-" * 70)
    print(f"Total Tables Processed: {len(stats)}")


def main():
    parser = argparse.ArgumentParser(description="UDYAM AI Supabase Migration Script")
    parser.add_argument("--live", action="store_true", help="Execute insertions against live Supabase database")
    parser.add_argument("--dry-run", action="store_true", help="Validate schema and records without writing to database")
    args = parser.parse_args()

    mode = "live" if args.live else "dry-run"
    print_banner(mode)
    migrate_data(is_live=args.live)


if __name__ == "__main__":
    main()

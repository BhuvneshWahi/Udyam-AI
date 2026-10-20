from __future__ import annotations
from pathlib import Path
import pandas as pd

DEMO_DATE = pd.Timestamp("2026-09-26")
DATA = Path(__file__).resolve().parents[1] / "verified_data" / "compliance_tasks.csv"

def get_compliance_status(dataset=None):
    df = pd.read_csv(DATA)
    df["due_date"] = pd.to_datetime(df["due_date"])
    tasks=[]
    for _, r in df.iterrows():
        days=int((r["due_date"]-DEMO_DATE).days)
        tasks.append({
            "id": r["id"], "task_name": r["type"], "authority": "Connected compliance record",
            "period": "Demo task", "due_date": r["due_date"].strftime("%Y-%m-%d"),
            "status": str(r["status"]).upper(), "days_left": max(days,0), "estimated_amount": 0,
            "reminder_schedule": [30,15,7,3,1]
        })
    gst = next((t for t in tasks if t["task_name"]=="GSTR-3B"), tasks[0])
    return {
        "tasks": tasks,
        "gstin_status": "Demo profile",
        "udyam_status": "Demo profile",
        "tax_readiness_score": 0,
        "alerts": [f"Seeded demo timeline (reference date: {DEMO_DATE.strftime('%d %B %Y')}): GSTR-3B task due on 01 October 2026 ({gst['days_left']} demo-relative days remaining). This is not a live GST portal status."],
    }

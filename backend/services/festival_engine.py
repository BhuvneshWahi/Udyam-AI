from __future__ import annotations
from pathlib import Path
import pandas as pd
DEMO_DATE=pd.Timestamp("2026-09-26")
DATA=Path(__file__).resolve().parents[1] / "verified_data" / "events.csv"

def get_upcoming_festival_intelligence(dataset=None):
    df=pd.read_csv(DATA); df["date"]=pd.to_datetime(df["date"]); df["days_remaining"]=(df["date"]-DEMO_DATE).dt.days
    df=df[df["days_remaining"]>=0].copy()
    return [{"id":r["id"],"name":r["name"],"date":r["date"].strftime("%Y-%m-%d"),"days_remaining":int(r["days_remaining"]),"region":"Delhi / National","business_categories":["Grocery","Retail","Festive"],"historical_demand_lift_pct":float(r["multiplier"])*100,"lead_time_required_days":15,"trigger_schedule":[30,21,14,7,3],"recommendation":f"{r['name']} is approaching; treat the event as a planning signal rather than a certainty."} for _,r in df.iterrows()]

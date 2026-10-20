from __future__ import annotations
from pathlib import Path
import pandas as pd
DATA = Path(__file__).resolve().parents[1] / "verified_data" / "market_signals.csv"

def get_market_signals(dataset=None):
    df=pd.read_csv(DATA)
    return df.to_dict(orient="records")

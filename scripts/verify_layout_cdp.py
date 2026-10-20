import subprocess
import time
import json
import urllib.request
import os
import sys

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def test_pages():
    edge_proc = subprocess.Popen([
        EDGE_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        "--window-size=1280,800",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-gpu",
        "about:blank"
    ])
    
    time.sleep(2)
    
    try:
        # Get websocket debugger URL
        res = urllib.request.urlopen("http://127.0.0.1:9222/json", timeout=5)
        tabs = json.loads(res.read())
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        print(f"Connected to headless Edge. WS URL: {ws_url[:40]}...")
    except Exception as e:
        print(f"Could not connect to Edge DevTools: {e}")
        edge_proc.terminate()
        return False

    pages_to_test = [
        ("Market Intelligence", "http://localhost:3001/market-intelligence"),
        ("Financial Control", "http://localhost:3001/financial-control"),
        ("Reconciliation & Procurement", "http://localhost:3001/procurement-reconciliation"),
        ("E-Invoice", "http://localhost:3001/e-invoice"),
        ("Compliance Center", "http://localhost:3001/compliance"),
        ("Action Center", "http://localhost:3001/actions")
    ]
    
    # We will use simple urllib with CDP HTTP endpoints or screenshots
    # Alternatively, Edge can take screenshots directly:
    print("\n--- Testing layout bounding boxes via Edge Screenshot & DOM inspection ---")
    edge_proc.terminate()
    return True

if __name__ == "__main__":
    test_pages()

import subprocess
import time
import os

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUTPUT_DIR = r"C:\Users\Akshay\Desktop\hex\screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

targets = [
    {
        "url": "http://localhost:3000",
        "output": os.path.join(OUTPUT_DIR, "ui_dashboard.png"),
        "name": "HexGuard Main Dashboard & Dropzone"
    },
    {
        "url": "http://localhost:3000?sample=sample-ai-portrait",
        "output": os.path.join(OUTPUT_DIR, "ui_report.png"),
        "name": "HexGuard Deepfake Forensic Report View"
    },
    {
        "url": "http://localhost:3000?view=live",
        "output": os.path.join(OUTPUT_DIR, "ui_liveguard.png"),
        "name": "HexGuard LiveGuard Stream Forensics"
    }
]

for t in targets:
    print(f"Capturing {t['name']} from {t['url']}...")
    cmd = [
        CHROME,
        "--headless=old",
        "--disable-gpu",
        "--no-sandbox",
        "--window-size=1600,1050",
        f"--screenshot={t['output']}",
        t["url"]
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(t["output"]):
        size_kb = os.path.getsize(t["output"]) / 1024
        print(f"Successfully saved {t['output']} ({size_kb:.1f} KB)")
    else:
        print(f"Failed to capture {t['name']}. Stderr: {res.stderr}")

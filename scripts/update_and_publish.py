from dotenv import load_dotenv
load_dotenv()

import os
import json
import requests
from pathlib import Path
from datetime import date

REPO_ROOT = Path(__file__).resolve().parents[1]
PAYLOAD_PATH = REPO_ROOT / "data" / "processed" / "risk_payload.json"

VERCEL_PUBLISH_URL = os.environ["VERCEL_PUBLISH_URL"]
PUBLISH_TOKEN = os.environ["PUBLISH_TOKEN"]

def main():
    if not PAYLOAD_PATH.exists():
        raise FileNotFoundError(f"Missing payload file: {PAYLOAD_PATH}")

    payload = json.loads(PAYLOAD_PATH.read_text(encoding="utf-8"))
    payload.setdefault("asOf", date.today().isoformat())

    r = requests.post(
        VERCEL_PUBLISH_URL,
        headers={"x-publish-token": PUBLISH_TOKEN},
        json=payload,
        timeout=60,
    )
    print("Status:", r.status_code)
    print(r.text)
    r.raise_for_status()

if __name__ == "__main__":
    main()

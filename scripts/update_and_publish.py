import os
import json
import requests
from pathlib import Path
from datetime import date

PAYLOAD_PATH = Path("data/processed/risk_payload.json")

VERCEL_PUBLISH_URL = os.environ["VERCEL_PUBLISH_URL"]  # e.g. https://yourapp.vercel.app/api/publish
PUBLISH_TOKEN = os.environ["PUBLISH_TOKEN"]

def main():
    payload = json.loads(PAYLOAD_PATH.read_text())
    if "asOf" not in payload:
        payload["asOf"] = date.today().isoformat()

    r = requests.post(
        VERCEL_PUBLISH_URL,
        headers={"x-publish-token": PUBLISH_TOKEN},
        json=payload,
        timeout=60,
    )
    r.raise_for_status()
    print(r.json())

if __name__ == "__main__":
    main()

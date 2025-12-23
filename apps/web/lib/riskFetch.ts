export async function fetchManifest() {
  const url = process.env.NEXT_PUBLIC_RISK_MANIFEST_URL;
  if (!url) throw new Error("Missing manifest URL");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Manifest fetch failed");
  return res.json();
}

export async function fetchLatestRisk() {
  const manifest = await fetchManifest();
  const res = await fetch(manifest.latestUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("Risk fetch failed");
  return res.json();
}

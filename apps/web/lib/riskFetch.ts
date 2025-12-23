export async function fetchManifest() {
  const url = process.env.NEXT_PUBLIC_RISK_MANIFEST_URL;

  // Don’t throw during build, allow deploy to succeed.
  if (!url) return null;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchLatestRisk() {
  const manifest = await fetchManifest();
  if (!manifest?.latestUrl) return null;

  const res = await fetch(manifest.latestUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Risk fetch failed: ${res.status}`);
  return res.json();
}

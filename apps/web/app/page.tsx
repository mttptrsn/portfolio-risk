import { loadRiskOrNull } from "@/lib/loadRisk";

export default async function Page() {
  const data = await loadRiskOrNull();

  if (!data) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Portfolio Risk</h1>
        <p>No published payload found. Check NEXT_PUBLIC_RISK_MANIFEST_URL and publishing.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Portfolio Risk</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify({ asOf: data.asOf, n: data.universe?.length }, null, 2)}
      </pre>
    </main>
  );
}

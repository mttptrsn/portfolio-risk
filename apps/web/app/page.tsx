import { fetchLatestRisk } from "../lib/riskFetch";

export default async function Page() {
  const data = await fetchLatestRisk();

  return (
    <main style={{ padding: 24 }}>
      <h1>Portfolio Risk</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify({ asOf: data.asOf, keys: Object.keys(data) }, null, 2)}
      </pre>
    </main>
  );
}

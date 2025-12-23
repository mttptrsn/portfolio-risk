import { fetchLatestRisk } from "@/lib/riskFetch";

export default async function Page() {
  const data = await fetchLatestRisk();

  if (!data) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Portfolio Risk</h1>
        <p>Not configured yet.</p>
        <ol>
          <li>Deploy the app.</li>
          <li>POST a payload to <code>/api/publish</code> to create the manifest.</li>
          <li>Set <code>NEXT_PUBLIC_RISK_MANIFEST_URL</code> in Vercel env vars.</li>
          <li>Redeploy.</li>
        </ol>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Portfolio Risk</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify({ asOf: data.asOf, keys: Object.keys(data) }, null, 2)}
      </pre>
    </main>
  );
}

import Dashboard from "./Dashboard";
import { fetchLatestRisk } from "../lib/riskFetch";

export default async function Page() {
  const data = await fetchLatestRisk();

  if (!data) {
    return (
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700 }}>Portfolio Risk</h1>
        <p style={{ color: "rgba(255,255,255,0.70)", marginTop: 10 }}>
          No payload found. Check NEXT_PUBLIC_RISK_MANIFEST_URL, then publish again.
        </p>
      </main>
    );
  }

  return <Dashboard data={data} />;
}

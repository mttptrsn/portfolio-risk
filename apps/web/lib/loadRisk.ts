import { fetchLatestRisk } from "@/lib/riskFetch";

export async function loadRiskOrNull() {
  try {
    return await fetchLatestRisk();
  } catch (e) {
    // Don’t crash the whole page, return null for a friendly empty state.
    return null;
  }
}

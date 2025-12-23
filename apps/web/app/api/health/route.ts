import { fetchLatestRisk } from "@/lib/riskFetch";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await fetchLatestRisk();
  return NextResponse.json({
    ok: Boolean(data),
    asOf: data?.asOf ?? null,
    universe: data?.universe?.length ?? null,
  });
}

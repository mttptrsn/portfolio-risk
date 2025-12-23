import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function unauthorized() {
  return new NextResponse("Unauthorized", { status: 401 });
}

export async function POST(req: Request) {
  const token = req.headers.get("x-publish-token");
  if (!token || token !== process.env.PUBLISH_TOKEN) return unauthorized();

  const body = await req.json();
  const asOf = body?.asOf ?? new Date().toISOString().slice(0, 10);

  // 1) Stable pointer: always overwrite
  const latest = await put("risk/latest.json", JSON.stringify(body), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  // 2) Versioned history: never overwrite
  // If you might publish multiple times per day, you need a unique key.
  // Option A: use asOf if you guarantee 1 publish/day.
  // Option B (safer): include a timestamp suffix.
  const ts = new Date().toISOString().replace(/[:.]/g, "-"); // filesystem-friendly
  const historyKey = `risk/history/${asOf}/${ts}.json`;

  const dated = await put(historyKey, JSON.stringify(body), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    // no allowOverwrite here
  });

  // 3) Manifest: always overwrite
  const manifest = {
    asOf,
    latestUrl: latest.url,
    lastHistoryUrl: dated.url,
    updatedAt: new Date().toISOString(),
  };

  const man = await put("risk/manifest.json", JSON.stringify(manifest), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return NextResponse.json({
    ok: true,
    manifestUrl: man.url,
    latestUrl: latest.url,
    lastHistoryUrl: dated.url,
  });
}

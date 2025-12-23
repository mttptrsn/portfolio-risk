import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function unauthorized() {
  return new NextResponse("Unauthorized", { status: 401 });
}

export async function POST(req: Request) {
  const token = req.headers.get("x-publish-token");
  if (token !== process.env.PUBLISH_TOKEN) return unauthorized();

  const body = await req.json();
  const asOf = body?.asOf ?? new Date().toISOString().slice(0, 10);

  const latest = await put(
    "risk/latest.json",
    JSON.stringify(body),
    { access: "public", contentType: "application/json", addRandomSuffix: false }
  );

  const dated = await put(
    `risk/history/${asOf}.json`,
    JSON.stringify(body),
    { access: "public", contentType: "application/json", addRandomSuffix: false }
  );

  const manifest = {
    asOf,
    latestUrl: latest.url,
    updatedAt: new Date().toISOString(),
  };

  const man = await put(
    "risk/manifest.json",
    JSON.stringify(manifest),
    { access: "public", contentType: "application/json", addRandomSuffix: false }
  );

  return NextResponse.json({
    ok: true,
    manifestUrl: man.url,
  });
}

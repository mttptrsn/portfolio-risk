import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const payload = { ok: true, ts: new Date().toISOString() };

  const blob = await put("risk/_blob_test.json", JSON.stringify(payload), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return NextResponse.json({ url: blob.url });
}

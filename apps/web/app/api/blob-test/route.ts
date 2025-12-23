import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

    if (!hasToken) {
      return NextResponse.json(
        { ok: false, error: "Missing BLOB_READ_WRITE_TOKEN in this environment" },
        { status: 500 }
      );
    }

    const payload = { ok: true, ts: new Date().toISOString() };

    const blob = await put("risk/_blob_test.json", JSON.stringify(payload), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

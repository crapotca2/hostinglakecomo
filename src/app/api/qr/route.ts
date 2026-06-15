import { NextResponse } from "next/server";
import { qrPng, qrSvg } from "@/lib/qr/generate";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const data = url.searchParams.get("data");
  if (!data) {
    return NextResponse.json({ error: "Missing 'data' parameter" }, { status: 400 });
  }
  const sizeRaw = url.searchParams.get("size");
  const size = sizeRaw ? Math.max(64, Math.min(2000, parseInt(sizeRaw, 10) || 400)) : 400;
  const format = (url.searchParams.get("format") || "png").toLowerCase();
  const dark = url.searchParams.get("dark") || undefined;
  const light = url.searchParams.get("light") || undefined;

  try {
    if (format === "svg") {
      const svg = await qrSvg(data, {
        size,
        color: { dark, light },
      });
      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }
    const png = await qrPng(data, {
      size,
      color: { dark, light },
    });
    return new Response(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown QR error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

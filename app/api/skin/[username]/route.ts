import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  if (!/^[a-zA-Z0-9_]{1,16}$/.test(username)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const res = await fetch(
    `https://minotar.net/skin/${encodeURIComponent(username)}`,
  );

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

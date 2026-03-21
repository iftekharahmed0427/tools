import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;

  if (!/^[a-f0-9-]{32,36}$/i.test(uuid)) {
    return NextResponse.json({ error: "Invalid UUID" }, { status: 400 });
  }

  const res = await fetch(
    `https://crafatar.com/skins/${uuid}?default=MHF_Steve`,
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

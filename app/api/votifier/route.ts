import { NextRequest, NextResponse } from "next/server";
import { sendVotifierVote } from "minecraft-toolkit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { host, port, publicKey, token, serviceName, username, address, protocol } = body;

    if (!host || !username) {
      return NextResponse.json(
        { error: "Host and username are required" },
        { status: 400 },
      );
    }

    const result = await sendVotifierVote({
      host,
      port: port || 8192,
      publicKey: publicKey || undefined,
      token: token || undefined,
      serviceName: serviceName || "GravelHost Tools",
      username,
      address: address || "127.0.0.1",
      protocol: protocol || "auto",
    });

    return NextResponse.json({
      success: result.acknowledged,
      version: result.version,
      protocol: result.protocol,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

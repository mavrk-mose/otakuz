import { NextResponse } from "next/server";
import { ADSENSE_CLIENT_ID } from '@/lib/adsense-config';

export async function GET() {
  const rawClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || ADSENSE_CLIENT_ID;
  const publisherId = rawClient.replace(/^ca-/, "");

  const body =
    publisherId && publisherId.startsWith("pub-")
      ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
      : "# Set NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX in your environment to populate ads.txt automatically\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

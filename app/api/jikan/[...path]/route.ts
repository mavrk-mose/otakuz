import { NextRequest, NextResponse } from 'next/server';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join('/');
  const search = req.nextUrl.search; // preserves ?filter=tuesday&kids=false etc.
  const targetUrl = `${JIKAN_BASE}/${targetPath}${search}`;

  // simple retry on 429 (Jikan rate limit), max 2 retries
  let attempt = 0;
  let res: Response;
  do {
    res = await fetch(targetUrl, { next: { revalidate: 3600 } }); // cache 1hr at the edge
    if (res.status !== 429) break;
    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    attempt++;
  } while (attempt < 2);

  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    return NextResponse.json(
      { error: `Jikan request failed with status ${res.status}` },
      { status: res.status || 502 }
    );
  }

  return NextResponse.json(data);
}
import {NextRequest, NextResponse} from 'next/server';

export async function GET(
    req: NextRequest,
    {params}: { params: Promise<{ path: string[] }> }
) {
    const jikanBase = process.env.JIKAN_API_URL;

    if (!jikanBase) {
        return NextResponse.json(
            { error: 'JIKAN_API_URL environment variable is not configured' },
            { status: 500 }
        );
    }

    const {path} = await params;
    const jikanUrl = jikanBase.replace(/\/$/, '');
    const targetPath = path.join('/');
    const search = req.nextUrl.search;

    const targetUrl = `${jikanUrl}/${targetPath}${search}`;

    // Simple retry on 429, max 2 retries
    let attempt = 0;
    let res: Response;

    do {
        res = await fetch(targetUrl, {
            next: {revalidate: 3600},
        });

        if (res.status !== 429) break;

        await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
        );

        attempt++;
    } while (attempt < 2);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
        return NextResponse.json(
            {
                error: `Jikan request failed with status ${res.status}`,
            },
            {
                status: res.status || 502,
            }
        );
    }

    return NextResponse.json(data);
}
